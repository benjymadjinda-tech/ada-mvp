# Ada – MVP

**Apprends à ton rythme. Avance avec les autres.**

Plateforme d’apprentissage adaptatif + tuteur IA socratique + entraide humaine.

---

## Stack

| Couche | Techno |
|--------|--------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind |
| Database | PostgreSQL + Prisma |
| Auth | Supabase Auth (ou Clerk) |
| IA Tuteur | OpenAI GPT-4o (prompt socratique strict) |
| Storage | Supabase Storage (photos de devoirs) |
| Realtime | Supabase Realtime (messagerie) |
| Appels | Daily.co ou LiveKit (phase 2) |

---

## Structure du projet

```
ada-mvp/
├── app/
│   ├── api/
│   │   └── ai/
│   │       └── chat/route.ts      # Endpoint tuteur IA
│   ├── (marketing)/               # Landing page
│   ├── onboarding/                # Multi-matières + niveau scolaire
│   ├── dashboard/                 # Tableau de bord
│   └── auth/
├── components/
│   ├── ui/
│   ├── onboarding/
│   ├── tutor/                     # Chat IA + correction devoir
│   └── dashboard/
├── lib/                           # Clients Supabase, OpenAI, utils
├── prisma/
│   └── schema.prisma              # Schéma complet
├── prompts/
│   └── socratic-tutor.ts          # System prompt verrouillé
├── types/
└── public/
```

---

## Fonctionnalités MVP (priorité)

### 1. Onboarding
- Sélection **multi-matières**
- Niveau d’études (Primaire → Pro/Adulte)
- Objectif (examen, compétence, plaisir, projet)

### 2. Tuteur IA Socratique
- Chat guidé par indices (jamais la réponse directe)
- Adaptation au niveau scolaire
- Mode **Corriger un devoir** (photo + OCR + guidance)

### 3. Parcours d’apprentissage
- Leçons + exercices
- Suivi de progression

### 4. Entraide humaine
- Matching par matière + niveau
- Messagerie
- (Phase 2) Appels audio/vidéo

---

## Démarrage local

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Remplir DATABASE_URL et OPENAI_API_KEY

# 3. Générer le client Prisma + pousser le schéma
npx prisma generate
npx prisma db push

# 4. Lancer
npm run dev
```

---

## Prompt Tuteur IA (extrait)

Le tuteur suit un prompt système strict :
- Ne donne jamais la réponse finale dans les premiers échanges
- Pose des questions de diagnostic
- Donne des indices progressifs
- Adapte le langage au niveau scolaire
- Reste 100 % centré sur l’éducation

Voir `prompts/socratic-tutor.ts`.

---

## Prochaines étapes techniques

1. [ ] Auth (Supabase ou Clerk)
2. [ ] Pages onboarding + dashboard
3. [ ] Intégration réelle de l’endpoint `/api/ai/chat`
4. [ ] Upload photo devoir + Vision
5. [ ] Matching d’entraide basique
6. [ ] Messagerie temps réel
7. [ ] Abonnement Stripe (Premium)

---

## Licence

Projet privé – Ada
