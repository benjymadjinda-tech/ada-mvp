import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkUsageLimit, incrementUsage } from "@/lib/usage";
import { SOCRATIC_TUTOR_PROMPT } from "@/prompts/socratic-tutor";

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquante" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { messages, userId } = body;

    // Vérification des limites d'usage (freemium)
    if (userId) {
      const canUse = await checkUsageLimit(userId, "ai_message");
      if (!canUse) {
        return NextResponse.json(
          {
            error: "Limite quotidienne atteinte. Passez en Premium pour continuer.",
            code: "USAGE_LIMIT",
          },
          { status: 429 }
        );
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SOCRATIC_TUTOR_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Incrémenter l'usage
    if (userId) {
      await incrementUsage(userId, "ai_message");
    }

    return NextResponse.json({
      message: response.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("Erreur AI chat:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}