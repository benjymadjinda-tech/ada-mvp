/**
 * POST /api/ai/chat
 *
 * Endpoint for the Socratic AI Tutor.
 * Expects: { messages: {role, content}[], educationLevel, subjects[], userId? }
 * Returns: { reply: string, remaining?: number }
 *
 * Requires OPENAI_API_KEY in environment.
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildTutorMessages } from "@/prompts/socratic-tutor";
import { canSendAIMessage, incrementAIMessage } from "@/lib/usage";
import { prisma } from "@/lib/prisma";
import { PlanKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquante. Ajoute-la dans .env.local" },
        { status: 503 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await req.json();
    const {
      messages = [],
      educationLevel = "LYCEE",
      subjects = [],
      userId,
    } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    // --- Limitation d'usage (si userId fourni) ---
    let remaining: number | undefined;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, planExpiresAt: true },
      });

      let plan: PlanKey = "FREE";
      if (
        user?.plan &&
        user.plan !== "FREE" &&
        (!user.planExpiresAt || user.planExpiresAt > new Date())
      ) {
        plan = user.plan as PlanKey;
      }

      const check = await canSendAIMessage(userId, plan);

      if (!check.allowed) {
        return NextResponse.json(
          {
            error:
              "Tu as atteint ta limite quotidienne de messages IA. Passe Premium pour continuer sans limite.",
            code: "LIMIT_REACHED",
            remaining: 0,
            upgradeUrl: "/pricing",
          },
          { status: 429 }
        );
      }

      remaining = check.remaining === Infinity ? undefined : check.remaining - 1;
    }

    const tutorMessages = buildTutorMessages(
      educationLevel,
      subjects,
      messages.map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }))
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: tutorMessages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "Je n'ai pas réussi à formuler une réponse. Peux-tu reformuler ta question ?";

    // Incrémenter l'usage après succès
    if (userId) {
      await incrementAIMessage(userId);
    }

    return NextResponse.json({ reply, remaining });
  } catch (error: any) {
    console.error("[AI Chat Error]", error?.message || error);
    return NextResponse.json(
      {
        error: error?.message || "Erreur lors de la génération de la réponse",
      },
      { status: 500 }
    );
  }
}
