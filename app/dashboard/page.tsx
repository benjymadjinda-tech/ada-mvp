"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SUBJECTS, EDUCATION_LEVELS } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<{
    subjects: string[];
    educationLevel: string;
    goal: string;
  } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("ada_onboarding");
    if (raw) setData(JSON.parse(raw));
  }, []);

  const selectedSubjects = SUBJECTS.filter((s) =>
    data?.subjects?.includes(s.slug)
  );
  const eduLabel =
    EDUCATION_LEVELS.find((e) => e.id === data?.educationLevel)?.label || "";

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-ada-blue flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-bold text-ada-blue">Ada</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/tutor"
            className="text-sm font-medium text-ada-violet hover:underline"
          >
            Tuteur IA
          </Link>
          <div className="w-9 h-9 rounded-full bg-ada-violet text-white flex items-center justify-center text-sm font-semibold">
            T
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl md:text-2xl font-bold text-ada-blue mb-1">
          Bonjour 👋
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          {eduLabel}
          {selectedSubjects.length > 0 &&
            " · " + selectedSubjects.map((s) => s.name).join(", ")}
        </p>

        {/* Progress placeholder */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">Progression</span>
            <span className="text-ada-violet font-bold">12 %</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-ada-blue to-ada-violet rounded-full"
              style={{ width: "12%" }}
            />
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link
            href="/tutor"
            className="bg-ada-blue text-white rounded-2xl p-4 text-left hover:opacity-90 transition"
          >
            <div className="text-2xl mb-1">🤖</div>
            <div className="font-semibold text-sm">Parler au tuteur IA</div>
            <div className="text-xs opacity-80 mt-0.5">Indices & guidance</div>
          </Link>
          <Link
            href="/tutor?mode=homework"
            className="bg-ada-violet text-white rounded-2xl p-4 text-left hover:opacity-90 transition"
          >
            <div className="text-2xl mb-1">📝</div>
            <div className="font-semibold text-sm">Corriger un devoir</div>
            <div className="text-xs opacity-80 mt-0.5">Photo ou description</div>
          </Link>
        </div>

        {/* Subjects */}
        <h2 className="font-bold mb-3">Tes matières</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {selectedSubjects.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-full">
              Aucune matière sélectionnée.{" "}
              <Link href="/onboarding" className="text-ada-violet underline">
                Refaire l’onboarding
              </Link>
            </p>
          ) : (
            selectedSubjects.map((s) => (
              <div
                key={s.slug}
                className="bg-white border border-gray-100 rounded-2xl p-4"
              >
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="font-medium text-sm">{s.name}</div>
              </div>
            ))
          )}
        </div>

        {/* Placeholder for lessons */}
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
          <h3 className="font-bold text-ada-blue text-sm mb-1">
            Prochaine étape
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Le contenu des leçons sera généré et adapté à ton niveau une fois
            le tuteur IA et la base de données connectés.
          </p>
          <Link
            href="/tutor"
            className="inline-block px-4 py-2 bg-ada-violet text-white rounded-xl text-sm font-semibold"
          >
            Commencer avec le tuteur
          </Link>
        </div>
      </main>
    </div>
  );
}
