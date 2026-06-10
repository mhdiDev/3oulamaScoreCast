# 3oulama ScoreCast — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-stack World Cup 2026 prediction app for a private group of friends.

**Architecture:** Next.js 14 App Router monolith with Prisma/PostgreSQL, NextAuth.js v5, Tailwind CSS, deployed on Railway. Scores sync automatically via football-data.org API.

**Tech Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL, NextAuth.js v5, Tailwind CSS, next-intl, Resend, Web Push, Jest, Railway.

---

### Task 1: Project scaffold
- [ ] Run `npx create-next-app@latest` with TypeScript + Tailwind + App Router
- [ ] Install all dependencies
- [ ] Configure tsconfig, eslint, .env.local
- [ ] Init git, first commit

### Task 2: Prisma schema + seed
- [ ] Write prisma/schema.prisma (10 models)
- [ ] Write prisma/seed.ts (48 teams + 104 matches)
- [ ] Run migrate dev + seed

### Task 3: Auth (NextAuth + invitations)
- [ ] lib/auth.ts, lib/prisma.ts
- [ ] api/auth routes
- [ ] Invitation token flow

### Task 4: Core scoring logic + tests
- [ ] lib/scoring.ts with calculatePoints
- [ ] __tests__/scoring.test.ts (100% coverage)

### Task 5: API routes (matches, predictions, leaderboard)
- [ ] All GET/PUT endpoints

### Task 6: Football API client + cron sync
- [ ] lib/football-api.ts
- [ ] api/cron/sync-scores/route.ts
- [ ] api/cron/reminders/route.ts

### Task 7: Admin API routes
- [ ] scoring, invitations, groups, users, matches correction

### Task 8: UI — Layout + navigation
- [ ] Root layout, middleware, navigation components

### Task 9: UI — App pages
- [ ] Dashboard, matches, prediction, leaderboard, profile, rules

### Task 10: UI — Admin pages
- [ ] Admin dashboard, groups, invitations, users, scoring

### Task 11: Notifications
- [ ] lib/notifications.ts (Resend + Web Push)
- [ ] public/sw.js service worker

### Task 12: i18n
- [ ] next-intl config, messages/fr, messages/en

### Task 13: Integration tests
- [ ] predictions API, leaderboard, cron, auth guard

### Task 14: Deployment
- [ ] railway.toml, .env.example, README
