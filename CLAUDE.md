# THREEP Website AI Context

## Project Overview

THREEP is an experimental streetwear brand focused on atmosphere, visual storytelling, emotion, and mixed-media aesthetics.

The brand is not built around luxury fashion, hype culture, or generic streetwear trends.

THREEP should feel:

* cinematic
* dark
* immersive
* experimental
* futuristic but raw
* emotionally charged
* slightly chaotic
* analog and digital at the same time

The website should feel more like an audiovisual experience than a traditional ecommerce page.

The user should feel atmosphere first, information second.

---

# Core Aesthetic

Main inspirations:

* cyberpunk
* VHS
* analog distortion
* CRT screens
* industrial environments
* underground street culture
* abandoned future aesthetics
* brutalist minimalism
* glitch visuals
* experimental typography
* dark urban loneliness
* technology decay
* cinematic transitions
* mixed media graphics

The visual language should feel immersive and emotional rather than clean and corporate.

---

# Design Philosophy

Avoid:

* generic startup UI
* SaaS aesthetics
* bright gradients
* corporate minimalism
* luxury fashion clichés
* overly polished interfaces
* generic Framer-style landing pages
* default Tailwind look
* “tech bro” aesthetics
* motivational branding language

Preferred:

* atmosphere over functionality
* tension and mood
* visual storytelling
* subtle chaos
* imperfect textures
* grain/noise overlays
* cinematic pacing
* fullscreen sections
* layered visuals
* analog feeling
* smooth but heavy transitions
* immersive typography
* dark interfaces with breathing space

The UI should feel intentional, artistic, and emotionally driven.

---

# Website Mood

The current website direction is:

* dark
* spacious
* cinematic
* minimal but emotional
* experimental
* immersive

The site should feel like:

* a digital installation
* an underground fashion campaign
* a futuristic VHS archive
* a visual mood piece

Not like:

* a traditional online store
* a startup landing page
* a corporate fashion website

---

# Motion & Animation

Motion is extremely important.

Animations should feel:

* smooth
* immersive
* atmospheric
* cinematic
* subtle but impactful

Preferred effects:

* VHS flicker
* analog noise
* subtle distortion
* glitch transitions
* smooth opacity fades
* slow movement
* cinematic loading screens
* layered hover effects
* ambient motion

Avoid:

* aggressive over-animation
* childish motion
* flashy UI gimmicks
* cheap cyberpunk clichés

Movement should feel premium, artistic, and emotional.

---

# Typography

Typography is a major part of the identity.

Preferred:

* experimental typography
* stretched text
* fragmented forms
* industrial feeling
* futuristic minimalism
* sharp graphic compositions
* aggressive but clean hierarchy

Typography should feel designed, not default.

---

# Development Stack

Current stack:

* React
* TypeScript
* TailwindCSS

Code should be:

* modular
* clean
* maintainable
* scalable
* component-driven

Do not overcomplicate architecture.

This is a visually-driven project, not an enterprise application.

---

# Frontend Direction

Focus on:

* immersive hero sections
* visual transitions
* cinematic layouts
* layered depth
* responsive experience
* smooth scrolling
* visual rhythm
* emotional pacing

The website should create feeling before explanation.

---

# Content Direction

Text should feel:

* minimal
* atmospheric
* confident
* mysterious
* emotionally loaded

Avoid:

* corporate copywriting
* generic marketing language
* “premium quality” clichés
* startup tone

---

# Brand Personality

THREEP feels:

* experimental
* emotionally intense
* visually driven
* rebellious
* atmospheric
* raw but intentional
* artistic
* underground
* futuristic
* slightly dystopian

The brand should feel human and expressive, not commercial-first.

---

# AI Behavior Instructions

When generating UI, code, or ideas:

* prioritize atmosphere
* prioritize visual identity
* prioritize emotional impact
* think like a creative director, not a startup designer
* preserve consistency with the THREEP aesthetic
* suggest artistic solutions when appropriate
* avoid generic templates and repetitive layouts

Always think in terms of:
mood → feeling → visual impact → interaction → information

not:
function → marketing → conversion → generic UI

