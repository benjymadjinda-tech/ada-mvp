import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY manquante");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeInstance;
}

// Pour compatibilité avec le code existant
export const stripe = {
  get customers() {
    return getStripe().customers;
  },
  get checkout() {
    return getStripe().checkout;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
  get billingPortal() {
    return getStripe().billingPortal;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

export const PLANS = {
  FREE: {
    name: "Gratuit",
    price: 0,
    priceId: null as string | null,
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
    priceId: process.env.STRIPE_PRICE_PREMIUM as string | undefined,
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
    priceId: process.env.STRIPE_PRICE_PRO as string | undefined,
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