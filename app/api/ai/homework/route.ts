/**
 * POST /api/ai/homework
 *
 * Accepts a homework image (base64) + optional description.
 * Uses GPT-4o Vision to analyze the exercise, then returns
 * a first Socratic guidance message (never the full solution).
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { HOMEWORK_CORRECTION_PROMPT } from "@/prompts/socratic-tutor";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquante. Ajoute-la dans .env.local" },
        { status: 503 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const body = await req.json();

    const {
      imageBase64, // data:image/jpeg;base64,... or pure base64
      description = "",
      educationLevel = "LYCEE",
      subjects = []
    } = body;

    if (!imageBase64 && !description) {
      return NextResponse.json(
        { error: "Image ou description requise" },
        { status: 400 }
      );
    }

    const levelHint: Record<string, string> = {
      PRIMAIRE: "L'élève est en primaire. Langage très simple.",
      COLLEGE: "L'élève est au collège.",
      LYCEE: "L'élève est au lycée.",
      SUPERIEUR: "L'élève est en études supérieures. Sois rigoureux.",
      PRO_ADULTE: "L'élève est adulte en formation. Sois efficace et concret."
    };

    const systemContent = `${HOMEWORK_CORRECTION_PROMPT}

## Contexte
- Niveau : ${educationLevel} — ${levelHint[educationLevel] || ""}
- Matières : ${subjects.join(", ") || "non spécifiées"}

Analyse le devoir fourni (image et/ou texte). 
Commence par confirmer ce que tu vois, puis pose UNE première question de diagnostic.
Ne donne AUCUNE réponse complète.`;

    const userContent: any[] = [];

    if (description) {
      userContent.push({
        type: "text",
        text: `Description fournie par l'élève :\n${description}`
      });
    }

    if (imageBase64) {
      // Normalize to data URL if needed
      const url = imageBase64.startsWith("data:")
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;

      userContent.push({
        type: "image_url",
        image_url: { url, detail: "high" }
      });

      if (!description) {
        userContent.unshift({
          type: "text",
          text: "Voici la photo de mon devoir. Analyse-la et guide-moi sans me donner les réponses."
        });
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent }
      ],
      temperature: 0.6,
      max_tokens: 600
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "J’ai bien reçu ton devoir. Peux-tu me dire quelle question tu veux traiter en premier ?";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("[Homework Vision Error]", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de l’analyse du devoir" },
      { status: 500 }
    );
  }
}
