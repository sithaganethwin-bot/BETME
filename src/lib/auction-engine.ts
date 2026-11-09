import { prisma } from "./prisma";
import { calculateBidIncrement } from "./utils";

export interface PlaceBidParams {
  auctionId: string;
  bidderId: string;
  amount: number;
  ipAddress?: string;
}

export interface AutoBidParams {
  auctionId: string;
  userId: string;
  maxAmount: number;
}

export async function placeBid({ auctionId, bidderId, amount, ipAddress = "127.0.0.1" }: PlaceBidParams) {
  // Security: Input validation & sanity checks
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid bid amount. Must be a positive numerical value.");
  }
  if (amount > 1_000_000_000) {
    throw new Error("Bid amount exceeds the platform ceiling of Rs. 1,000,000,000.");
  }
  if (!auctionId || typeof auctionId !== "string") {
    throw new Error("Invalid auction identifier.");
  }

  return await prisma.$transaction(async (tx) => {
    // 0. Resolve or ensure bidder exists
    let bidder = await tx.user.findUnique({ where: { id: bidderId } });
    if (!bidder) {
      bidder = await tx.user.findFirst();
      if (bidder) {
        bidderId = bidder.id;
      }
    }

    // 1. Fetch auction
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: {
        seller: true,
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
        },
      },
    });

    if (!auction) {
      throw new Error("Auction does not exist.");
    }

    // 2. Status validation
    if (auction.status !== "LIVE") {
      throw new Error(`Auction is not open for bidding (Current status: ${auction.status}).`);
    }

    // 3. Expiry validation
    const now = new Date();
    if (new Date(auction.endsAt) <= now) {
      // Mark as ended if expired
      await tx.auction.update({
        where: { id: auctionId },
        data: { status: "ENDED" },
      });
      throw new Error("Auction has already ended.");
    }

    // 4. Seller cannot bid on own listing
    if (auction.seller.userId === bidderId) {
      throw new Error("Sellers are prohibited from bidding on their own listings.");
    }

    // 5. Calculate minimum next bid requirement
    const highestBid = auction.bids.length > 0 ? auction.bids[0].amount : auction.startingPrice;
    const increment = calculateBidIncrement(highestBid);
    const minNextBid = auction.totalBids === 0 ? auction.startingPrice : highestBid + increment;

    if (amount < minNextBid) {
      throw new Error(
        `Bid must be at least Rs. ${minNextBid.toLocaleString("en-LK")} (Current: Rs. ${highestBid.toLocaleString("en-LK")} + min increment Rs. ${increment.toLocaleString("en-LK")})`
      );
    }

    // 6. Anti-sniping soft close check:
    // If bid arrives within the last 2 minutes (120 seconds), extend endsAt by +2 minutes
    const remainingMs = new Date(auction.endsAt).getTime() - now.getTime();
    let newEndsAt = auction.endsAt;
    let extensionTriggered = false;

    if (remainingMs < 120 * 1000) {
      newEndsAt = new Date(now.getTime() + 120 * 1000);
      extensionTriggered = true;
    }

    // 7. Insert the new valid bid
    const newBid = await tx.bid.create({
      data: {
        auctionId,
        bidderId,
        amount,
        ipAddress,
        isAutoBid: false,
      },
      include: {
        bidder: {
          select: { id: true, name: true, avatarUrl: true, buyerScore: true },
        },
      },
    });

    // 8. Update auction state
    const updatedAuction = await tx.auction.update({
      where: { id: auctionId },
      data: {
        currentPrice: amount,
        totalBids: { increment: 1 },
        endsAt: newEndsAt,
        extensionCount: extensionTriggered ? { increment: 1 } : undefined,
      },
    });

    // 9. Record Audit Log
    await tx.auditLog.create({
      data: {
        userId: bidderId,
        action: "BID_PLACED",
        entity: "Auction",
        entityId: auctionId,
        ipAddress,
        details: JSON.stringify({
          amount,
          previousBid: highestBid,
          antiSnipingExtended: extensionTriggered,
          newEndsAt: newEndsAt.toISOString(),
        }),
      },
    });

    // 10. Process any active auto-bids (proxy bidding) from competing bidders
    const autoBidResult = await processAutoBids(tx, auctionId, bidderId, amount, newEndsAt);

    return {
      bid: autoBidResult?.lastPlacedBid || newBid,
      auction: autoBidResult?.finalAuction || updatedAuction,
      extensionTriggered,
    };
  });
}

