import { NextResponse } from "next/server";
import { generateSellerCopilotSuggestions } from "@/lib/ai-assistant";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemType, brand, model, condition, userNotes } = body;

    if (!itemType || !condition) {
      return NextResponse.json(
        { success: false, error: "Item type and condition are required." },
        { status: 400 }
      );
    }

    const suggestions = await generateSellerCopilotSuggestions({
      itemType,
      brand,
      model,
      condition,
      userNotes,
    });

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error: any) {
    console.error("Seller Copilot error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate seller suggestions." },
      { status: 500 }
    );
  }
}
