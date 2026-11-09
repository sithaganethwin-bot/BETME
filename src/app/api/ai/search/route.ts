import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseNaturalLanguageSearchWithGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: "Query string is required" },
        { status: 400 }
      );
    }

    // 1. Parse natural language intent using server-side Google Gemini
    const parsed = await parseNaturalLanguageSearchWithGemini(query);

    // 2. Query database using structured criteria
    const whereClause: any = {
      status: "LIVE",
    };

    if (parsed.categorySlug) {
      whereClause.categoryId = parsed.categorySlug;
    }

    if (parsed.district) {
      whereClause.locationDistrict = {
        contains: parsed.district,
      };
    }

    if (parsed.maxPrice) {
      whereClause.currentPrice = {
        ...(whereClause.currentPrice || {}),
        lte: parsed.maxPrice,
      };
    }

    if (parsed.minPrice) {
      whereClause.currentPrice = {
        ...(whereClause.currentPrice || {}),
        gte: parsed.minPrice,
      };
    }

    // If keywords exist, match against title or product description
    if (parsed.keywords && parsed.keywords.length > 0) {
      whereClause.OR = parsed.keywords.slice(0, 4).map((kw) => ({
        title: {
          contains: kw,
        },
      }));
    }

    let results = await prisma.auction.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            images: true,
          },
        },
        category: true,
        seller: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        currentPrice: "asc",
      },
    });

    // Fallback: If strict whereClause yielded 0 results, do a broader search
    if (results.length === 0) {
      results = await prisma.auction.findMany({
        where: {
          status: "LIVE",
          OR: [
            { title: { contains: query.split(" ")[0] || "" } },
            { product: { description: { contains: query.split(" ")[0] || "" } } },
          ],
        },
        include: {
          product: {
            include: {
              images: true,
            },
          },
          category: true,
          seller: {
            include: {
              user: true,
            },
          },
        },
        take: 8,
      });
    }

    // Format results with lot numbers and images
    const formatted = results.map((auc, idx) => ({
      ...auc,
      lotNumber: 4090 + idx,
      images: auc.product?.images?.length
        ? auc.product.images.map((img) => img.url)
        : [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
          ],
    }));

    return NextResponse.json({
      success: true,
      parsedQuery: parsed,
      count: formatted.length,
      auctions: formatted,
    });
  } catch (error: any) {
    console.error("AI Search Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute AI search" },
      { status: 500 }
    );
  }
}
