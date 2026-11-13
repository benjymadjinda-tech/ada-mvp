# Étape 1 – Connexion base de données

## Option recommandée : Supabase (gratuit + simple)

### 1. Créer un projet Supabase
1. Va sur [https://supabase.com](https://supabase.com)
2. Crée un compte / connecte-toi
3. Clique sur **New Project**
4. Choisis un nom (`ada`), un mot de passe fort, et une région proche (ex: Frankfurt)
5. Attends 1-2 minutes que le projet soit prêt

### 2. Récupérer les clés
Dans ton projet Supabase :
- Va dans **Project Settings → API**
- Copie :
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (garde-la secrète)

### 3. Récupérer l’URL de la base
- Va dans **Project Settings → Database**
- Section **Connection string** → choisis **URI**
- Copie l’URL et remplace `[YOUR-PASSWORD]` par le mot de passe que tu as choisi
- Colle-la dans `DATABASE_URL`

### 4. Fichier `.env.local`
Crée un fichier `.env.local` à la racine du projet :

```env
DATABASE_URL="postgresql://postgres:[TON-MOT-DE-PASSE]@db.[TON-PROJECT-REF].supabase.co:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://[TON-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

OPENAI_API_KEY="sk-..."   # pour plus tard (étape 4)

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. Pousser le schéma
```bash
npx prisma generate
npx prisma db push
```

Tu devrais voir les tables créées dans **Supabase → Table Editor**.

---

## Option alternative : Neon (aussi excellent)

1. [https://neon.tech](https://neon.tech)
2. Créer un projet
3. Copier la connection string dans `DATABASE_URL`
4. Même commande `npx prisma db push`

---

## Vérification
```bash
npx prisma studio
```
Ouvre une interface visuelle pour voir tes tables.