The goal is to create an immersive digital identity for THREEP.

---

# Technical Guide (engineering)

This section is the engineering counterpart to the brand guide above. Deep, task-specific knowledge lives in the project skills under `.claude/skills/` — read them before working:
- **`threep-design`** — design tokens, CSS-variable system, button/card patterns, no-hardcode rules.
- **`threep-animations`** — existing keyframes, VHS/glitch/grain/marquee patterns, motion principles.
- **`threep-backend`** — DB schema, `lib/db.ts` helpers, `site_settings`, auth, admin conventions.

Subagents for delegation live in `.claude/agents/`: `frontend`, `backend`, `design-reviewer`.

## Stack & structure
- **Next.js 16 (App Router) + TypeScript + TailwindCSS + CSS Modules**, **PostgreSQL** via raw SQL (no ORM), **NextAuth 5** (email + 6-digit OTP). Files on S3/Yandex (`@aws-sdk/client-s3` + `sharp`).
- **server/client split**: `page.tsx` (server) fetches data via `lib/db` + `auth()` → passes props to `*Client.tsx` (`'use client'`) which holds state/interactivity. Don't fetch in client components.
- API routes in `app/api/**/route.ts`. Shared components in `components/`; page-specific components sit next to their page (e.g. `app/account/parts/`).
- Data access: `queryOne` / `queryMany` from `lib/db.ts`, parameterized (`$1`). Types in `lib/types.ts`.

## Clean code — NO hardcoding
- Colors, fonts, radii: **only CSS variables** (`var(--bg)`, `var(--accent)`, `var(--font-heading|body|price)`, `var(--radius-base)`). No `#hex`/`rgb()`/named colors in JSX or module CSS — the only exception is the token definitions in `app/globals.css` and the dynamic ones in `components/ThemeStyles.tsx`.
- Prefer the **role tokens** `--font-heading/body/price` over raw aliases `--font-onder/involve/deutsch`.
- Any new configurable visual/content value goes into the `site_settings` table (read via `/api/site-settings`, themed via `ThemeStyles.tsx`), not into a constant.

## Component separation
- Small, reusable components; **reuse** shared widgets (`ProductModal`, `MarqueeTicker`, `EmojiPicker`) instead of duplicating markup.
- Keep server-fetch and client-state responsibilities separate (the `page.tsx` → `*Client.tsx` pattern).

## Modular CSS
- **One `*.module.css` per component.** Shared patterns (`.neo-btn`, `.neo-card`, `.hud-corners`, grain, keyframes) live in `globals.css`.
- Avoid sprawling inline styles — the codebase has some legacy inline styling; prefer module classes and migrate inline → class when you touch a file.
- **Buttons** = neo-brutal: sharp corners, `border: 1px solid var(--accent)`, `box-shadow: 2px 2px 0 var(--accent)`, hover `translate(-1px,-1px)` + bigger shadow. Never smooth-rounded "brightness-hover" buttons.

## Responsive & themes
- Mobile breakpoint **`max-width: 639px`** (Tailwind `sm`). Wrap hover/`:active` transforms in `@media (hover: hover) and (pointer: fine)` (touch fires `:active` on tap-start). Inputs use `font-size: 16px` to avoid iOS zoom. Mobile button font: `var(--btn-fz-mobile)`.
- Themes: light (terracotta) / dark (charcoal + warm pink) via `data-theme` on `<html>` (`lib/theme.ts`). Theme-reactive client visuals observe `data-theme` with a `MutationObserver`.
- Always test against iOS Safari quirks (custom fonts, `:active`, autoplay video).

## Money (brand 333 — "the three of us")
All prices are multiples of 3. Logged-in users get a level-based discount; the discounted price is rounded **down** to a multiple of 3 (`Math.floor(x/3)*3`). Format via `lib/utils.ts`.

## Workflow
- After type/import changes run `npm run build`. Report changes as `file:line`. Don't claim visual/iOS correctness you couldn't actually verify — flag it for device testing instead.
- DB migrations: numbered idempotent `.sql` in `migration/`; apply against the live (Amvera) DB only with explicit confirmation.
