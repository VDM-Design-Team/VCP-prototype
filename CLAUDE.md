# VCP Prototype

The team's **shared clickable prototype** of VCP: one screen per route, built
only from the VCP Design System package (`@vdm-design-team/vcp-design-system`)
with sample data. Designers build screens here; the dev team builds the real
app from them. `main` is the prototype everyone clicks through.

@AGENTS.md

## Rules — apply to every change

1. **Build only from the design system.** Every control, tag, table, modal,
   bar and rail comes from `@vdm-design-team/vcp-design-system`. Before
   writing any UI, read the piece's page in
   `node_modules/@vdm-design-team/vcp-design-system/docs/<name>.md` (when to
   use it, props, accessibility, the "Don't" list). Use only props it
   documents. Never copy a component's code into this repo.
2. **Something missing is a design-system request, not a local component.**
   If a screen needs a section or control the package doesn't have, and it
   would appear on more than one screen, stop and say so: it belongs in the
   design-system repo (VDM-Design-Team/VCP-design-system) as a PR. Local
   pieces in `src/components/` are only for layout that one screen needs.
3. **Tokens only.** No hex, no px, no arbitrary Tailwind values
   (`bg-[#336afa]`, `p-[13px]`). Colours: `bg-surface-*` (`bg-surface-canvas`,
   `bg-surface-base`, `bg-surface-elevated`), `text-text-*` (`text-text-primary`,
   `text-text-secondary`, `text-text-subtle`), `border-stroke-*`
   (`border-stroke-default`), and the `action-*` / `accent-*` families.
   Spacing: Tailwind's numeric scale (`p-1` = 4px, `p-4` = 16px). Type:
   `text-{tier}-{size}-{weight}` (`text-body-md-regular`,
   `text-title-sm-semibold`). Radius `rounded-sm|md`, shadows `shadow-card`.
   Names like `text-content-*`, `border-line-*` or `p-md` are outdated and
   produce nothing.
4. **Light and dark.** Every screen must work in both; the top bar's switch
   flips them. Tokens make that free — a hardcoded colour breaks it.
5. **Accessible.** Real headings in order, labels on icon-only controls,
   nothing that only works with a mouse.

## How the app is laid out

- `src/app/<rail-key>/page.tsx` — one screen per route. The route is the
  rail row's key (`my-values`, `assigned`, `drafts`, `task-log`, …); the
  Dashboard is `/`.
- Every screen renders `<Screen active="<rail-key>" header={…}>` from
  `src/components/screen.tsx`: VCP's `AppShell` with the rail, the app bar
  and the screen's title band (`PageTitle` or `AVHeader`).
- `src/app/[screen]/page.tsx` lists the rail rows not designed yet. When you
  build one, give it its own folder and take it off that list.
- Sample data lives in the screen's file, or in `src/data/` once more than
  one screen shares it. No real customer data, ever.

## It's a static site

`next build` writes plain files to `out/` (`output: "export"`), which
Cloudflare Pages serves. So no Server Actions, cookies, route handlers,
redirects or rewrites, and a dynamic route needs `generateStaticParams`.
Interactivity is client state (`"use client"`).

## Workflow

- One branch per screen or change (`screen/drafts-list`, `fix/…`), from a
  freshly pulled `origin/main`. Never push to `main`.
- Open a PR. CI builds it and deploys a **preview link** for that branch;
  review the screen there, then merge.
- Bring `main` into a branch with merge, not rebase. Never force-push.
- Before committing, list the changed files and check they're the task's.
- `npm run lint` and `npm run build` must pass (CI runs both).
- New design-system version: `npm i @vdm-design-team/vcp-design-system@latest`
  in its own PR, and click through every screen on the preview.

## Commands

| | |
|---|---|
| `npm run dev` | The prototype at http://localhost:3000 |
| `npm run build` | The static site in `out/` (what Cloudflare serves) |
| `npm run lint` | ESLint |
