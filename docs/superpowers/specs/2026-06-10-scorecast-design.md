# 3oulama ScoreCast — Spécification Technique
**Version :** 1.0  
**Date :** 2026-06-10  
**Statut :** Approuvée

---

## 1. Contexte & Objectif

Application web de pronostics de football entre amis pour la Coupe du Monde 2026 (USA/Canada/Mexique, 48 équipes, 104 matchs). Groupe privé fermé de 5 à 30 utilisateurs. Les données des équipes et le calendrier sont pré-intégrés — aucun import nécessaire. Les scores officiels sont synchronisés automatiquement via l'API football-data.org.

---

## 2. Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14 (App Router) |
| Langage | TypeScript (strict) |
| UI | React + Tailwind CSS |
| ORM | Prisma |
| Base de données | PostgreSQL (Railway) |
| Auth | NextAuth.js v5 (JWT + refresh tokens) |
| Emails | Resend |
| Push notifications | Web Push API (VAPID) |
| i18n | next-intl (FR par défaut, EN disponible) |
| Tests | Jest + React Testing Library + Supertest |
| Déploiement | Railway (app + PostgreSQL + cron jobs) |
| API football | football-data.org (plan gratuit ou Tier 1) |

---

## 3. Schéma de base de données

### 3.1 Tables

#### `User`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK |
| email | varchar(255) | UNIQUE NOT NULL |
| username | varchar(50) | UNIQUE NOT NULL |
| passwordHash | text | NOT NULL |
| avatarUrl | text | nullable |
| locale | enum(fr, en) | DEFAULT 'fr' |
| role | enum(USER, ADMIN) | DEFAULT 'USER' |
| emailNotifications | boolean | DEFAULT true |
| pushSubscription | jsonb | nullable |
| createdAt | timestamptz | DEFAULT now() |

#### `Invitation`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK |
| token | uuid | UNIQUE NOT NULL |
| createdBy | uuid | FK → User |
| groupId | uuid | FK → Group, nullable |
| usedBy | uuid | FK → User, nullable |
| expiresAt | timestamptz | NOT NULL |
| usedAt | timestamptz | nullable |

#### `Group`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK |
| name | varchar(100) | NOT NULL |
| createdBy | uuid | FK → User |
| createdAt | timestamptz | DEFAULT now() |

#### `GroupMember`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| groupId | uuid | FK → Group |
| userId | uuid | FK → User |
| joinedAt | timestamptz | DEFAULT now() |
| **PK** | | UNIQUE(groupId, userId) |

#### `Team`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK |
| name | varchar(100) | NOT NULL |
| code | varchar(3) | UNIQUE NOT NULL (ex: FRA) |
| flagUrl | text | NOT NULL |
| group | varchar(1) | nullable (A–L) |
| fifaRanking | int | nullable |

48 équipes pré-seedées en migration.

#### `Match`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK |
| externalId | varchar(50) | UNIQUE NOT NULL (API football) |
| homeTeamId | uuid | FK → Team |
| awayTeamId | uuid | FK → Team |
| kickoffAt | timestamptz | NOT NULL |
| cutoffAt | timestamptz | NOT NULL (= kickoffAt − 5min) |
| stage | enum(GROUP, R32, R16, QF, SF, FINAL) | NOT NULL |
| group | varchar(1) | nullable |
| stadium | varchar(100) | nullable |
| city | varchar(100) | nullable |
| homeScore | int | nullable |
| awayScore | int | nullable |
| status | enum(SCHEDULED, LIVE, FINISHED) | DEFAULT 'SCHEDULED' |

104 matchs pré-seedés en migration. Stade et ville inclus.

#### `Prediction`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK |
| userId | uuid | FK → User |
| matchId | uuid | FK → Match |
| homeScore | int | NOT NULL (≥ 0) |
| awayScore | int | NOT NULL (≥ 0) |
| points | int | nullable (calculé post-match) |
| updatedAt | timestamptz | DEFAULT now() |
| **UNIQUE** | | (userId, matchId) |

Modification autorisée avant `cutoffAt` uniquement.

#### `ScoringRule`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | int | PK = 1 (ligne unique) |
| exactScore | int | DEFAULT 3 |
| correctResult | int | DEFAULT 1 |
| wrongPrediction | int | DEFAULT 0 |
| updatedAt | timestamptz | DEFAULT now() |
| updatedBy | uuid | FK → User |

