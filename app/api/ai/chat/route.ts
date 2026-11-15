import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquante" },
        { status: 503 }
      );
    }

    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey });

    const body = await req.json();
    const {
      imageBase64,
      description = "",
      educationLevel = "LYCEE",
      subjects = [],
    } = body;

    if (!imageBase64 && !description) {
      return NextResponse.json(
        { error: "Image ou description requise" },
        { status: 400 }
      );
    }

    const systemContent = `Tu es Ada, un tuteur socratique. Analyse le devoir et guide l'élève avec des questions. Ne donne jamais la réponse complète directement.
Niveau : ${educationLevel}
Matières : ${subjects.join(", ") || "non spécifiées"}`;

    const userContent: any[] = [];

    if (description) {
      userContent.push({
        type: "text",
        text: `Description :\n${description}`,
      });
    }

    if (imageBase64) {
      const url = imageBase64.startsWith("data:")
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;

      userContent.push({
        type: "image_url",
        image_url: { url, detail: "high" },
      });

      if (!description) {
        userContent.unshift({
          type: "text",
          text: "Voici la photo de mon devoir. Guide-moi sans me donner les réponses.",
        });
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
      temperature: 0.6,
      max_tokens: 600,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "J’ai bien reçu ton devoir. Quelle question veux-tu traiter en premier ?";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("[Homework Vision Error]", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de l’analyse du devoir" },
      { status: 500 }
    );
  }
}