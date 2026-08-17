import { NextResponse } from "next/server";
import { FRONTIER_MODELS } from "@/lib/llmModels";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    // Return standard frontier models list with last updated timestamp
    return NextResponse.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      models: FRONTIER_MODELS,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, models: FRONTIER_MODELS, error: (error as Error).message },
      { status: 500 }
    );
  }
}
