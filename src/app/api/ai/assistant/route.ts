import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callGemini } from "@/lib/gemini";
import { formatLKR, formatTimeRemaining } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { message, history = [], context = {} } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message is required." },
        { status: 400 }
      );
    }

    const now = new Date();

    // 1. Retrieve real active database context for RAG grounding
    const liveAuctions = await prisma.auction.findMany({
      where: {
        status: "LIVE",
        endsAt: { gt: now },
      },
      take: 12,
      orderBy: { endsAt: "asc" },
      include: {
        category: true,
        seller: {
          select: { storeName: true, reputationScore: true, isVerified: true },
        },
        product: {
          select: { condition: true, brand: true, model: true },
        },
      },
    });

    const categoryStats = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            auctions: {
              where: { status: "LIVE", endsAt: { gt: now } },
            },
          },
        },
      },
    });

    // Specific auction context if user opened from an auction page
    let activeAuctionContext = null;
    if (context.auctionId) {
      activeAuctionContext = await prisma.auction.findUnique({
        where: { id: context.auctionId },
        include: {
          category: true,
          seller: true,
          product: true,
          bids: { take: 3, orderBy: { amount: "desc" } },
        },
      });
    }

    // Format real listings context for prompt injection
    const listingsSummary = liveAuctions
      .map((a) => {
        const remaining = formatTimeRemaining(a.endsAt).formatted;
        return `• [ID: ${a.id}] "${a.title}" | Category: ${a.category.name} | Current High: ${formatLKR(a.currentPrice)} | Starting: ${formatLKR(a.startingPrice)} | Bids: ${a.totalBids} | Remaining: ${remaining} | Seller: ${a.seller.storeName}`;
      })
      .join("\n");

    const categorySummary = categoryStats
      .map((c) => `${c.name}: ${c._count.auctions} active listings`)
      .join(", ");

    const currentItemPrompt = activeAuctionContext
      ? `CURRENT ITEM VIEWED BY USER:
Title: "${activeAuctionContext.title}" (ID: ${activeAuctionContext.id})
Category: ${activeAuctionContext.category.name}
Current High Bid: ${formatLKR(activeAuctionContext.currentPrice)}
Starting Price: ${formatLKR(activeAuctionContext.startingPrice)}
Total Bids: ${activeAuctionContext.totalBids}
Time Remaining: ${formatTimeRemaining(activeAuctionContext.endsAt).formatted}
Condition: ${activeAuctionContext.product.condition}
`
      : "";

    const systemInstruction = `You are BIDME AI, the authoritative, helpful, and transparent auction discovery assistant for BIDME (Sri Lanka's leading online auction marketplace).
Tagline: "Bid Smart. Own More."
Currency: Sri Lankan Rupees (Rs. / LKR).

MARKETPLACE DATABASE KNOWLEDGE (VERIFIED LIVE FACTS):
Active Listings:
${listingsSummary}

Category Counts:
${categorySummary}

${currentItemPrompt}

RESPONSIBLE AI RULES (MANDATORY):
1. FACTUAL GROUNDING: Rely ONLY on the verified database facts above for prices, auction titles, time remaining, and bid counts. NEVER invent fake listings, artificial prices, or imaginary bidders.
2. PRICE COMPARISONS: If asked about market value or whether an item is a good deal, explain the evidence and confidence based on starting price, current bids, condition, and market context. Do not claim an item is below market value without explaining your rationale.
3. FAIR BIDDING & CHANCES: NEVER guarantee an auction win. NEVER calculate an unsupported percentage chance (e.g. "You have an 85% chance to win"). Instead, analyze realistic factors: current high bid, bid activity, increment steps, and remaining time.
4. ANTI-SNIPING: Explain BIDME's +120s anti-sniping soft close rule (+2 minutes added if any bid lands in the final 2 minutes) whenever relevant.
5. ESCROW & PAYMENTS: Explain PayHere custodial escrow (funds held safe until delivery inspection) and islandwide courier coverage across all 25 districts.
6. NO SINGLE-CLICK BIDS: You cannot submit a binding bid directly; direct the user to the auction's bidding panel or Quick View drawer.
7. LANGUAGE: Respond clearly in English or Sinhala depending on user language. Keep formatting clean with bold titles and bullet points.`;

    const recentHistory = history
      .slice(-4)
      .map((m: any) => `${m.role === "user" ? "User" : "BIDME AI"}: ${m.text}`)
      .join("\n");

    const prompt = `${recentHistory ? `Prior Conversation:\n${recentHistory}\n\n` : ""}User Question: "${message}"

Answer accurately, helpfully, and concisely grounded in the live marketplace data.`;

    let reply = "";
    try {
      reply = await callGemini(prompt, systemInstruction);
    } catch (apiErr) {
      console.warn("Gemini AI API fallback triggered:", apiErr);

      // Intelligent local deterministic fallback grounded in actual DB data
      const lower = message.toLowerCase();
      if (lower.includes("no bid") || lower.includes("zero bid")) {
        const noBids = liveAuctions.filter((a) => a.totalBids === 0);
        if (noBids.length > 0) {
          reply = `Here are active auctions with **no bids yet** starting at opening price:\n\n` +
            noBids.map((a) => `• **${a.title}** — Opening at ${formatLKR(a.startingPrice)} (${formatTimeRemaining(a.endsAt).formatted} left)`).join("\n") +
            `\n\nPlacing the first bid secures your position at the lowest possible entry price!`;
        } else {
          reply = `All currently featured auctions have active bids! Explore the **Recently Added** section to catch newly published lots early.`;
        }
      } else if (lower.includes("30 min") || lower.includes("ending") || lower.includes("soon")) {
        const urgent = liveAuctions.slice(0, 3);
        reply = `Here are the top auctions **ending soonest** on BIDME:\n\n` +
          urgent.map((a) => `• **${a.title}** — High Bid: ${formatLKR(a.currentPrice)} • **${formatTimeRemaining(a.endsAt).formatted} left** (${a.totalBids} bids)`).join("\n") +
          `\n\n*Note: If any bid is placed in the final 2 minutes, our soft-close anti-sniping will automatically add +120s.*`;
      } else if (lower.includes("electronics") || lower.includes("phone") || lower.includes("laptop") || lower.includes("camera") || lower.includes("watch")) {
        const techLots = liveAuctions.filter((a) => 
          ["computers", "phones", "cameras", "watches"].includes(a.category.slug)
        );
        reply = `Here are active verified tech & luxury lots available now:\n\n` +
          techLots.slice(0, 4).map((a) => `• **${a.title}** (${a.category.name}) — High Bid: ${formatLKR(a.currentPrice)} • ${a.totalBids} bids`).join("\n");
      } else {
        reply = `Ayubowan! 👋 All listings on BIDME are verified with **anti-sniping protection** (+120s extension) and **PayHere custodial escrow**.\n\nWe currently have **${liveAuctions.length} featured active auctions** open for bidding. What specific category or item are you looking to explore?`;
      }
    }

    return NextResponse.json({
      success: true,
      reply,
      groundedItemsCount: liveAuctions.length,
    });
  } catch (error: any) {
    console.error("BIDME AI Assistant Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate AI response." },
      { status: 500 }
    );
  }
}
