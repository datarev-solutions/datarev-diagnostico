import { NextResponse } from "next/server";
import { FRONTIER_MODELS, type LlmModel } from "@/lib/llmModels";

export async function GET(request: Request) {
  // Verify authorization header if CRON_SECRET is set
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let updatedModels: LlmModel[] = [...FRONTIER_MODELS];

    // Attempt to fetch latest OpenRouter pricing data
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        // Map OpenRouter models to local models where matching
        const orModels = data.data;
        updatedModels = FRONTIER_MODELS.map((m) => {
          const match = orModels.find(
            (om: { id: string; name?: string }) =>
              om.id.toLowerCase().includes(m.name.toLowerCase().replace(/\s+/g, "-")) ||
              (om.name && om.name.toLowerCase().includes(m.name.toLowerCase()))
          );
          if (match && match.pricing) {
            const pin = parseFloat(match.pricing.prompt) * 1e6 || m.pin;
            const pout = parseFloat(match.pricing.completion) * 1e6 || m.pout;
            return {
              ...m,
              pin: pin > 0 ? pin : m.pin,
              pout: pout > 0 ? pout : m.pout,
            };
          }
          return m;
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      modelsUpdated: updatedModels.length,
      models: updatedModels,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message, fallbackModels: FRONTIER_MODELS },
      { status: 500 }
    );
  }
}
