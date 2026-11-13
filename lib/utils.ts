import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EDUCATION_LEVELS = [
  { id: "PRIMAIRE", label: "Primaire", desc: "CP → CM2" },
  { id: "COLLEGE", label: "Collège", desc: "6ème → 3ème" },
  { id: "LYCEE", label: "Lycée", desc: "Seconde → Terminale" },
  { id: "SUPERIEUR", label: "Études supérieures", desc: "Licence, Master, prépa…" },
  { id: "PRO_ADULTE", label: "Formation pro / Adulte", desc: "Reconversion, compétences pro" }
] as const;

export const SUBJECTS = [
  { slug: "math", name: "Mathématiques", icon: "∫" },
  { slug: "code", name: "Programmation", icon: "</>" },
  { slug: "french", name: "Français", icon: "✍" },
  { slug: "physics", name: "Physique-Chimie", icon: "⚗" },
  { slug: "science", name: "Sciences de la vie", icon: "⚛" },
  { slug: "history", name: "Histoire-Géo", icon: "🏛" },
  { slug: "lang", name: "Langues", icon: "文" },
  { slug: "business", name: "Économie / Business", icon: "📊" }
] as const;

export const GOALS = [
  { id: "exam", label: "Réussir un examen / contrôle" },
  { id: "skill", label: "Monter en compétence" },
  { id: "hobby", label: "Apprendre pour le plaisir" },
  { id: "project", label: "Réaliser un projet concret" }
] as const;
