import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const ALLOWED_DOSHA_TYPES = new Set(["vata", "pitta", "kapha", "tridosha", "Unknown"]);
const ALLOWED_PAYLOAD_KEYS = new Set(["symptoms", "doshaType", "additionalContext"]);

function sanitizeText(str: unknown): string {
  if (typeof str !== "string") return "";
  // Strip control characters and HTML tags
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").replace(/<[^>]*>/g, "").trim();
}

const AYURVEDIC_SYSTEM_PROMPT = `You are an expert Ayurvedic wellness advisor with deep knowledge of traditional Indian medicine, the three doshas (Vata, Pitta, Kapha), and holistic health practices.

When a user describes their symptoms and dosha type, provide:

1. **Ayurvedic Analysis**: Explain how the symptoms relate to dosha imbalances based on traditional Ayurvedic principles.

2. **Dietary Recommendations**: Suggest specific foods, spices, and dietary habits that can help restore balance. Include:
   - Foods to favor
   - Foods to avoid
   - Beneficial spices and herbs
   - Optimal meal timing

3. **Lifestyle Practices**: Recommend daily routines (dinacharya) and practices:
   - Morning rituals
   - Exercise suggestions (yoga asanas, pranayama)
   - Self-care practices (abhyanga, etc.)
   - Sleep hygiene

4. **Herbal Remedies**: Suggest traditional Ayurvedic herbs and formulations that may help (with clear disclaimer that these are suggestions, not medical prescriptions).

5. **Mind-Body Connection**: Address the emotional/mental aspects related to the symptoms from an Ayurvedic perspective.

IMPORTANT GUIDELINES:
- Always emphasize that your advice is for educational purposes and does not replace professional medical consultation
- Be respectful of the ancient wisdom while making it accessible and practical
- Consider the person's specific dosha constitution when giving personalized advice
- Use Sanskrit terms with English explanations where appropriate
- Keep responses warm, supportive, and encouraging
- Format your response with clear sections using markdown

If symptoms seem serious or indicate a medical emergency, strongly advise seeking immediate professional medical care.`;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Body size limit check: max 50KB (51,200 bytes)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 51200) {
      return new Response(
        JSON.stringify({ error: "Payload too large. Maximum size is 50KB." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawBody = await req.json();
    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reject unknown/extra fields
    for (const key of Object.keys(rawBody)) {
      if (!ALLOWED_PAYLOAD_KEYS.has(key)) {
        return new Response(
          JSON.stringify({ error: `Unrecognized or forbidden field: ${key}` }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const sanitizedSymptoms = sanitizeText(rawBody.symptoms);
    if (!sanitizedSymptoms || sanitizedSymptoms.length < 3) {
      return new Response(
        JSON.stringify({ error: "Please describe your symptoms (at least 3 characters)" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (sanitizedSymptoms.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Symptoms description exceeds maximum length of 2000 characters" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedContext = rawBody.additionalContext ? sanitizeText(rawBody.additionalContext) : "";
    if (sanitizedContext.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Additional context exceeds maximum length of 1000 characters" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let validDosha = "Unknown";
    if (rawBody.doshaType && ALLOWED_DOSHA_TYPES.has(rawBody.doshaType)) {
      validDosha = rawBody.doshaType;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userMessage = `
My Dosha Type: ${validDosha}

My Symptoms:
${sanitizedSymptoms}

${sanitizedContext ? `Additional Context: ${sanitizedContext}` : ""}

Please provide personalized Ayurvedic recommendations based on my dosha type and symptoms.
`;

    console.log("Calling Lovable AI Gateway for symptom analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: AYURVEDIC_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return streaming response
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Symptom checker error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
