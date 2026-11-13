/**
 * Gestion des limites d'usage (messages IA + devoirs)
 */

import { prisma } from "./prisma";
import { PLANS, PlanKey } from "./stripe";

function todayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Récupère (ou crée) le compteur d'usage du jour pour un utilisateur
 */
export async function getTodayUsage(userId: string) {
  const date = todayDate();

  let usage = await prisma.usageDaily.findUnique({
    where: {
      userId_date: { userId, date },
    },
  });

  if (!usage) {
    usage = await prisma.usageDaily.create({
      data: {
        userId,
        date,
        aiMessages: 0,
        homework: 0,
      },
    });
  }

  return usage;
}

/**
 * Vérifie si l'utilisateur peut encore envoyer un message IA
 */
export async function canSendAIMessage(userId: string, plan: PlanKey = "FREE") {
  const limits = PLANS[plan]?.limits ?? PLANS.FREE.limits;

  if (limits.aiMessagesPerDay === Infinity) {
    return { allowed: true, remaining: Infinity };
  }

  const usage = await getTodayUsage(userId);
  const remaining = limits.aiMessagesPerDay - usage.aiMessages;

  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    used: usage.aiMessages,
    limit: limits.aiMessagesPerDay,
  };
}

/**
 * Incrémente le compteur de messages IA
 */
export async function incrementAIMessage(userId: string) {
  const date = todayDate();

  await prisma.usageDaily.upsert({
    where: {
      userId_date: { userId, date },
    },
    create: {
      userId,
      date,
      aiMessages: 1,
      homework: 0,
    },
    update: {
      aiMessages: { increment: 1 },
    },
  });
}

/**
 * Vérifie si l'utilisateur peut encore soumettre un devoir
 */
export async function canSubmitHomework(userId: string, plan: PlanKey = "FREE") {
  const limits = PLANS[plan]?.limits ?? PLANS.FREE.limits;

  if (limits.homeworkPerDay === Infinity) {
    return { allowed: true, remaining: Infinity };
  }

  const usage = await getTodayUsage(userId);
  const remaining = limits.homeworkPerDay - usage.homework;

  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    used: usage.homework,
    limit: limits.homeworkPerDay,
  };
}

/**
 * Incrémente le compteur de devoirs
 */
export async function incrementHomework(userId: string) {
  const date = todayDate();

  await prisma.usageDaily.upsert({
    where: {
      userId_date: { userId, date },
    },
    create: {
      userId,
      date,
      aiMessages: 0,
      homework: 1,
    },
    update: {
      homework: { increment: 1 },
    },
  });
}
