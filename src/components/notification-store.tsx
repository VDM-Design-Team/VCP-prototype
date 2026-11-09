"use client";

import * as React from "react";
import { NOTIFICATIONS, type AppNotification } from "@/data/notifications";

/* Activity · 02: Eve's notifications as the prototype has them right now. In the root layout, so the
   bell, the popover and the inbox agree; a scenario starting puts the samples back. */
interface NotificationStore {
  notifications: readonly AppNotification[];
  unread: number;
  setRead: (id: string, read: boolean) => void;
  markAllRead: () => void;
  /** Activity · 03: cards dismissed from "In Case You Missed it", for this session. */
  dismissed: readonly string[];
  dismiss: (id: string) => void;
  reset: () => void;
}

const Ctx = React.createContext<NotificationStore | null>(null);

export function NotificationStoreProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<readonly AppNotification[]>(NOTIFICATIONS);
  const [dismissed, setDismissed] = React.useState<readonly string[]>([]);
  const store = React.useMemo<NotificationStore>(
    () => ({
      notifications,
      unread: notifications.filter((n) => n.unread).length,
      setRead: (id, read) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, unread: !read } : n))),
      markAllRead: () => setNotifications((list) => list.map((n) => ({ ...n, unread: false }))),
      dismissed,
      dismiss: (id) => setDismissed((list) => [...list, id]),
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
