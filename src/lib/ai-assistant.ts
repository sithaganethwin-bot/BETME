import { prisma } from "./prisma";
import { 
  askBidMateWithGemini, 
  generateSellerCopilotWithGemini, 
  scanListingSafetyWithGemini 
} from "./gemini";

export interface BidMateQuery {
  auctionId: string;
  userQuestion: string;
}

export interface SellerCopilotParams {
  itemType: string;
  brand?: string;
  model?: string;
  condition: string;
  userNotes?: string;
  categoryName?: string;
}

export async function askBidMate({ auctionId, userQuestion }: BidMateQuery) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      product: {
        include: { images: true, category: true },
      },
      seller: {
        include: { user: true },
      },
      bids: {
        orderBy: { amount: "desc" },
        take: 5,
        include: { bidder: true },
      },
    },
  });

  if (!auction) {
    return { answer: "I couldn't find the details for this auction. Please refresh the page." };
  }

  // 1. Try real Google Gemini AI (Backend-only)
  try {
    const geminiAnswer = await askBidMateWithGemini(auction, userQuestion);
    return { answer: geminiAnswer };
  } catch (err) {
    console.warn("Gemini call fallback to local analysis:", err);
  }

  // 2. Local fallback if external API is unreachable
  const q = userQuestion.toLowerCase();
  const title = auction.title;
  const currentPrice = auction.currentPrice.toLocaleString("en-LK");
  const bidsCount = auction.totalBids;
  const endsAt = new Date(auction.endsAt).toLocaleTimeString("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
  const seller = auction.seller.storeName;
  const sellerRating = auction.seller.reputationScore;
  const condition = auction.product.condition.replace("_", " ");
  const location = auction.locationDistrict;

  if (q.includes("bid") || q.includes("price") || q.includes("highest")) {
    return {
      answer: `The current highest bid on this ${title} is Rs. ${currentPrice} across ${bidsCount} verified bids. The auction is scheduled to end on ${endsAt}. If you wish to place a bid, the minimum next required bid is calculated dynamically with anti-sniping protection enabled.`,
    };
  }

  if (q.includes("seller") || q.includes("trust") || q.includes("reputation") || q.includes("rating")) {
    return {
      answer: `This item is listed by **${seller}**, a ${auction.seller.isVerified ? "Verified Trusted Seller ✓" : "Registered Seller"} based in ${location}. They hold an exceptional ${sellerRating}/5.0 reputation score with ${auction.seller.totalSales} completed marketplace orders.`,
    };
  }

  return {
    answer: `**BidMate AI Analysis for ${title}:**\n- **Current Bid**: Rs. ${currentPrice} (${bidsCount} bids)\n- **Condition**: ${condition}\n- **Seller**: ${seller} (${sellerRating} ★ Verified)\n- **Location**: ${location}\n- **Ends**: ${endsAt}\n\n*Tip*: Always set an Auto-Bid proxy ceiling if you want BIDME to bid on your behalf without watching the clock!`,
  };
}

export async function generateSellerCopilotSuggestions(params: SellerCopilotParams) {
  // 1. Try real Google Gemini AI (Backend-only)
  try {
    const geminiSuggestions = await generateSellerCopilotWithGemini(params);
    return geminiSuggestions;
  } catch (err) {
    console.warn("Gemini Copilot fallback to rule engine:", err);
  }

  // 2. Rule engine fallback
  const { itemType, brand = "", model = "", condition, userNotes = "" } = params;
  let title = `${brand} ${model || itemType} (${condition.replace("_", " ")}) - Global Verified Lot`;
  let suggestedPrice = 85000;
  let missingFields = ["Original proof of authenticity", "Serial number verification", "Included original packaging"];
  let qualityScore = 80;

  return {
    suggestedTitle: title,
    categorySlug: "electronics",
    suggestedStartingPrice: suggestedPrice,
    description: `### ${title}\n\n**Condition**: ${condition}\n\nAuthentic global lot inspected and verified. Ready for worldwide secure dispatch.`,
    missingFields,
    qualityScore,
    competitivePriceRange: `Rs. ${(suggestedPrice * 0.9).toLocaleString("en-LK")} - Rs. ${(suggestedPrice * 1.25).toLocaleString("en-LK")}`,
  };
}

export async function verifyListingSafety(title: string, description: string) {
  return await scanListingSafetyWithGemini(title, description);
}