Une seule ligne active. Modifiable par l'admin.

#### `LeaderboardSnapshot`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| userId | uuid | FK → User |
| groupId | uuid | FK → Group, nullable |
| totalPoints | int | DEFAULT 0 |
| exactScores | int | DEFAULT 0 |
| correctResults | int | DEFAULT 0 |
| currentStreak | int | DEFAULT 0 |
| rank | int | NOT NULL |
| computedAt | timestamptz | DEFAULT now() |
| **UNIQUE** | | (userId, groupId) |

`groupId = null` → snapshot global. Recalculé après chaque match FINISHED.

#### `NotificationLog`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK |
| userId | uuid | FK → User |
| type | enum(REMINDER, RESULT) | NOT NULL |
| channel | enum(EMAIL, PUSH) | NOT NULL |
| matchId | uuid | FK → Match |
| sentAt | timestamptz | DEFAULT now() |
| status | enum(SENT, FAILED) | NOT NULL |

Évite les doublons d'envoi. Vérifié avant chaque envoi.

---

## 4. Architecture

### 4.1 Structure du projet

```
src/
  app/
    (auth)/
      invite/[token]/page.tsx
      login/page.tsx
      forgot-password/page.tsx
      reset-password/[token]/page.tsx
    (app)/
      page.tsx                    # Dashboard
      matches/page.tsx
      matches/[id]/page.tsx
      leaderboard/page.tsx
      profile/page.tsx
      rules/page.tsx
    (admin)/
      admin/page.tsx
      admin/groups/page.tsx
      admin/invitations/page.tsx
      admin/users/page.tsx
      admin/scoring/page.tsx
      admin/matches/[id]/page.tsx
    api/
      auth/[...nextauth]/route.ts
      auth/invite/[token]/route.ts
      matches/route.ts
      matches/[id]/route.ts
      predictions/[matchId]/route.ts
      predictions/me/route.ts
      leaderboard/route.ts
      leaderboard/match/[id]/route.ts
      admin/scoring/route.ts
      admin/invitations/route.ts
      admin/groups/route.ts
      admin/users/[id]/route.ts
      admin/matches/[id]/route.ts
      cron/sync-scores/route.ts
      cron/reminders/route.ts
  lib/
    prisma.ts
    auth.ts
    scoring.ts          # Logique calcul points
    notifications.ts    # Email + Push
    football-api.ts     # Client football-data.org
  middleware.ts         # Auth guard + i18n routing
  messages/
    fr/
    en/
prisma/
  schema.prisma
  seed.ts               # 48 équipes + 104 matchs 2026
design-system/
  tokens/
  components/
  assets/
```

### 4.2 Flux principal

```
User s'inscrit via /invite/[token]
  → Token validé, compte créé, ajout au groupe associé
  → Redirection vers /

User saisit un pronostic sur /matches/[id]
  → Vérification cutoffAt non dépassée (serveur)
  → Upsert Prediction (userId, matchId)

Cron sync-scores (toutes les 2 min pendant matchs LIVE)
  → GET football-data.org/matches?status=LIVE,FINISHED
  → Update Match (homeScore, awayScore, status)
  → Pour chaque Match FINISHED sans points calculés :
      → Pour chaque Prediction du match :
          → calculatePoints(prediction, match, scoringRule)
          → Update Prediction.points
      → Recalcul LeaderboardSnapshot (global + par groupe)
      → Envoi notifications RESULT (email si emailNotifications + push si subscription)

Cron reminders (toutes les heures)
  → Pour chaque match à venir dans 24h et 1h :
      → Users sans pronostic pour ce match
      → Envoi REMINDER (email + push, si pas déjà envoyé)
```

### 4.3 Calcul des points

```typescript
// lib/scoring.ts
function calculatePoints(
  prediction: { homeScore: number; awayScore: number },
  result:     { homeScore: number; awayScore: number },
  rule:       ScoringRule,
): number {
  const exactMatch =
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore

  if (exactMatch) return rule.exactScore  // défaut: 3

  const predictedWinner = Math.sign(prediction.homeScore - prediction.awayScore)
  const actualWinner    = Math.sign(result.homeScore - result.awayScore)

  if (predictedWinner === actualWinner) return rule.correctResult  // défaut: 1

  return rule.wrongPrediction  // défaut: 0
}
```

