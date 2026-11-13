/**
 * POST /api/stripe/webhook
 * Reçoit les événements Stripe (subscription created / updated / deleted)
 * et met à jour le plan de l'utilisateur en base.
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret manquant" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature invalide:", err.message);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const plan = (session.metadata?.plan || "PREMIUM") as "PREMIUM" | "PRO";
        const userEmail = session.metadata?.userEmail;

        if (userEmail) {
          await prisma.user.updateMany({
            where: { email: userEmail },
            data: {
              plan,
              stripeCustomerId: customerId,
            },
          });
        }

        // Récupérer les détails de la subscription
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
          });

          if (user) {
            await prisma.subscription.upsert({
              where: { stripeSubscriptionId: subscriptionId },
              create: {
                userId: user.id,
                stripeSubscriptionId: subscriptionId,
                stripePriceId: sub.items.data[0]?.price.id || "",
                status: sub.status,
                currentPeriodStart: new Date(sub.current_period_start * 1000),
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                cancelAtPeriodEnd: sub.cancel_at_period_end,
              },
              update: {
                status: sub.status,
                currentPeriodStart: new Date(sub.current_period_start * 1000),
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                cancelAtPeriodEnd: sub.cancel_at_period_end,
              },
            });

            await prisma.user.update({
              where: { id: user.id },
              data: {
                plan,
                planExpiresAt: new Date(sub.current_period_end * 1000),
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          const isActive =
            sub.status === "active" || sub.status === "trialing";

          await prisma.subscription.upsert({
            where: { stripeSubscriptionId: sub.id },
            create: {
              userId: user.id,
              stripeSubscriptionId: sub.id,
              stripePriceId: sub.items.data[0]?.price.id || "",
              status: sub.status,
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
            update: {
              status: sub.status,
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
          });

          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: isActive ? "PREMIUM" : "FREE",
              planExpiresAt: isActive
                ? new Date(sub.current_period_end * 1000)
                : null,
            },
          });
        }
        break;
      }

      default:
        // Événement non géré
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook Error]", error?.message || error);
    return NextResponse.json(
      { error: "Erreur de traitement du webhook" },
      { status: 500 }
    );
  }
}
