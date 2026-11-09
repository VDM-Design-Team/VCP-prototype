# AV · 08 Initiate to another domain

**ID:** `av-08-initiate` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet
**FigJam:** [AV · 08 Initiate to another domain](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=40-72) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: AV Initiated (to other domain) `1141:138333` — Initiate to Another Domain `1141:138917` (`1142:141606` → `1141:139495` → `1142:144122` → `1144:22299`) · Initiated status updating in the original domain `1144:22909` (endpoint statuses `1144:46613`: Rejected `1146:65944`, Backlogged `1146:65362`) · AV in Duplicated/Initiated to Other Domain(s) `307:23759`
**Scenarios:** [`src/flows/av-08-initiate.ts`](../src/flows/av-08-initiate.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Send a copy of an Added Value to another domain that has to do its part, and follow how it goes there.

## Actor, entry points and starting conditions
- Whoever can edit the AV (AV · 04). Starts on its **edit page**, at any status (decided 9 Nov 2026 for AV · 04).
- The domains are Design (BESA), Development, Content, Governance, Partners and Quality Assurance; the AV's own domain isn't offered.

## Main steps and decision points
1. On the edit page, under Status History: **"Duplicate to other Domains"** (DS `DuplicateToOtherDomain`), one checkbox per other domain: "Initiate to Design (BESA) assignment".
2. Tick a domain: **"The copy in Design (BESA) domain"** appears under it, a copy of the AV's Title, Problems, Solutions, Acceptance Criteria and Desired Outcome, each editable for that domain (Figma `1141:139495`). Untick it and the copy goes.
3. **Submit** runs the AV's own checks, plus a **Title for each copy**. It saves the AV and initiates each copy, **"Initiated"** in its domain. The AV keeps its own status; the toast says where it was initiated.
4. The AV's page then uses the details card's **Duplicates** view: one box per copy with its domain and its status there (Figma `1142:144122`).
5. **The copy moves on its own:** its status in Duplicates follows its domain ("In design", "For QA"…); the original's stays the same (Figma `1144:46123`).
6. **Endpoints:** a copy **rejected** in its domain shows a red banner on the original, "This Task was rejected in Design (BESA) Domain", with that domain's reason. A **backlogged** copy shows a yellow one, "This Task was backlogged in …", with the feedback (Figma `1146:65944`, `1146:65362`).

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| A copy with no title | The copy's Title error and a "Missing Input" toast naming the domain | Give it a title, or untick the domain |
| Already initiated to a domain | That checkbox is disabled: an AV goes to a domain once | — |
| Save as draft with a domain ticked | It saves the AV; the copy isn't initiated (that's Submit's) *(inferred)* | Submit when ready |

## Completion or exit
- **Done:** the copy is Initiated in its domain and listed under Duplicates on the original.
- **Not in this flow:** the copy's own life in its domain (its own AV · 06/07); the copy as a page of its own and in that domain's lists (Figma `1144:22299`) aren't in the prototype.

## Unresolved questions
- **Only Submit initiates?** Figma's flow goes tick → copy → Submit. Should Save as draft initiate too, or keep the ticks for later?
- **The duplicate card drops fields.** `DetailCard`'s `duplicate` type, which Figma's "Viewing Initiated AV" uses, has no Assignee, dates, Cycle or Capacity, so an AV that is In Progress loses them on its page once it has a copy. Is that intended?
- **What a copy needs.** The prototype checks only the copy's title. Does the copy need the AV's full checks (problems with solutions, a desired outcome), or its domain's tags?
- **AV table indicators.** Figma marks a copy rejected or backlogged elsewhere with an indicator (and tooltip) in the AV table (`1145:49620`, `1146:63791`). `AVTable` has none: a design-system follow-up when this is approved.
- **"The copy in … domain" section** is page layout in the prototype (a bordered region with a header). Should it be a design-system piece?