---

## 5. API Endpoints

### Auth
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/auth/invite/[token]` | Valider un token d'invitation |
| POST | `/api/auth/invite/[token]` | Créer un compte via invitation |
| POST | `/api/auth/[...nextauth]` | NextAuth — login, logout, session |

### Matchs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/matches` | Liste matchs (filtres: stage, group, status) |
| GET | `/api/matches/[id]` | Détail match + pronostic du user courant |

### Pronostics
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| PUT | `/api/predictions/[matchId]` | Créer ou modifier un pronostic (avant cutoffAt) |
| GET | `/api/predictions/me` | Tous mes pronostics |

### Classement
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/leaderboard` | Classement global ou par groupe (`?groupId=`) |
| GET | `/api/leaderboard/match/[id]` | Classement pour un match spécifique |

### Admin
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET/POST | `/api/admin/invitations` | Lister / créer un lien d'invitation |
| DELETE | `/api/admin/invitations/[id]` | Révoquer un lien |
| GET/POST | `/api/admin/groups` | Lister / créer un groupe |
| PATCH/DELETE | `/api/admin/groups/[id]` | Renommer / supprimer un groupe |
| POST | `/api/admin/groups/[id]/members` | Ajouter un membre à un groupe |
| DELETE | `/api/admin/groups/[id]/members/[userId]` | Retirer un membre |
| GET/PUT | `/api/admin/scoring` | Lire / modifier le barème |
| PATCH | `/api/admin/matches/[id]` | Corriger manuellement un score officiel |
| GET | `/api/admin/users` | Lister les utilisateurs |
| PATCH/DELETE | `/api/admin/users/[id]` | Modifier rôle / désactiver compte |

### Cron (appelés par Railway Cron, protégés par `CRON_SECRET`)
| Méthode | Endpoint | Fréquence |
|---------|----------|-----------|
| POST | `/api/cron/sync-scores` | Toutes les 2 min (pendant matchs LIVE) |
| POST | `/api/cron/reminders` | Toutes les heures |

---

## 6. Sécurité

- **Auth** : NextAuth.js avec sessions JWT signées (HS256), refresh token en cookie httpOnly SameSite=Strict
- **Autorisation** : middleware Next.js vérifie la session sur toutes les routes `/api/*` et `/(app)/*`. Routes `/admin/*` requièrent `role = ADMIN`
- **CSRF** : NextAuth v5 intègre la protection CSRF nativement
- **Injection** : Prisma paramètre toutes les requêtes — aucune SQL brute
- **XSS** : JSX échappe les valeurs par défaut. `dangerouslySetInnerHTML` interdit
- **Cron** : header `Authorization: Bearer ${CRON_SECRET}` vérifié sur `/api/cron/*`
- **Invitations** : token UUID v4, expiration 72h, usage unique, révocable par l'admin
- **Rate limiting** : middleware sur `/api/auth/login` et `/api/auth/invite` (10 req/min par IP)
- **Variables d'environnement** : `NEXTAUTH_SECRET`, `DATABASE_URL`, `RESEND_API_KEY`, `VAPID_*`, `FOOTBALL_API_KEY`, `CRON_SECRET` — jamais exposées côté client

---

## 7. Notifications

### Email (Resend)
- **REMINDER** : 24h et 1h avant kickoff — envoyé uniquement si `emailNotifications = true` et pronostic manquant
- **RESULT** : après calcul des points — score exact, bon résultat ou mauvais
- Opt-out par utilisateur dans `/profile` → `emailNotifications = false`
- Vérification `NotificationLog` avant envoi pour éviter les doublons

### Push (Web Push API — VAPID)
- Service Worker enregistré au premier login
- `pushSubscription` stockée en base (jsonb)
- Mêmes événements que l'email (REMINDER + RESULT)
- Révocation automatique si la subscription expire (410 de la plateforme)

---

## 8. Internationalisation

- `next-intl` avec détection de locale dans le middleware
- Locale par défaut : **fr**
- Locale disponible : **en**
- Namespaces : `common`, `matches`, `predictions`, `leaderboard`, `admin`
- Dates/heures affichées en timezone locale du navigateur (`Intl.DateTimeFormat`)
- Noms d'équipes : en français par défaut, en anglais si locale = en

---

## 9. Tests

### Unitaires (Jest)
- `lib/scoring.ts` — 100% de couverture sur `calculatePoints` (score exact, bon résultat, mauvais pronostic, cas limites)
- `lib/football-api.ts` — mock des réponses API
- Composants clés (Button, ScoreCounter, LeaderboardRow) avec React Testing Library

### Intégration (Supertest + base de test)
- `PUT /api/predictions/[matchId]` — création, modification avant coupure, rejet après coupure
- `GET /api/leaderboard` — filtre par groupe, visibilité restreinte aux membres
- `POST /api/cron/sync-scores` — calcul des points après sync d'un match terminé
- Auth guard — 401 si non authentifié, 403 si non admin sur routes admin

### E2E (optionnel, Playwright)
- Flux complet : inscription via lien → pronostic → vérification classement

---

## 10. Déploiement (Railway)

### Services Railway
1. **App Next.js** — build `npm run build`, start `npm start`
2. **PostgreSQL** — plan Hobby ou Pro selon charge
3. **Cron Job 1** — `POST https://app.railway.app/api/cron/sync-scores` toutes les 2 min
4. **Cron Job 2** — `POST https://app.railway.app/api/cron/reminders` toutes les heures

### Variables d'environnement Railway
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://scorecast.up.railway.app
RESEND_API_KEY=...
FOOTBALL_API_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@scorecast.app
CRON_SECRET=...
```

### Commandes
```bash
# Installer les dépendances
npm install

# Migrations et seed
npx prisma migrate deploy
npx prisma db seed

# Build et start
npm run build
npm start
```

---

## 11. Données pré-intégrées (seed)

### Équipes 2026 (48)
Seedées via `prisma/seed.ts` avec : nom, code FIFA, URL drapeau (ex: flagcdn.com), groupe de phase de poules (A–L), classement FIFA.

### Matchs 2026 (104)
- 72 matchs de phase de groupes (6 matchs × 12 groupes)
- 32 matchs éliminatoires (R32 : 16, R16 : 8, QF : 4, SF : 2, 3ème place : 1, Finale : 1)
- `externalId` mappé depuis football-data.org (competition WC2026)
- Stades et villes inclus

---

## 12. Visibilité des pronostics

| Contexte | Ce que l'utilisateur voit |
|----------|--------------------------|
| Avant `cutoffAt` | Son pronostic uniquement |
| Après `cutoffAt` (match non terminé) | Pronostics des membres de son groupe actif |
| Après `Match.status = FINISHED` | Pronostics + points de tous les membres du groupe |
| Classement global | Visible par tous les utilisateurs (sans filtre groupe) |
| Classement par groupe | Visible uniquement aux membres du groupe |

---

## 13. Estimation d'effort

### Sprint initial (prototype fonctionnel) — 7–10 jours

| Tâche | Effort |
|-------|--------|
| Setup Next.js + Prisma + Railway | 0.5j |
| Schema Prisma + seed équipes + matchs | 1j |
| Auth NextAuth (login, invite, reset mdp) | 1j |
| CRUD matchs + pronostics (API + UI) | 1.5j |
| Calcul des points + cron sync-scores | 1j |
| Classement global | 0.5j |
| Admin barème + invitations | 0.5j |
| Tests unitaires scoring | 0.5j |
| Déploiement Railway | 0.5j |
| **Total sprint 1** | **~7–8 jours** |

### Version complète — 3–4 semaines supplémentaires

| Tâche | Effort |
|-------|--------|
| Groupes d'utilisateurs + classement par groupe | 2j |
| Notifications email (Resend) | 1j |
| Notifications push (Web Push) | 1.5j |
| i18n FR/EN (next-intl) | 1j |
| Profil utilisateur + avatar | 0.5j |
| Page règles + aide | 0.5j |
| Interface admin complète | 2j |
| Tests intégration API | 1.5j |
| UI polish + responsive final | 2j |
| **Total version complète** | **~12–14 jours** |
