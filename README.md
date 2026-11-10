# SS Solutions — Website

Premium, futuristic marketing site for **SS Solutions** — a digital product
studio. Built as a self-marketing / client-conversion system, not a portfolio.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first tokens in `src/app/globals.css`)
- **Three.js** + **@react-three/fiber** + **@react-three/drei** — 3D scenes
- **GSAP** + **ScrollTrigger** — cinematic scroll animation
- **Lenis** — smooth scrolling, driven from the GSAP ticker
- **Framer Motion** — component-level reveals & micro-interactions
- **Lucide React** — icons

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## Editing content (no component changes needed)

All copy and data live in `src/data/`:

| File               | Controls                                              |
| ------------------ | ---------------------------------------------------- |
| `company.ts`       | Name, contact numbers, email, location, socials, `SITE_URL` |
| `navigation.ts`    | Navbar links + primary CTA                           |
| `services.ts`      | Section 3 — services, descriptions, capabilities     |
| `projects.ts`      | Section 4 — "What we build" concept cards            |
| `technologies.ts`  | Section 9 — technology universe (only list what you use) |
| `process.ts`       | Process steps, "why us", marketing flow, consultancy layers |

Placeholder values are marked `PLACEHOLDER` in comments — search for it.

### Project imagery

`src/data/projects.ts` points `image` at files in `/public/work/` (SVG covers + real screenshots).
Replace those files (or repoint `image`) with real screenshots — they already
render through `next/image`.

## Contact form

`POST /api/contact` validates the payload and delivers it via whichever
integration you configure in `.env.local` (see `.env.example`). With **no**
provider set, submissions are accepted and logged (fine for local/preview).

- `CONTACT_WEBHOOK_URL` — Zapier / Make / n8n / custom endpoint
- `FORMSPREE_ENDPOINT` — Formspree form URL
- `RESEND_API_KEY` + `CONTACT_TO_EMAIL` — Resend transactional email

No secrets are committed.

## Design principles

- **Neutral canvas, white does the talking.** Near-black background, neutral
  white hairlines. Violet is an accent only: the primary CTA, section index
  numbers, focus rings, the 3D mark, a few restrained hovers — nowhere else.
- **One conversion action.** "Start a project" is the single loud button on
  every screen (nav, hero, final CTA, sticky mobile bar). Everything else is a
  quiet `TextLink`.
- **3D supports the story, twice.** The hero (an "SS" object being crafted) and
  the closing CTA. No decorative 3D elsewhere.
- Type scale, spacing and motion are tokenised in `globals.css`
  (`--step-*`, `--gutter`, `--ease`, `t-display` / `t-h2` / `t-h3` / `t-lead`).

## Performance & accessibility

- Heavy 3D is `next/dynamic` + `ssr: false` and only mounts when near the
  viewport; it unmounts when scrolled away.
- `prefers-reduced-motion` disables Lenis, GSAP scroll effects, the custom
  cursor and all 3D — every heading/reveal falls back to plain, fully visible
  markup (no hidden content).
- DPR is capped (lower on mobile) and adapts under load via
  `PerformanceMonitor` + `AdaptiveDpr`.
- Particle counts and panel counts scale down on mobile.
- Nav items are real anchors; skip link targets `#main`; the hero `<h1>`
  animates on mount (not scroll) so it never blocks LCP.

## Project structure

```
src/
  app/            layout, page, api/contact, sitemap, robots, opengraph-image
  components/
    layout/       Navbar, MobileMenu, Footer, Logo
    providers/    SmoothScrollProvider (Lenis + GSAP)
    sections/     one file per homepage section
    three/        SceneCanvas, HeroScene + reusable 3D primitives
    ui/           MagneticButton, GlowCard, ScrollReveal, SectionHeading, …
  data/           editable content (see above)
  hooks/          useMediaQuery, useReducedMotion, useLenis
  lib/            animations (GSAP setup), constants, utils
  types/          shared TS types
```

## Going live (checklist)

1. **Contact form email** — in `.env.local` (and in your host's environment settings), set
   `GMAIL_APP_PASSWORD` (Google Account → Security → 2-Step Verification → App passwords).
   Until an email channel is set, the form still works: it hands the enquiry to WhatsApp
   so no lead is lost.
2. **Domain** — buy the domain, then set `NEXT_PUBLIC_SITE_URL=https://your-domain` so the
   sitemap, share previews and Google data use it.
3. **Hosting on Netlify** (settings are in `netlify.toml`)
   - On app.netlify.com → *Add new site* → *Import an existing project* → GitHub → pick this repo.
   - Build command `npm run build`, publish directory `.next` (Netlify fills these in from `netlify.toml`).
   - *Site configuration → Environment variables*: add the same keys as `.env.local`
     (at least `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `NEXT_PUBLIC_SITE_URL` = your Netlify / custom domain URL).
   - Every push to the `main` branch redeploys the site automatically.
   - Custom domain: *Domain management → Add a domain* and follow the DNS steps.
4. **Analytics** — set `NEXT_PUBLIC_GA_ID` for Google Analytics (Vercel Analytics only runs when hosted on Vercel).
5. **Google** — submit `https://your-domain/sitemap.xml` in Google Search Console and create a
   Google Business Profile for "SS Solutions, Pune" with the same phone numbers and website.

### Content you can drop in later
- **Founder photos** — put `satej.jpg` / `sahil.jpg` in `public/team/` and uncomment the
  `photo` lines in `src/data/company.ts`.
- **Prices** — add `price: "From ₹…"` to the plans in `src/components/sections/Engagements.tsx`.
- **Social links** — replace the `"#"` URLs in `src/data/company.ts` (links left as `#` stay hidden).
- **Working hours** (for the "Online now" badge) — `hours` in `src/data/company.ts`.
- **Articles** — add posts to `src/data/blog.ts`; FAQ answers live in `src/data/faq.ts`.
