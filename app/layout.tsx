import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ada – Apprends à ton rythme. Avance avec les autres.",
  description: "Plateforme d'apprentissage adaptatif + tuteur IA socratique + entraide humaine."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
