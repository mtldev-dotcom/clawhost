# ENCLAVE — Design System & Brand Guide
> For Claude Code · Companion to ENCLAVE_PRD.md · March 2026

---

## The Mascot: Cleo the Hermit Crab 🦀

**Name:** Cleo (gender-neutral)

**Why a hermit crab:**
- OpenClaw (our runtime) uses a lobster as its mascot — Cleo is a natural family member
- A hermit crab *literally lives inside its own private shell* — that IS Enclave
- It carries its home everywhere (persistent memory — never forgets)
- Nobody enters without permission (privacy-first architecture)
- Cute, immediately recognizable, works at 16px favicon size

**Personality:**
Cleo is smart, warm, and a little nerdy. Cleo takes the job seriously but isn't stuffy.
Cleo's shell has a small emerald gem on it — the Enclave accent color.

**Usage rules:**
- Full Cleo (with shell + claws) — splash screens, onboarding, empty states, marketing
- Cleo head only (eyes + antennae) — loading spinners, small UI indicators
- Cleo shell gem icon — favicon, app icon, small brand marks
- Never use Cleo in error states (only neutral/positive contexts)
- Cleo's expressions: curious (default), happy (task completed), sleepy (idle/offline)

---

## Color System

```css
:root {
  /* ── Core Palette ── */
  --enclave-bg:         #0a0e14;   /* Near-black background */
  --enclave-surface:    #111620;   /* Card / panel background */
  --enclave-surface-2:  #161d2d;   /* Elevated surface (modals, dropdowns) */
  --enclave-border:     #1e2736;   /* Subtle borders */
  --enclave-border-2:   #2a3850;   /* Active/hover borders */

  /* ── Text ── */
  --enclave-text:       #c8d4e8;   /* Body text */
  --enclave-text-2:     #8899b4;   /* Secondary / muted text */
  --enclave-text-3:     #4d607a;   /* Disabled / placeholder */
  --enclave-heading:    #f0f6ff;   /* Headings / emphasis */

  /* ── Accent (Emerald — use sparingly, once per screen max) ── */
  --enclave-accent:     #10b981;   /* Primary accent */
  --enclave-accent-dim: #0d9668;   /* Hover / active state */
  --enclave-accent-glow:rgba(16,185,129,0.12); /* Glow / tint backgrounds */
  --enclave-accent-text:#6ee7b7;   /* Accent text on dark bg */

  /* ── Status Colors ── */
  --enclave-success:    #10b981;   /* Same as accent */
  --enclave-warning:    #f59e0b;   /* Amber */
  --enclave-error:      #f87171;   /* Soft red */
  --enclave-info:       #60a5fa;   /* Blue */

  /* ── Cleo's Shell Colors (for mascot + decorative elements) ── */
  --cleo-shell-light:   #1de9a0;
  --cleo-shell-mid:     #10b981;
  --cleo-shell-dark:    #064e35;
  --cleo-body:          #f59e4a;
  --cleo-claw:          #f97316;
}
```

**Color rules:**
- `--enclave-accent` appears **once per screen max** — the most important interactive element
- Backgrounds are always dark — this is not a light-mode app at launch
- Warning amber is for "needs attention", never for decoration
- Error red is soft, not alarming — the product should feel calm

---

## Typography

```css
/* ── Font Stack ── */

/* Display / Headings — Syne */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

/* Body / UI / Code — JetBrains Mono */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

:root {
  --font-display: 'Syne', sans-serif;
  --font-body:    'JetBrains Mono', monospace;
}
```

**Why these fonts:**
- **Syne** — geometric, modern, slightly technical. Feels premium without feeling corporate. Used for headings, the wordmark, and large UI text.
- **JetBrains Mono** — monospace with personality. Reinforces the "this is your private command center" feeling. The mono font makes every piece of data feel precise.

**Type scale:**
```css
/* Headings */
.text-display  { font: 800 48px/1.1 var(--font-display); letter-spacing: -0.03em; }
.text-h1       { font: 700 32px/1.2 var(--font-display); letter-spacing: -0.02em; }
.text-h2       { font: 700 24px/1.3 var(--font-display); letter-spacing: -0.01em; }
.text-h3       { font: 600 18px/1.4 var(--font-display); }
.text-h4       { font: 700 11px/1  var(--font-body); letter-spacing: 0.12em; text-transform: uppercase; }

/* Body */
.text-body     { font: 400 14px/1.7 var(--font-body); }
.text-body-sm  { font: 400 12px/1.6 var(--font-body); }
.text-label    { font: 600 11px/1  var(--font-body); letter-spacing: 0.08em; }
.text-code     { font: 400 13px/1.6 var(--font-body); }
```

