// Ada MVP - Shared Types

export type EducationLevel =
  | "PRIMAIRE"
  | "COLLEGE"
  | "LYCEE"
  | "SUPERIEUR"
  | "PRO_ADULTE";

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type HelpStatus = "OPEN" | "MATCHED" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";

export type AIMode = "CHAT" | "HOMEWORK";

export interface Subject {
  id: string;
  slug: string;
  name: string;
  icon?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  educationLevel?: EducationLevel;
  subjects: {
    subjectId: string;
    subject: Subject;
    level?: string;
    goal?: string;
  }[];
}

export interface LessonSummary {
  id: string;
  title: string;
  durationMin?: number;
  status: ProgressStatus;
  order: number;
}

export interface AIMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
}

export interface HelperProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  helpsCount: number;
  isOnline: boolean;
  level: string; // Mentor | Expert | Aidant
}
