import type { NotificationKind } from "@vdm-design-team/vcp-design-system";

/* Activity · 02: Eve's notifications. Each points at an AV, and a comment one at the comment, whose text,
   reactions and Eve's reply the popover reads live from the AV store: one copy of every comment. */
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  actor: string;
  avId: string;
  /** For `moved`: where to. */
  status?: string;
  /** For comment kinds: which comment the row previews. */
  commentId?: string;
  time: string;
  unread: boolean;
}

export const NOTIFICATIONS: readonly AppNotification[] = [
  { id: "n1", kind: "commented", actor: "Alice Carter", avId: "vcp-1205", commentId: "c2", time: "a few minutes ago", unread: true },
  /* Decided 9 Nov 2026 (Activity · 01): the author hears of a reaction to their comment. */
  { id: "n2", kind: "reacted", actor: "Marvin Ode", avId: "vcp-1205", commentId: "c1-r1", time: "an hour ago", unread: true },
  { id: "n3", kind: "mention", actor: "Lena Novak", avId: "vcp-1205", commentId: "c0", time: "2 days ago", unread: true },
  { id: "n4", kind: "handoff", actor: "Jack Morgan", avId: "vcp-1207", time: "3 days ago", unread: true },
  { id: "n5", kind: "moved", actor: "Alice Carter", avId: "vcp-1204", status: "In QA", time: "2 days ago", unread: false },
  { id: "n6", kind: "assigned", actor: "Marvin Ode", avId: "vcp-1203", time: "a week ago", unread: false },
  { id: "n7", kind: "commented", actor: "Marvin Ode", avId: "vcp-1201", commentId: "c1", time: "2 days ago", unread: false },
];