---

## Spacing & Layout

```css
:root {
  /* Base unit: 4px */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;

  /* Layout */
  --sidebar-width:      240px;
  --header-height:      56px;
  --content-max-width:  900px;
  --panel-radius:       10px;
  --card-radius:        8px;
  --button-radius:      6px;
  --input-radius:       6px;
  --badge-radius:       4px;
}
```

**Grid system:**
- Dashboard uses a fixed left sidebar (`--sidebar-width`) + fluid main content
- Main content max-width: `--content-max-width` (centered, not full-bleed)
- Card grids: `repeat(auto-fill, minmax(280px, 1fr))`
- Mobile breakpoint: `640px` — sidebar collapses to a bottom tab bar

---

## Component Patterns

### Buttons

```css
/* Primary — emerald, used for the single most important action on screen */
.btn-primary {
  background: var(--enclave-accent);
  color: #0f172a;
  font: 600 13px/1 var(--font-body);
  padding: 10px 18px;
  border-radius: var(--button-radius);
  border: none;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.btn-primary:hover   { background: var(--enclave-accent-dim); }
.btn-primary:active  { transform: scale(0.98); }

/* Secondary — outlined */
.btn-secondary {
  background: transparent;
  color: var(--enclave-text);
  border: 1px solid var(--enclave-border-2);
  padding: 9px 17px;
  border-radius: var(--button-radius);
  font: 600 13px/1 var(--font-body);
  transition: border-color 0.15s, color 0.15s;
}
.btn-secondary:hover { border-color: var(--enclave-accent); color: var(--enclave-accent); }

/* Ghost — no border, for low-priority actions */
.btn-ghost {
  background: transparent;
  color: var(--enclave-text-2);
  border: none;
  padding: 8px 12px;
  border-radius: var(--button-radius);
  font: 500 13px/1 var(--font-body);
}
.btn-ghost:hover { background: rgba(255,255,255,0.04); color: var(--enclave-text); }
```

**Button rules:**
- Max **one** `.btn-primary` per screen (the most important action)
- Destructive actions use `.btn-secondary` with `color: var(--enclave-error)` on hover
- Loading state: replace text with a 3-dot pulse animation (no spinner, it feels calmer)

### Cards / Panels

```css
.card {
  background: var(--enclave-surface);
  border: 1px solid var(--enclave-border);
  border-radius: var(--card-radius);
  padding: var(--space-6);
  transition: border-color 0.2s;
}
.card:hover       { border-color: var(--enclave-border-2); }
.card.card-active { border-color: var(--enclave-accent-dim); background: var(--enclave-accent-glow); }
```

### Status Badges

```css
.badge { display: inline-flex; align-items: center; gap: 5px;
         font: 700 10px/1 var(--font-body); letter-spacing: 0.08em;
         text-transform: uppercase; padding: 3px 8px; border-radius: 3px; }

.badge-live    { background: rgba(16,185,129,.12); color: #10b981; border: 1px solid rgba(16,185,129,.3); }
.badge-pending { background: rgba(245,158,11,.10); color: #f59e0b; border: 1px solid rgba(245,158,11,.3); }
.badge-error   { background: rgba(248,113,113,.10); color: #f87171; border: 1px solid rgba(248,113,113,.3); }
.badge-phase1  { background: rgba(59,130,246,.10);  color: #60a5fa; border: 1px solid rgba(59,130,246,.3); }
```

### Input Fields

```css
.input {
  background: var(--enclave-surface);
  border: 1px solid var(--enclave-border);
  border-radius: var(--input-radius);
  color: var(--enclave-heading);
  font: 400 14px/1 var(--font-body);
  padding: 10px 14px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input::placeholder { color: var(--enclave-text-3); }
.input:focus {
  border-color: var(--enclave-accent);
  box-shadow: 0 0 0 3px var(--enclave-accent-glow);
}
.input-error { border-color: var(--enclave-error); }
```

### Section Headers

```css
/* The "// SECTION NAME ─────" pattern used throughout */
.section-label {
  display: flex; align-items: center; gap: 8px;
  font: 700 10px/1 var(--font-body);
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--enclave-text-3);
  margin-bottom: 16px;
}
.section-label::after {
  content: ''; flex: 1; height: 1px;
  background: var(--enclave-border);
}
```

---

## Page-Level Layout Patterns

