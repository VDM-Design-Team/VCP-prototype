# VCP Prototype

The team's shared clickable prototype of VCP. Every screen is a page here,
built from the [VCP Design System](https://github.com/VDM-Design-Team/VCP-design-system)
package with sample data, so it looks and behaves like the real app will.
Designers build and change screens; the dev team builds the product from
them. `main` is the prototype; every pull request gets its own preview link.

The rules for building screens are in [`CLAUDE.md`](CLAUDE.md). The short
version: use only the design system's components and tokens, and if a screen
needs something the design system doesn't have, ask for it there.

## Running it

Once per machine, log npm in to GitHub Packages (where the design system is
published). Username: your GitHub username. Password: a
[classic token with `read:packages`](https://github.com/settings/tokens/new?scopes=read:packages&description=npm%20GitHub%20Packages).

```bash
npm login --scope=@vdm-design-team --auth-type=legacy --registry=https://npm.pkg.github.com
```

Then:

```bash
npm install
npm run dev
```

and open http://localhost:3000. Or, in Claude, ask for the screen you want
and let it run the app for you.

## Adding a screen

1. Branch from a freshly pulled `main`: `screen/<name>`.
2. Create `src/app/<rail-key>/page.tsx` and wrap it in `<Screen>` (see the
   Dashboard in `src/app/page.tsx`). If the rail row was on the
   "not designed yet" list in `src/app/[screen]/page.tsx`, take it off.
3. Open a pull request. CI builds it and posts a preview link in the run's
   summary; check the screen there in light and dark, then merge.

## Hosting

Cloudflare Pages, project `vcp-prototype`, behind Cloudflare Access so only
the team can open it. `main` deploys to the production URL; every other branch
to its own preview URL. CI does the deploying (`.github/workflows/ci.yml`).
