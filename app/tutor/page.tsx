"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function TutorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode =
    searchParams.get("mode") === "homework" ? "homework" : "chat";

  const [mode, setMode] = useState<"chat" | "homework">(initialMode);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [homeworkText, setHomeworkText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [educationLevel, setEducationLevel] = useState("LYCEE");
  const [subjects, setSubjects] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load onboarding context
  useEffect(() => {
    const raw = localStorage.getItem("ada_onboarding");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.educationLevel) setEducationLevel(data.educationLevel);
        if (data.subjects) setSubjects(data.subjects);
      } catch {}
    }

    if (messages.length === 0 && mode === "chat") {
      setMessages([
        {
          role: "assistant",
          content:
            "Salut ! Je suis ton tuteur Ada. Je vais t’aider à comprendre, pas te donner les réponses toutes faites. Dis-moi sur quoi tu bloques."
        }
      ]);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /** Compress / convert file to base64 data URL */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Merci d’envoyer une image (JPG, PNG, etc.)");
      return;
    }

    // Limit ~4 Mo
    if (file.size > 4 * 1024 * 1024) {
      alert("Image trop lourde (max 4 Mo). Compresse-la un peu.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** Send a normal chat message */
  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          educationLevel,
          subjects
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur API");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);
    } catch (err: any) {
      const fallbacks = [
        "Ok, je vois. Avant d’aller plus loin : qu’est-ce que tu as déjà essayé ?",
        "Intéressant. Peux-tu me dire exactement quelle partie te bloque ?",
        "On va découper le problème. Quelle est la première information que tu as ?",
        "Je ne vais pas te donner la réponse directement. Voici un indice : reprends la définition de base du cours."
      ];
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            fallbacks[Math.floor(Math.random() * fallbacks.length)] +
            (err.message?.includes("KEY") || err.message?.includes("manquante")
              ? "\n\n_(Configure OPENAI_API_KEY dans .env.local pour le vrai tuteur.)_"
              : "")
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  /** Submit homework (image and/or text) → Vision API */
  const handleHomeworkSubmit = async () => {
    if (!homeworkText.trim() && !imageBase64) return;
    setLoading(true);

    try {
      const res = await fetch("/api/ai/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          description: homeworkText.trim(),
          educationLevel,
          subjects
        })
      });

      const data = await res.json();

      // Switch to chat with the first guidance message
      setMode("chat");
      setMessages([
        {
          role: "user",
          content: imageBase64
            ? "[Photo de devoir envoyée]" +
              (homeworkText.trim() ? `\n${homeworkText.trim()}` : "")
            : homeworkText.trim()
        },
        {
          role: "assistant",
          content:
            data.reply ||
            "J’ai bien reçu ton devoir. Quelle question veux-tu traiter en premier ?"
        }
      ]);
    } catch (err: any) {
      setMode("chat");
      setMessages([
        {
          role: "assistant",
          content:
            "J’ai bien reçu ton devoir. Je ne vais pas te donner la correction complète. Commençons : qu’as-tu déjà essayé de faire sur la première question ?\n\n_(Note : configure OPENAI_API_KEY pour activer l’analyse d’image.)_"
        }
      ]);
    } finally {
      setLoading(false);
      // Reset homework form
      setHomeworkText("");
      clearImage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ada-soft">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-500 hover:text-ada-blue text-lg"
        >
          ←
        </button>
        <div className="flex-1">
          <div className="font-semibold text-ada-blue text-sm">
            Tuteur IA Ada
          </div>
          <div className="text-xs text-gray-500">
            Je t’aide par indices, je ne spoile pas les réponses
          </div>
        </div>
      </header>

      {/* Mode switch */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex gap-2">
        <button
          onClick={() => setMode("chat")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mode === "chat"
              ? "bg-ada-violet text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Discussion
        </button>
        <button
          onClick={() => setMode("homework")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mode === "homework"
              ? "bg-ada-violet text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Corriger un devoir
        </button>
      </div>

      {mode === "homework" ? (
        /* ========== HOMEWORK MODE ========== */
        <div className="flex-1 p-4 max-w-2xl mx-auto w-full overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <h3 className="font-bold text-ada-blue mb-2">
              Corriger un devoir
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Envoie une photo de ton exercice ou décris-le. Je l’analyserai et
              te guiderai par indices, sans te donner la solution complète.
            </p>

            {/* Image upload zone */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <div className="relative mb-4">
                <img
                  src={imagePreview}
                  alt="Aperçu du devoir"
                  className="w-full max-h-64 object-contain rounded-xl border border-gray-200"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg"
                >
                  ✕ Supprimer
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-1 p-4 rounded-xl border border-dashed border-gray-300 hover:border-ada-violet hover:bg-violet-50 transition"
                >
                  <span className="text-2xl">📷</span>
                  <span className="text-xs font-medium">Caméra / Photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-1 p-4 rounded-xl border border-dashed border-gray-300 hover:border-ada-violet hover:bg-violet-50 transition"
                >
                  <span className="text-2xl">🖼</span>
                  <span className="text-xs font-medium">Galerie</span>
                </button>
                <button
                  onClick={() =>
                    alert(
                      "La dictée vocale sera disponible prochainement.\nPour l’instant, tape ou envoie une photo."
                    )
                  }
                  className="flex flex-col items-center gap-1 p-4 rounded-xl border border-dashed border-gray-300 hover:border-ada-violet hover:bg-violet-50 transition"
                >
                  <span className="text-2xl">🎤</span>
                  <span className="text-xs font-medium">Micro</span>
                </button>
              </div>
            )}

            <textarea
              value={homeworkText}
              onChange={(e) => setHomeworkText(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm h-28 focus:outline-none focus:border-ada-violet resize-none"
              placeholder="Ou décris / colle l’énoncé ici…"
            />

            <button
              onClick={handleHomeworkSubmit}
              disabled={loading || (!homeworkText.trim() && !imageBase64)}
              className="mt-4 w-full py-3 bg-ada-violet text-white rounded-xl font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition"
            >
              {loading ? "Analyse en cours…" : "Envoyer au tuteur"}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Le tuteur analyse ton devoir (Vision) puis te guide question par
            question.
          </p>
        </div>
      ) : (
        /* ========== CHAT MODE ========== */
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-ada-blue text-white rounded-br-md"
                      : "bg-white border border-gray-100 text-gray-800 rounded-bl-md"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm text-gray-400">
                  Ada analyse…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Décris ton blocage…"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ada-violet"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 bg-ada-blue text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Chargement…
        </div>
      }
    >
      <TutorContent />
    </Suspense>
  );
}
