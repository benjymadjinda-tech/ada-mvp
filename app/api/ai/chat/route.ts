import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { canSendAIMessage, incrementAIMessage } from "@/lib/usage";
import { SOCRATIC_TUTOR_SYSTEM_PROMPT } from "@/prompts/socratic-tutor";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquante" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await req.json();
    const { messages, userId } = body;

    // Vérification des limites d'usage (freemium)
    if (userId) {
      const { allowed } = await canSendAIMessage(userId, "FREE");
      if (!allowed) {
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
        { role: "system", content: SOCRATIC_TUTOR_SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Incrémenter l'usage
    if (userId) {
      await incrementAIMessage(userId);
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