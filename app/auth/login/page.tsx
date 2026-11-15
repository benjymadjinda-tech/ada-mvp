"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      // Check if onboarding is done
      const onboarding = localStorage.getItem("ada_onboarding");
      router.push(onboarding ? "/dashboard" : "/onboarding");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion. Vérifie tes identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-ada-blue flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="text-xl font-bold text-ada-blue">Ada</span>
        </div>

        <h1 className="text-2xl font-bold text-ada-blue text-center mb-2">
          Bon retour
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          Connecte-toi pour continuer ton parcours
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-ada-violet text-sm"
              placeholder="toi@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-ada-violet text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-ada-blue text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/auth/signup" className="text-ada-violet font-medium hover:underline">
            Créer un compte
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link href="/" className="hover:underline">
            ← Retour à l’accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
