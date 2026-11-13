import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

// Plans disponibles
export const PLANS = {
  FREE: {
    name: "Gratuit",
    price: 0,
    priceId: null,
    features: [
      "10 messages IA / jour",
      "2 corrections de devoir / jour",
      "Parcours d'apprentissage de base",
      "Entraide communautaire",
    ],
    limits: {
      aiMessagesPerDay: 10,
      homeworkPerDay: 2,
    },
  },
  PREMIUM: {
    name: "Premium",
    price: 9.9,
    priceId: process.env.STRIPE_PRICE_PREMIUM, // à créer dans Stripe Dashboard
    features: [
      "Messages IA illimités",
      "Corrections de devoirs illimitées",
      "Tuteur IA prioritaire (GPT-4o)",
      "Historique complet des sessions",
      "Accès prioritaire à l'entraide",
      "Support par email",
    ],
    limits: {
      aiMessagesPerDay: Infinity,
      homeworkPerDay: Infinity,
    },
  },
  PRO: {
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRICE_PRO,
    features: [
      "Tout Premium",
      "Mode mentor (plusieurs élèves)",
      "Statistiques avancées",
      "Export des progressions",
      "Support prioritaire",
    ],
    limits: {
      aiMessagesPerDay: Infinity,
      homeworkPerDay: Infinity,
    },
  },
} as const;

export type PlanKey = keyof typeof PLANS;
