import { NextResponse } from "next/server";
import { verifyListingSafety } from "@/lib/ai-assistant";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required for safety scan." },
        { status: 400 }
      );
    }

    const safetyResult = await verifyListingSafety(title, description || "");
    return NextResponse.json({
      success: true,
      safety: safetyResult,
    });
  } catch (error: any) {
    console.error("AI Moderation Scan Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to scan listing safety." },
      { status: 500 }
    );
  }
}
