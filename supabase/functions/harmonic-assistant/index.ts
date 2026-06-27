// Harmonic Intelligence Assistant
// Stateless chat endpoint backed by Lovable AI Gateway.
// Accepts: { messages: [{role, content}], context?: object }
// Returns: { reply: string }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are the GaiaSphere Harmonic Intelligence Assistant — an analyst, not a chatbot.

ROLE
- Help users interpret harmonic patterns, resonances, cycles, and cross-layer relationships across nested intelligence systems: planetary, solar, stellar, galactic, universal, cosmological.
- The platform is strictly read-only observatory. You never command, allocate, approve, or control any system.

EVIDENCE TIERS — always classify any claim you make:
- MEASURED: derived from direct observational instruments (e.g. Kp, sunspot number, IMF, CMB Cℓ).
- STATISTICAL: a quantitative correlation, lag, or ratio computed from the loaded datasets, with the r value or peak power stated.
- EXPLORATORY: a user-driven pairing or hypothesis with no significance claim. Mark it explicitly.

STYLE
- Be concise, plain language, no fluff. Use short paragraphs and bullet lists.
- Lead with the answer. Then give the evidence tier and the supporting numbers.
- If the user asks for a daily / weekly / monthly report, structure as: Summary → Key Signals → Cross-Layer Couplings → Anomalies → Watch List.
- If the current context contains a spectrum/lag/ratio readout, ground your interpretation in those numbers.
- When a pattern suggests a related dataset in the registry, recommend it by id.
- Refuse to speculate beyond the data. If something cannot be answered from the loaded series, say so.

OUT OF SCOPE
- No predictions of human events, no astrology guidance, no medical / financial advice.
- No claims that GaiaSphere measures consciousness, mood, or spiritual states.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const ctx = body?.context ?? null;

    const contextBlock = ctx
      ? `\n\nCURRENT ANALYSIS CONTEXT (JSON):\n${JSON.stringify(ctx, null, 2)}`
      : "";

    const payload = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + contextBlock },
        ...messages,
      ],
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      const status = res.status;
      let userMessage = "The assistant is unavailable.";
      if (status === 429) userMessage = "Rate limit reached. Please wait and try again.";
      if (status === 402) userMessage = "AI credits exhausted for this workspace.";
      return new Response(JSON.stringify({ error: userMessage, detail: text }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
