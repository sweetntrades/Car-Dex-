export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { image } = req.body || {};
    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return res.status(400).json({ error: "A car image is required." });
    }
    if (image.length > 12_000_000) {
      return res.status(413).json({ error: "Image is too large. Please choose a smaller photo." });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the backend." });
    }

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        make: { type: "string" },
        model: { type: "string" },
        generation: { type: "string" },
        year: { type: "string" },
        trim: { type: "string" },
        confidence: { type: "integer", minimum: 0, maximum: 100 },
        rarity: { type: "string", enum: ["Common","Uncommon","Rare","Epic","Legendary"] },
        rarityColor: { type: "string" },
        engine: { type: "string" },
        horsepower: { type: "string" },
        torque: { type: "string" },
        zeroTo60: { type: "string" },
        weight: { type: "string" },
        topSpeed: { type: "string" },
        drive: { type: "string" },
       unitsProduced: { type: "string" },
value: { type: "string" },
valueType: { type: "string", enum: ["Estimated Current Value","Original MSRP"] },
notes: { type: "string" }
      },
    required: ["make","model","generation","year","trim","confidence","rarity","rarityColor","engine","horsepower","torque","zeroTo60","weight","topSpeed","drive","unitsProduced","value","valueType","notes"]
    };

    const prompt = `
You are the vehicle-identification engine for CAR-DEX, a car spotting collectible-card app.

Identify the PRIMARY car in the supplied image. Be conservative and evidence-based.

IMPORTANT:
- Do not guess a different vehicle just because it is a famous performance car.
- First determine the manufacturer from visible badges, grille, headlights, body shape, wheels, proportions and other cues.
- Then determine the exact model family.
- Then determine generation/chassis and trim only if the visual evidence supports it.
- Distinguish BMW M3 from BMW M4 and ordinary 3 Series; distinguish M3 variants when possible.
- After identifying the vehicle, provide common specifications.
- Also provide the vehicle's value in USD.
- If the make and model can be identified, ALWAYS provide a value.
- First try to provide a reasonable approximate current-market USD value for the identified vehicle.
- If a current-market value cannot reasonably be estimated, provide the approximate original U.S. MSRP instead and set "valueType" to "Original MSRP".
- Do NOT return "Not verified" for value merely because the exact year or trim is uncertain.
- Only return "Not verified" for both "value" and "valueType" if the make and model themselves cannot be identified with reasonable confidence.
- Never present an original MSRP as a current-market value.
- Never invent exact production numbers. If you cannot verify them from reliable knowledge, return "Not verified".
- If a spec depends on an exact trim/year that cannot be established from the photo, return "Not verified" rather than fabricating precision.
- Year should be an approximate model year only when visually supportable; otherwise "Not verified".
- Confidence is confidence in the VEHICLE IDENTIFICATION, not confidence in the specifications.
- Rarity is a CAR-DEX collectible classification, not a market valuation. Use Common/Uncommon/Rare/Epic/Legendary based on relative rarity and enthusiast significance, but do not use rarity to influence identification.
- Output only the requested JSON.

For the supplied image, carefully inspect the car before answering.
`;

    const body = {
      model: process.env.OPENAI_MODEL || "gpt-5.6-sol",
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: image, detail: "high" }
        ]
      }],
      text: {
        format: {
          type: "json_schema",
          name: "car_identification",
          strict: true,
          schema
        }
      }
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const raw = await response.text();
    if (!response.ok) {
      let detail = raw;
      try { detail = JSON.parse(raw)?.error?.message || raw; } catch {}
      return res.status(response.status).json({ error: `OpenAI request failed: ${detail}` });
    }

    const data = JSON.parse(raw);
    let text = data.output_text;
    if (!text && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === "message" && Array.isArray(item.content)) {
          for (const part of item.content) {
            if (part.type === "output_text" && part.text) text = part.text;
          }
        }
      }
    }
    if (!text) return res.status(502).json({ error: "The AI returned no vehicle result." });

    let car;
    try { car = JSON.parse(text); }
    catch { return res.status(502).json({ error: "The AI returned an invalid vehicle result." }); }

    return res.status(200).json(car);
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Unexpected backend error." });
  }
}
