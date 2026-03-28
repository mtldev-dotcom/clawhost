---
name: brand
description: NestAI brand guidelines - colors, typography, spacing, components. Use when building UI, reviewing designs, or creating any visual asset.
---

# NestAI Brand Guidelines

## App Name
**NestAI** (public-facing brand)
- Domains: nestai.app / app.nestai.app / user.nestai.app
- Tagline: "Your AI. Running 24/7."

---

## Colors — Only These 5

| Name    | Hex       | Tailwind        | Usage                          |
|---------|-----------|-----------------|--------------------------------|
| Ink     | `#0A0A0A` | `ink`           | CTAs, logo, high-emphasis text |
| Chalk   | `#F7F7F5` | `chalk`         | Page backgrounds, surfaces     |
| Mint    | `#E8F5F0` | `emerald-light` | Success bg, subtle fills       |
| Emerald | `#1D9E75` | `emerald`       | ONE accent per screen only     |
| White   | `#FFFFFF` | `white`         | Primary surface                |

### Dark Mode
| Name       | Hex       | Usage                    |
|------------|-----------|--------------------------|
| Background | `#0A0A0A` | Page background (ink)    |
| Surface    | `#141414` | Cards, elevated surfaces |
| Text       | `#F7F7F5` | Primary text (chalk)     |
| Muted      | `#71717A` | Secondary text           |

### Rules
- Emerald appears **once per screen maximum**
- Never use Emerald decoratively
- No other colors. Ever.
- No gradients, no shadows, no blur

---

## Typography

| Role    | Size | Weight | Tracking  | Tailwind Class  |
|---------|------|--------|-----------|-----------------|
| Display | 32px | 500    | -0.03em   | `text-display`  |
| Heading | 22px | 500    | -0.02em   | `text-heading`  |
| Body    | 16px | 400    | 0         | `text-body`     |
| Label   | 12px | 500    | +0.07em   | `text-label`    |

- **Font**: Geist (via next/font), fallback Inter
- **Weights**: 400 and 500 only — never 600 or 700
- **Case**: Sentence case always — no ALL CAPS, no Title Case

---

## Spacing Scale

`4 — 8 — 12 — 16 — 24 — 32 — 48 — 64px`

| Context        | Value |
|----------------|-------|
| Page padding   | 24px mobile / 48px desktop |
| Section gaps   | 64px |
| Card padding   | 24px |
| Component gaps | 8–16px |

---

## Components

| Element       | Radius | Notes                        |
|---------------|--------|------------------------------|
| Small buttons | 8px    | `rounded-sm`                 |
| Cards         | 12px   | `rounded-md`                 |
| Pills/badges  | 20px   | `rounded-pill`               |
| Borders       | 0.5px  | `border` with `border-subtle`|

### Button Patterns
```tsx
// Primary CTA
<button className="w-full min-h-[44px] bg-ink text-white rounded-sm font-medium">
  Deploy Agent
</button>

// Secondary
<button className="w-full min-h-[44px] bg-transparent text-ink border border-subtle rounded-sm font-medium hover:bg-chalk">
  Cancel
</button>
```

### Card Pattern
```tsx
<div className="bg-white border border-subtle rounded-md p-6">
  {/* No shadow, ever */}
</div>
```

---

## Mobile Rules

- Design at **390px first**
- Minimum tap target: **44px**
- No horizontal scroll
- Bottom-anchored CTAs
- Full-width buttons

---

## Motion

- Duration: `150ms`
- Easing: `ease`
- Properties: `opacity` + `translateY` only
- Max duration: `200ms`

```tsx
className="transition-opacity duration-150 ease"
```

---

## Voice & Tone

Direct. Calm. No hype.

| ❌ Don't | ✅ Do |
|----------|-------|
| "Congratulations! Successfully deployed!" | "Your agent is live." |
| "Please provide your API token to proceed" | "Paste your Telegram token." |
| "An unexpected error has occurred" | "Something went wrong." |
| "Successfully connected!" | "Connected." |

Rules:
- No exclamation marks in UI
- Short sentences
- Active voice
- No jargon

---

## Never Do

- Gradients
- Box shadows or drop shadows
- More than 2 font weights (400, 500)
- More than 1 accent color per screen
- ALL CAPS in body text
- Exclamation marks in UI
- Animations over 200ms
- Horizontal scroll on mobile

---

## Quick Reference

```tsx
// Primary colors
bg-ink text-white           // CTA button
bg-chalk                    // Page background
bg-white border-subtle      // Card
text-emerald                // Active state (one per screen!)
bg-emerald-light            // Success background

// Dark mode
dark:bg-ink dark:text-chalk
dark:bg-surface             // Elevated card

// Typography
text-display font-medium tracking-tight
text-heading font-medium
text-body
text-label uppercase tracking-wide
```
