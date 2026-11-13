"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS } from "@/lib/stripe";

const planOrder = ["FREE", "PREMIUM", "PRO"] as const;

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCheckout = async (plan: "PREMIUM" | "PRO") => {
    setLoading(plan);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création de la session");
      }

      // Redirection vers Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-ada-blue flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="text-xl font-bold text-ada-blue">Ada</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-600 hover:text-ada-blue"
          >
            Connexion
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-ada-violet hover:underline"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-ada-blue mb-4">
          Choisis ton plan
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Commence gratuitement. Passe Premium quand tu veux débloquer tout le
          potentiel d’Ada.
        </p>
      </section>

      {error && (
        <div className="max-w-md mx-auto mb-6 px-4">
          <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        </div>
      )}

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {planOrder.map((key) => {
            const plan = PLANS[key];
            const isPopular = key === "PREMIUM";
            const isFree = key === "FREE";

            return (
              <div
                key={key}
                className={`relative bg-white rounded-3xl border p-6 md:p-8 flex flex-col ${
                  isPopular
                    ? "border-ada-violet shadow-xl scale-[1.02]"
                    : "border-gray-100 shadow-sm"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ada-violet text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Le plus populaire
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-ada-blue">{plan.name}</h2>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-ada-blue">
                      {plan.price === 0 ? "0" : plan.price.toFixed(2).replace(".", ",")}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 text-sm">€ / mois</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-ada-green mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isFree ? (
                  <Link
                    href="/auth/signup"
                    className="block w-full text-center py-3 rounded-xl font-semibold bg-gray-100 text-ada-blue hover:bg-gray-200 transition"
                  >
                    Commencer gratuitement
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(key as "PREMIUM" | "PRO")}
                    disabled={loading !== null}
                    className={`w-full py-3 rounded-xl font-semibold transition disabled:opacity-60 ${
                      isPopular
                        ? "bg-ada-violet text-white hover:opacity-90"
                        : "bg-ada-blue text-white hover:opacity-90"
                    }`}
                  >
                    {loading === key ? "Redirection..." : `Choisir ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-10">
          Paiement sécurisé par Stripe. Annulation possible à tout moment.
        </p>
      </section>
    </div>
  );
}
