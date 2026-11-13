"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EDUCATION_LEVELS, SUBJECTS, GOALS } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [educationLevel, setEducationLevel] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);

  const toggleSubject = (slug: string) => {
    setSubjects((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const canContinue =
    (step === 0 && subjects.length > 0) ||
    (step === 1 && educationLevel) ||
    (step === 2 && goal);

  const handleFinish = () => {
    // TODO: save to DB / user profile after auth is ready
    // For now we store in localStorage so the dashboard can read it
    localStorage.setItem(
      "ada_onboarding",
      JSON.stringify({ subjects, educationLevel, goal })
    );
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-6 md:p-8">
        {/* Progress dots */}
        <div className="flex gap-2 mb-8 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= step ? "w-8 bg-ada-violet" : "w-4 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 0 – Subjects (multi) */}
        {step === 0 && (
          <div className="fade-in">
            <h2 className="text-xl md:text-2xl font-bold text-ada-blue mb-2">
              Quelles matières veux-tu travailler ?
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Tu peux en sélectionner plusieurs.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SUBJECTS.map((s) => {
                const selected = subjects.includes(s.slug);
                return (
                  <button
                    key={s.slug}
                    onClick={() => toggleSubject(s.slug)}
                    className={`p-4 rounded-2xl border-2 text-left transition ${
                      selected
                        ? "border-ada-violet bg-violet-50"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="font-medium text-sm">{s.name}</div>
                    {selected && (
                      <div className="text-xs text-ada-violet mt-1">
                        ✓ Sélectionné
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1 – Education level */}
        {step === 1 && (
          <div className="fade-in">
            <h2 className="text-xl md:text-2xl font-bold text-ada-blue mb-2">
              Où en es-tu dans tes études ?
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Cela permet à Ada de s’adapter précisément à ton niveau.
            </p>
            <div className="space-y-3">
              {EDUCATION_LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setEducationLevel(l.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    educationLevel === l.id
                      ? "border-ada-violet bg-violet-50"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="font-semibold">{l.label}</div>
                  <div className="text-sm text-gray-500">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 – Goal */}
        {step === 2 && (
          <div className="fade-in">
            <h2 className="text-xl md:text-2xl font-bold text-ada-blue mb-2">
              Quel est ton objectif principal ?
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Ada priorisera le contenu en fonction.
            </p>
            <div className="space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    goal === g.id
                      ? "border-ada-violet bg-violet-50"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="font-semibold">{g.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3.5 rounded-xl font-semibold border border-gray-200 bg-white"
            >
              Retour
            </button>
          )}
          <button
            disabled={!canContinue}
            onClick={() => {
              if (step < 2) setStep((s) => s + 1);
              else handleFinish();
            }}
            className={`flex-1 py-3.5 rounded-xl font-semibold text-white transition ${
              canContinue
                ? "bg-ada-blue hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {step === 2
              ? "Lancer mon parcours"
              : `Continuer${step === 0 && subjects.length ? ` (${subjects.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
