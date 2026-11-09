import type { InCaseYouMissedItItem } from "@vdm-design-team/vcp-design-system";
import { VIEWER, daysOverdue, type AddedValue } from "./added-values";
import { TODAY } from "./gantt";

/* Activity · 03: what "In Case You Missed it" brings back. Figma draws the four card types, not which AVs
   qualify, so these are the prototype's rules (see flows/activity-03-icymi.md):
   - a user sees their own AVs (initiated or assigned); an admin sees everyone's;
   - Overdue: under way, past its due date;
   - Due Soon: under way, due within a week;
   - Awaiting Review: in Review; a user sees it on the AVs they initiated (they review them);
   - Pending: waiting to be accepted; an admin's only (they accept). */

const DAY = 86_400_000;
const daysBetween = (from: string, to: string) => Math.round((Date.parse(to.slice(0, 10)) - Date.parse(from.slice(0, 10))) / DAY);
const UNDER_WAY = new Set(["Accepted", "In Progress"]);
export const DUE_SOON_DAYS = 7;
const ORDER = ["overdue", "due-soon", "awaiting-review", "pending"] as const;

/** "6 months ago", from when it was initiated. */
const ago = (iso: string) => {
  const d = daysBetween(iso, TODAY);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 14) return `${d} days ago`;
  if (d < 60) return `${Math.round(d / 7)} weeks ago`;
  return `${Math.round(d / 30)} months ago`;
};

export function missedFor(avs: readonly AddedValue[], admin: boolean): InCaseYouMissedItItem[] {
  const mine = (av: AddedValue) => av.initiator === VIEWER.name || av.assignees.some((a) => a.name === VIEWER.name);
  const items = avs.flatMap((av): InCaseYouMissedItItem[] => {
    if (!admin && !mine(av)) return [];
    const base = { id: av.id, title: av.title, user: { name: av.initiator }, created: ago(av.dateInitiated) };
    if (UNDER_WAY.has(av.status) && av.dueDate) {
      const late = daysOverdue(av);
      if (late > 0) return [{ ...base, type: "overdue", days: late }];
      const left = daysBetween(TODAY, av.dueDate);
      if (left <= DUE_SOON_DAYS) return [{ ...base, type: "due-soon", days: left }];
      return [];
    }
    if (av.status === "Review" && (admin || av.initiator === VIEWER.name))
      return [{ ...base, type: "awaiting-review", days: daysBetween(av.updatedAt, TODAY) }];
    if (av.status === "Pending" && admin) return [{ ...base, type: "pending", days: daysBetween(av.dateInitiated, TODAY) }];
    return [];
  });
  /* Figma's order: overdue, due soon, awaiting review, pending; the longest wait first within each. */
  return items.sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type) || b.days - a.days);
}

/** What a dismissal remembers: the AV's status, step and due date. A change to any brings the card back. */
export const stateKey = (av: Pick<AddedValue, "status" | "step" | "dueDate">) => `${av.status}|${av.step ?? ""}|${av.dueDate ?? ""}`;