// ============================================================================
// PROXY AUTO-BIDDING ENGINE
// Automatically counters rival bids up to the user's pre-configured ceiling.
// Handles single counter-bids, proxy duels (two automated ceilings), and ties.
// ============================================================================
async function processAutoBids(
  tx: any,
  auctionId: string,
  initialLeaderId: string,
  initialPrice: number,
  currentEndsAt: Date
) {
  let currentLeaderId = initialLeaderId;
  let currentPrice = initialPrice;
  let lastPlacedBid: any = null;

  // Maximum rounds safety cap to prevent any possible infinite recursion
  for (let iteration = 0; iteration < 20; iteration++) {
    // 1. Find the highest active auto-bid rule belonging to someone OTHER than current leader
    const challengerRule = await tx.autoBidRule.findFirst({
      where: {
        auctionId,
        userId: { not: currentLeaderId },
        isActive: true,
        maxAmount: { gt: currentPrice },
      },
      orderBy: [
        { maxAmount: "desc" },
        { createdAt: "asc" }, // Earlier set ceiling wins ties
      ],
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, buyerScore: true } },
      },
    });

    if (!challengerRule) {
      // No competitor has an active auto-bid ceiling higher than currentPrice
      break;
    }

    // 2. Check if current leader ALSO has an active auto-bid ceiling (Proxy Duel)
    const leaderRule = await tx.autoBidRule.findFirst({
      where: {
        auctionId,
        userId: currentLeaderId,
        isActive: true,
        maxAmount: { gte: currentPrice },
      },
    });

    const increment = calculateBidIncrement(currentPrice);

    if (leaderRule) {
      // DUEL RESOLUTION: Both bidders have automated ceilings
      if (challengerRule.maxAmount > leaderRule.maxAmount) {
        // Challenger ceiling is higher:
        // Leader bids up to their ceiling to defend
        const leaderCeiling = leaderRule.maxAmount;
        if (leaderCeiling > currentPrice) {
          await tx.bid.create({
            data: {
              auctionId,
              bidderId: leaderRule.userId,
              amount: leaderCeiling,
              isAutoBid: true,
              ipAddress: "auto-bid-engine",
            },
          });
          currentPrice = leaderCeiling;
        }

        // Challenger counter-bids with next increment above leader's ceiling
        const nextInc = calculateBidIncrement(currentPrice);
        const challengerCounter = Math.min(challengerRule.maxAmount, currentPrice + nextInc);

        const newChallengerBid = await tx.bid.create({
          data: {
            auctionId,
            bidderId: challengerRule.userId,
            amount: challengerCounter,
            isAutoBid: true,
            ipAddress: "auto-bid-engine",
          },
          include: {
            bidder: { select: { id: true, name: true, avatarUrl: true, buyerScore: true } },
          },
        });

        currentPrice = challengerCounter;
        currentLeaderId = challengerRule.userId;
        lastPlacedBid = newChallengerBid;

        // Deactivate exhausted leader rule
        await tx.autoBidRule.update({
          where: { id: leaderRule.id },
          data: { isActive: false },
        });

        // Continue in case a third competitor rule exists
        continue;
      } else if (leaderRule.maxAmount > challengerRule.maxAmount) {
        // Leader ceiling is higher:
        // Challenger bids up to their ceiling
        const challengerCeiling = challengerRule.maxAmount;
        if (challengerCeiling > currentPrice) {
          await tx.bid.create({
            data: {
              auctionId,
              bidderId: challengerRule.userId,
              amount: challengerCeiling,
              isAutoBid: true,
              ipAddress: "auto-bid-engine",
            },
          });
          currentPrice = challengerCeiling;
        }

        // Leader counter-bids with next increment above challenger ceiling
        const nextInc = calculateBidIncrement(currentPrice);
        const leaderCounter = Math.min(leaderRule.maxAmount, currentPrice + nextInc);

        const newLeaderBid = await tx.bid.create({
          data: {
            auctionId,
            bidderId: leaderRule.userId,
            amount: leaderCounter,
            isAutoBid: true,
            ipAddress: "auto-bid-engine",
          },
          include: {
            bidder: { select: { id: true, name: true, avatarUrl: true, buyerScore: true } },
          },
        });

        currentPrice = leaderCounter;
        currentLeaderId = leaderRule.userId;
        lastPlacedBid = newLeaderBid;

        // Deactivate exhausted challenger rule
        await tx.autoBidRule.update({
          where: { id: challengerRule.id },
          data: { isActive: false },
        });

        // Continue loop to verify if other rules exist
        continue;
      } else {
        // EQUAL CEILING TIE: First rule registered wins
        const leaderWasFirst = leaderRule.createdAt <= challengerRule.createdAt;
        const winnerId = leaderWasFirst ? leaderRule.userId : challengerRule.userId;
        const loserRule = leaderWasFirst ? challengerRule : leaderRule;

        const tiedBid = await tx.bid.create({
          data: {
            auctionId,
            bidderId: winnerId,
            amount: leaderRule.maxAmount,
            isAutoBid: true,
            ipAddress: "auto-bid-engine",
          },
          include: {
            bidder: { select: { id: true, name: true, avatarUrl: true, buyerScore: true } },
          },
        });

        currentPrice = leaderRule.maxAmount;
        currentLeaderId = winnerId;
        lastPlacedBid = tiedBid;

        await tx.autoBidRule.update({
          where: { id: loserRule.id },
          data: { isActive: false },
        });

        break;
      }
    } else {
      // SINGLE CHALLENGER COUNTER-BID (Current leader was a manual bidder or has no active ceiling)
      const counterBidAmount = Math.min(challengerRule.maxAmount, currentPrice + increment);

      if (counterBidAmount <= currentPrice) {
        break;
      }

      const newBid = await tx.bid.create({
        data: {
          auctionId,
          bidderId: challengerRule.userId,
          amount: counterBidAmount,
          isAutoBid: true,
          ipAddress: "auto-bid-engine",
        },
        include: {
          bidder: { select: { id: true, name: true, avatarUrl: true, buyerScore: true } },
        },
      });

      currentPrice = counterBidAmount;
      currentLeaderId = challengerRule.userId;
      lastPlacedBid = newBid;

      await tx.auditLog.create({
        data: {
          userId: challengerRule.userId,
          action: "AUTO_BID_TRIGGERED",
          entity: "Auction",
          entityId: auctionId,
          details: JSON.stringify({
            amount: counterBidAmount,
            maxCeiling: challengerRule.maxAmount,
          }),
        },
      });

      // If challenger has now reached their ceiling, mark inactive
      if (counterBidAmount >= challengerRule.maxAmount) {
        await tx.autoBidRule.update({
          where: { id: challengerRule.id },
          data: { isActive: false },
        });
      }
    }
  }

  // Deactivate any rules whose ceiling has been exceeded by current price
  await tx.autoBidRule.updateMany({
    where: {
      auctionId,
      maxAmount: { lte: currentPrice },
      userId: { not: currentLeaderId },
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  // Calculate accurate total bid count and fetch updated auction record
  const totalBidsCount = await tx.bid.count({ where: { auctionId } });
  const finalAuction = await tx.auction.update({
    where: { id: auctionId },
    data: {
      currentPrice,
      totalBids: totalBidsCount,
    },
    include: {
      bids: {
        orderBy: { amount: "desc" },
        take: 10,
        include: {
          bidder: { select: { id: true, name: true, avatarUrl: true, buyerScore: true } },
        },
      },
    },
  });

  return {
    finalPrice: currentPrice,
    currentLeaderId,
    lastPlacedBid,
    finalAuction,
  };
}

export async function setAutoBid({ auctionId, userId, maxAmount }: AutoBidParams) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      bids: {
        orderBy: { amount: "desc" },
        take: 1,
      },
    },
  });

  if (!auction || auction.status !== "LIVE") {
    throw new Error("Auction is not open for auto-bidding.");
  }

  const now = new Date();
  if (new Date(auction.endsAt) <= now) {
    throw new Error("Auction has already ended.");
  }

  if (maxAmount <= auction.currentPrice) {
    throw new Error(`Max auto-bid ceiling must be greater than current price (Rs. ${auction.currentPrice.toLocaleString("en-LK")})`);
  }

  // Upsert auto-bid rule
  const rule = await prisma.autoBidRule.upsert({
    where: {
      auctionId_userId: { auctionId, userId },
    },
    update: {
      maxAmount,
      isActive: true,
    },
    create: {
      auctionId,
      userId,
      maxAmount,
      isActive: true,
    },
  });

  // Check if current highest bidder is this user
  const highestBid = auction.bids[0];
  const isAlreadyLeading = highestBid && highestBid.bidderId === userId;

  let resultAuction = auction;
  let resultBid = highestBid;

  if (!isAlreadyLeading) {
    // If not already leading, place the initial entry bid into the auction
    const increment = calculateBidIncrement(auction.currentPrice);
    const initialBid = auction.totalBids === 0
      ? auction.startingPrice
      : Math.min(maxAmount, auction.currentPrice + increment);

    const placeResult = await placeBid({
      auctionId,
      bidderId: userId,
      amount: initialBid,
    });

    resultAuction = placeResult.auction;
    resultBid = placeResult.bid;
  } else {
    // Already leading: fetch fresh auction state to confirm
    const fresh = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 10,
          include: {
            bidder: { select: { id: true, name: true, avatarUrl: true, buyerScore: true } },
          },
        },
      },
    });
    if (fresh) resultAuction = fresh;
  }

  return {
    rule,
    auction: resultAuction,
    bid: resultBid,
  };
}
