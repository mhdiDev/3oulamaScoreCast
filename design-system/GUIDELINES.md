# 3oulama ScoreCast — Design System Guidelines

## Fichiers livrés

| Fichier | Contenu |
|---------|---------|
| `tokens/tailwind.config.ts` | Config Tailwind complète — couleurs, typo, espacements, ombres, animations |
| `tokens/tokens.css` | CSS custom properties — à importer dans `globals.css` |
| `components/Button.tsx` | Bouton accessible avec variants, sizes, loading state |
| `components/ScoreCounter.tsx` | Compteur de score pronostic avec aria-live |
| `components/Badge.tsx` | Badges état match et résultat pronostic |
| `components/LeaderboardRow.tsx` | Ligne de classement avec mise en évidence du user courant |
| `assets/icons.svg` | Sprite SVG — 9 icônes (logo, ball, trophy, calendar, leaderboard, user, bell, settings, timer, check, home) |

---

## Utilisation des tokens

### Importer les styles
```tsx
// app/globals.css
@import '../design-system/tokens/tokens.css';
```

### Tailwind
Copier `tokens/tailwind.config.ts` à la racine du projet Next.js.

### Icônes SVG
```tsx
// Dans layout.tsx — inclure le sprite une fois
import icons from '@/design-system/assets/icons.svg'

// Usage dans les composants
<svg aria-hidden="true" focusable="false" width="20" height="20">
  <use href="#icon-ball" />
</svg>

// Avec label accessible (bouton icône seul)
<button aria-label="Voir le classement">
  <svg aria-hidden width="20" height="20"><use href="#icon-leaderboard" /></svg>
</button>
```

---

## Accessibilité WCAG AA — Checklist

### Couleurs & contraste
- ✅ Texte principal (#f1f5f9 sur #020d1a) → 19.5:1 **AAA**
- ✅ Texte secondaire (#94a3b8 sur #0a2540) → 5.1:1 **AA**
- ✅ Bouton primaire (white sur #154d8f) → 4.8:1 **AA**
- ✅ Bouton gold (#020d1a sur #f59e0b) → 9.2:1 **AAA**
- ⚠️ Texte muet (#64748b) — utiliser uniquement en taille ≥ 18px ou ≥ 14px bold
- ❌ Ne jamais utiliser la couleur seule pour transmettre une info — toujours ajouter icône ou texte

### Focus & navigation clavier
```css
/* tokens.css — déjà inclus */
:focus-visible {
  outline: 2px solid var(--color-pitch-400);
  outline-offset: 2px;
}
```
- Tous les éléments interactifs doivent être atteignables au clavier (Tab/Shift+Tab)
- Ordre de focus logique — suivre l'ordre visuel
- Modales : focus trap + Escape pour fermer
- Skip-to-content link en haut de chaque page (déjà dans tokens.css)

### Touch targets (mobile)
```css
/* Min 44×44px sur tous les éléments interactifs */
.btn { min-height: 44px; }
.score-btn { min-width: 44px; min-height: 44px; }
```

### ARIA sur les composants clés

**ScoreCounter**
```tsx
<output aria-live="polite" aria-atomic="true" aria-label="2 buts pour France">
  2
</output>
<button aria-label="Augmenter score France">+</button>
```

**Classement (live updates)**
```tsx
<div role="status" aria-live="polite" aria-label="Classement mis à jour">
  {/* Rows */}
</div>
```

**Match LIVE**
```tsx
<span aria-label="Match en cours, 67ème minute">● LIVE 67'</span>
```

**Drapeaux**
```tsx
<img src="/flags/fr.svg" alt="Drapeau France" width="24" height="16" />
// ou en emoji :
<span role="img" aria-label="Drapeau France">🇫🇷</span>
```

**Notifications toast**
```tsx
<div role="alert" aria-live="assertive">
  ✅ Pronostic enregistré !
</div>
```

### Reduced motion
```css
/* tokens.css — déjà inclus */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive — Breakpoints

| Breakpoint | Largeur | Layout |
|------------|---------|--------|
| `xs` | 390px | Mobile — bottom tab bar, 1 colonne |
| `sm` | 640px | Mobile large — espacements augmentés |
| `md` | 768px | Tablette — bottom tab ou sidebar compacte |
| `lg` | 1024px | Desktop — sidebar fixe 240px |
| `xl` | 1280px | Desktop large — contenu max 1200px centré |

```tsx
// Pattern responsive sidebar / bottom bar
<nav className="
  fixed bottom-0 inset-x-0 flex lg:hidden           /* Mobile: bottom */
  lg:fixed lg:top-0 lg:left-0 lg:flex-col lg:h-full /* Desktop: sidebar */
">
```

---

## Composants Tailwind — Snippets prêts à l'emploi

### Card match
```tsx
<div className="bg-pitch-800 border border-border rounded-lg p-3 mb-2
                hover:border-pitch-500 hover:bg-pitch-700
                transition-all duration-base cursor-pointer">
  <div className="flex items-center justify-between gap-2">
    <TeamInfo flag="🇫🇷" name="France" />
    <ScoreOrCTA />
    <TeamInfo flag="🇲🇦" name="Maroc" />
  </div>
</div>
```

### Stat widget (dashboard)
```tsx
<div className="bg-pitch-800 border border-border rounded-lg p-3 text-center">
  <div className="text-xl font-extrabold text-gold-300">{value}</div>
  <div className="text-xs text-text-muted mt-0.5">{label}</div>
</div>
```

### Hero gradient (rang)
```tsx
<div className="bg-gradient-to-br from-pitch-700 to-pitch-600
                rounded-lg p-4 relative overflow-hidden">
  <div className="text-xs text-white/50 uppercase tracking-widest">Ton rang</div>
  <div className="text-3xl font-extrabold mt-1">🥈 2ème</div>
  <div className="text-gold-300 font-bold">47 points</div>
</div>
```

### Input accessible
```tsx
<div>
  <label htmlFor={id} className="block text-sm text-text-secondary mb-1.5">
    {label}{required && <span className="text-red-400 ml-1" aria-label="requis">*</span>}
  </label>
  <input
    id={id}
    className="w-full bg-pitch-900 border border-border rounded-lg
               px-3.5 py-2.5 text-sm text-text-primary
               placeholder:text-text-muted
               focus-visible:outline-2 focus-visible:outline-pitch-400
               aria-invalid:border-red-400
               transition-colors duration-fast"
  />
  {error && <p role="alert" className="text-xs text-red-400 mt-1.5">{error}</p>}
</div>
```

---

## Animations — Usage

```tsx
// Score qui change → pop
<output className="transition-all duration-fast animate-score-pop">{score}</output>

// Apparition d'un élément
<div className="animate-slide-up">{content}</div>

// Badge LIVE clignotant
<span className="animate-pulse-live">● LIVE</span>

// Glow sur carte active
<div className="shadow-glow">{card}</div>
```

---

## i18n — Namespaces suggérés

```
messages/
  fr/
    common.json     # Boutons, labels génériques
    matches.json    # Noms de phases, statuts
    predictions.json # Pronostic, coupure, barème
    leaderboard.json # Classement, stats
    admin.json      # Interface admin
  en/
    (même structure)
```

```json
// fr/predictions.json
{
  "title": "Ton pronostic",
  "confirm": "Confirmer le pronostic",
  "cutoff": "Coupure dans {time}",
  "saved": "Pronostic enregistré !",
  "scoring": {
    "exact": "Score exact — {points} pts",
    "correct": "Bon résultat — {points} pt",
    "wrong": "Mauvais pronostic — 0 pt"
  }
}
```
