import { NextResponse } from "next/server";
import { askSupportAssistantWithGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { question, history } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { success: false, error: "Question is required." },
        { status: 400 }
      );
    }

    const answer = await askSupportAssistantWithGemini(question, history || []);

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error: any) {
    console.error("AI Support Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process question." },
      { status: 500 }
    );
  }
}