### Dashboard Shell

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (56px)                                          │
│  [🦀 Enclave]          [Status badge]  [Avatar]        │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ SIDEBAR  │  MAIN CONTENT                               │
│ (240px)  │  max-width: 900px, centered                 │
│          │                                              │
│ 💬 Chat  │                                              │
│ 📁 Files │                                              │
│ 🧠 Memory│                                              │
│ 🔌 Apps  │                                              │
│ 🧩 Skills│                                              │
│ ⚙️ Setts │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

**Sidebar items:**
| Icon | Label | Route | Phase |
|------|-------|-------|-------|
| 💬 | Chat | /dashboard/chat | Phase 2 |
| 📁 | Workspace | /dashboard/workspace | Phase 2 |
| 🧠 | Memory | /dashboard/memory | Phase 3 |
| 🔌 | Apps | /dashboard/settings/integrations | Phase 2 |
| 🧩 | Skills | /dashboard/skills | Phase 4 |
| 👥 | Team | /dashboard/team | Phase 5 |
| ⚙️ | Settings | /dashboard/settings | Phase 1 |

Hide menu items the user's tier can't access (don't show at all — not locked, hidden).

### Empty States

Every empty state uses Cleo with a short, warm message. Never generic "No data found."

```tsx
// Example empty states:
<EmptyState
  mascot="cleo-curious"
  title="Your workspace is empty"
  subtitle="Upload a file or ask your agent to create one."
  action={{ label: "Upload a file", href: "#upload" }}
/>

<EmptyState
  mascot="cleo-sleepy"
  title="No memories yet"
  subtitle="Start chatting with your agent — it will remember everything."
/>
```

### Loading States

- Page-level loading: Cleo's shell gem pulsing (not a spinner)
- Component-level loading: skeleton shimmer (dark version)
- Chat message loading: three dots typing indicator with agent name

```css
/* Shell gem pulse animation */
@keyframes cleoGlow {
  0%, 100% { filter: drop-shadow(0 0 4px #10b981); opacity: 0.8; }
  50%       { filter: drop-shadow(0 0 12px #10b981); opacity: 1; }
}
.cleo-loading { animation: cleoGlow 1.4s ease-in-out infinite; }

/* Skeleton shimmer */
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--enclave-surface) 25%,
    var(--enclave-border) 50%,
    var(--enclave-surface) 75%
  );
  background-size: 800px 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
```

---

## Motion & Animation

**Principles:**
- Animations should feel like the product is breathing, not performing
- Page transitions: 200ms fade + 8px Y translate (fast)
- Component reveals: 300ms stagger (delayed per child, 40ms apart)
- Hover states: 150ms — fast enough to feel responsive
- Modal open: 200ms scale from 0.96 + fade
- Never animate things that aren't interactive (no looping decorations)

```css
/* Standard transitions */
:root {
  --transition-fast:   150ms ease;
  --transition-base:   200ms ease;
  --transition-slow:   300ms ease;
  --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1); /* bouncy */
}

/* Page-level fade in */
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-enter { animation: pageEnter 200ms ease both; }

/* Staggered card reveals */
.card-grid > *:nth-child(1) { animation-delay: 0ms; }
.card-grid > *:nth-child(2) { animation-delay: 40ms; }
.card-grid > *:nth-child(3) { animation-delay: 80ms; }
.card-grid > *:nth-child(4) { animation-delay: 120ms; }
```

---

## Tailwind Config

Add to `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        enclave: {
          bg:       '#0a0e14',
          surface:  '#111620',
          surface2: '#161d2d',
          border:   '#1e2736',
          border2:  '#2a3850',
          text:     '#c8d4e8',
          text2:    '#8899b4',
          text3:    '#4d607a',
          heading:  '#f0f6ff',
          accent:   '#10b981',
          'accent-dim':  '#0d9668',
          'accent-glow': 'rgba(16,185,129,0.12)',
          warning:  '#f59e0b',
          error:    '#f87171',
          info:     '#60a5fa',
        },
        cleo: {
          shell:  '#10b981',
          body:   '#f59e4a',
          claw:   '#f97316',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'h1':      ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2':      ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h3':      ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'label':   ['11px', { lineHeight: '1',   letterSpacing: '0.12em',  fontWeight: '700' }],
      },
      borderRadius: {
        'panel':  '10px',
        'card':   '8px',
        'button': '6px',
      },
      boxShadow: {
        'glow-accent': '0 0 0 3px rgba(16,185,129,0.12)',
        'glow-cleo':   '0 0 20px rgba(16,185,129,0.3)',
        'panel':       '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'cleo-glow':   'cleoGlow 1.4s ease-in-out infinite',
        'page-enter':  'pageEnter 200ms ease both',
        'shimmer':     'shimmer 1.5s infinite',
        'fade-up':     'fadeUp 300ms ease both',
      },
      keyframes: {
        cleoGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px #10b981)', opacity: '0.8' },
          '50%':       { filter: 'drop-shadow(0 0 12px #10b981)', opacity: '1' },
        },
        pageEnter: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## Cleo Component (React)

Create `src/components/Cleo.tsx`:

```tsx
import cleoSvgUrl from '@/assets/cleo.svg'

type CleoMood = 'default' | 'happy' | 'curious' | 'sleepy' | 'thinking'
type CleoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizes: Record<CleoSize, number> = {
  xs: 24, sm: 40, md: 64, lg: 96, xl: 160
}

interface CleoProps {
  mood?: CleoMood
  size?: CleoSize
  className?: string
  loading?: boolean  // triggers glow pulse animation
}

export function Cleo({ mood = 'default', size = 'md', className, loading }: CleoProps) {
  const px = sizes[size]
  return (
    <img
      src={cleoSvgUrl}
      alt="Cleo, Enclave's mascot"
      width={px}
      height={px}
      className={[
        'select-none',
        loading ? 'animate-cleo-glow' : '',
        className,
      ].filter(Boolean).join(' ')}
      data-mood={mood}
    />
  )
}

// ── Empty State wrapper ──────────────────────────────────────
interface EmptyStateProps {
  title: string
  subtitle?: string
  action?: { label: string; onClick?: () => void; href?: string }
  mascotMood?: CleoMood
}

export function EmptyState({ title, subtitle, action, mascotMood = 'curious' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Cleo mood={mascotMood} size="lg" className="opacity-80" />
      <div>
        <p className="font-display font-bold text-enclave-heading text-h3">{title}</p>
        {subtitle && <p className="text-enclave-text2 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action && (
        <a
          href={action.href}
          onClick={action.onClick}
          className="btn-primary mt-2"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
```

---

## Brand Voice

**Do:**
- "Your agent is ready" (not "Your AI is ready")
- "Cleo is thinking..." (not "Loading...")
- "Connected" (not "Integration active")
- "Your workspace" (not "Your files")
- "Cleo remembered that" (not "Memory updated")

**Don't:**
- Never say "AI-powered" anywhere in the UI
- Never say "chatbot"
- Never say "we can see your data" — ever
- No exclamation marks in system messages (feels fake)
- No "awesome!", "amazing!", "great job!" anywhere

**Microcopy examples:**
```
Onboarding step 1:  "Tell Cleo your name — she'll remember it forever."
Empty chat:         "Cleo is ready. What's on your mind?"
File uploaded:      "Added to your workspace."
Memory saved:       "Cleo will remember that."
Integration error:  "Couldn't connect. Check your credentials."
Subscription CTA:   "Unlock the full Cleo."
```

---

## Where to Put These Files

```
src/
├── assets/
│   ├── cleo.svg                    ← The mascot SVG
│   ├── cleo-happy.svg              ← (Phase 2 — alternate mood)
│   └── cleo-sleepy.svg             ← (Phase 2 — alternate mood)
├── components/
│   ├── Cleo.tsx                    ← Mascot component + EmptyState
│   └── ui/
│       ├── Badge.tsx               ← Status badges
│       ├── Button.tsx              ← btn-primary, btn-secondary, btn-ghost
│       ├── Card.tsx                ← .card pattern
│       ├── Input.tsx               ← .input pattern
│       ├── SectionLabel.tsx        ← // SECTION NAME ─── pattern
│       └── Skeleton.tsx            ← Loading shimmer
├── styles/
│   └── globals.css                 ← CSS variables + base styles
└── tailwind.config.ts              ← Extended config (above)
```

---

## Implementation Priority for Claude Code

Build these in order within Phase 1:

1. `src/styles/globals.css` — CSS variables + font imports + base resets
2. `tailwind.config.ts` — extend with Enclave tokens
3. `src/assets/cleo.svg` — copy the mascot SVG
4. `src/components/Cleo.tsx` — mascot component + EmptyState
5. `src/components/ui/Button.tsx` — 3 button variants
6. `src/components/ui/Card.tsx` — card + active state
7. `src/components/ui/Badge.tsx` — status badges
8. `src/components/ui/Input.tsx` — input + focus state
9. `src/components/ui/SectionLabel.tsx` — the `// LABEL ───` pattern
10. Apply to all existing pages (dashboard, onboarding, auth)

All subsequent phases must use these components — no inline styles, no one-off color values.
