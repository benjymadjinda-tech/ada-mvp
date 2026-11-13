/**
 * POST /api/stripe/checkout
 * Crée une session Stripe Checkout pour Premium ou Pro.
 * Nécessite que l'utilisateur soit connecté (via cookie Supabase).
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe n'est pas encore configuré (STRIPE_SECRET_KEY manquante)" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { plan } = body as { plan: "PREMIUM" | "PRO" };

    if (!plan || !["PREMIUM", "PRO"].includes(plan)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const priceId = PLANS[plan].priceId;
    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Ce plan n'a pas encore de priceId Stripe. Crée-le dans le Dashboard Stripe puis ajoute STRIPE_PRICE_PREMIUM / STRIPE_PRICE_PRO dans les variables d'environnement.",
        },
        { status: 503 }
      );
    }

    // Récupérer l'utilisateur via le token Supabase (header Authorization ou cookie)
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Fallback : on accepte aussi un email en body pour le MVP (à sécuriser plus tard)
    const { email: bodyEmail } = body;

    let userEmail = bodyEmail as string | undefined;
    let userId: string | undefined;

    if (token) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase.auth.getUser(token);
      if (data.user) {
        userEmail = data.user.email;
        userId = data.user.id;
      }
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "Tu dois être connecté pour passer Premium. Connecte-toi d'abord." },
        { status: 401 }
      );
    }

    // Chercher ou créer le customer Stripe
    let customerId: string | undefined;

    // On regarde d'abord en base
    const dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (dbUser?.stripeCustomerId) {
      customerId = dbUser.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: dbUser?.id || userId || "",
        },
      });
      customerId = customer.id;

      if (dbUser) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: {
        plan,
        userEmail,
      },
      subscription_data: {
        metadata: {
          plan,
          userEmail,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[Stripe Checkout Error]", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    );
  }
}
