"use client";

import * as React from "react";
import { NOTIFICATIONS, type AppNotification } from "@/data/notifications";
import { TODAY } from "@/data/gantt";

/* Activity · 02: Eve's notifications as the prototype has them right now. In the root layout, so the
   bell, the popover and the inbox agree; a scenario starting puts the samples back. */
interface NotificationStore {
  notifications: readonly AppNotification[];
  unread: number;
  setRead: (id: string, read: boolean) => void;
  markAllRead: () => void;
  /** AV · 02: an Added Value was discarded. Its rows stay, saying so, and open nothing (decided 10 Nov 2026). */
  markDiscarded: (avId: string, title: string, actor: string) => void;
  /**
   * Activity · 03: cards dismissed from "In Case You Missed it", each with the AV's state when it was
   * dismissed (`stateKey`). Decided 9 Nov 2026: it comes back only when that state changes.
   */
  dismissed: readonly { id: string; key: string }[];
  dismiss: (id: string, key: string) => void;
  undoDismiss: (id: string) => void;
  reset: () => void;
}

const Ctx = React.createContext<NotificationStore | null>(null);

export function NotificationStoreProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<readonly AppNotification[]>(NOTIFICATIONS);
  const [dismissed, setDismissed] = React.useState<readonly { id: string; key: string }[]>([]);
  const store = React.useMemo<NotificationStore>(
    () => ({
      notifications,
      unread: notifications.filter((n) => n.unread).length,
      setRead: (id, read) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, unread: !read } : n))),
      markAllRead: () => setNotifications((list) => list.map((n) => ({ ...n, unread: false }))),
      markDiscarded: (avId, title, actor) =>
        setNotifications((list) =>
          /* Now, so it goes to the top of the bell and under Today in the inbox. */
          [
            ...list.filter((n) => n.avId === avId).map((n) => ({ ...n, kind: "discarded" as const, actor, title, status: undefined, commentId: undefined, time: "Just now", on: TODAY, unread: true })),
            ...list.filter((n) => n.avId !== avId),
          ],
        ),
      dismissed,
      dismiss: (id, key) => setDismissed((list) => [...list.filter((d) => d.id !== id), { id, key }]),
      undoDismiss: (id) => setDismissed((list) => list.filter((d) => d.id !== id)),
      reset: () => {
        setNotifications(NOTIFICATIONS);
        setDismissed([]);
      },
    }),
    [notifications, dismissed],
  );
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useNotifications() {
  const store = React.useContext(Ctx);
  if (!store) throw new Error("useNotifications needs NotificationStoreProvider");
  return store;
}
