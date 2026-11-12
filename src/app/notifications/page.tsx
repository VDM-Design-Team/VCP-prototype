"use client";

import * as React from "react";
import { NotificationInbox, PageTitle } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { useNotifications } from "@/components/notification-store";
import { NotificationRow } from "@/components/notification-rows";
import { TODAY } from "@/data/gantt";
import type { AppNotification } from "@/data/notifications";

/* "Today", "Yesterday", or "3 November", from the prototype's today. */
const dayLabel = (iso: string) => {
  const days = Math.round((Date.parse(TODAY) - Date.parse(iso)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
};

/* Activity · 02: the notification inbox, where the popover's "View notifications inbox" goes. Figma
   "Notification Inbox" (1030:173233): Mark all as read, Show unread only, the rows (no comment previews),
   and the pager; no left menu, as Figma draws it, and the rows grouped by day (both decided 9 Nov 2026). */
export default function NotificationInboxScreen() {
  const { notifications, markAllRead } = useNotifications();
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const rows = notifications.filter((n) => !unreadOnly || n.unread);
  /* Newest day first; each day's rows as they come. */
  const days = [...new Set(rows.map((n) => n.on))].sort().reverse();
  const groups = days.map((day) => ({
    label: dayLabel(day),
    children: rows.filter((n: AppNotification) => n.on === day).map((n) => <NotificationRow key={n.id} n={n} withComment={false} />),
  }));
  return (
    <Screen active="notifications" rail={false} header={<PageTitle title="Notification Inbox" />}>
      {/* Where a guided scenario's step points (Activity · 02): see src/flows/types.ts. */}
      <div className="py-6" data-flow-step="inbox">
        <NotificationInbox
          unreadOnly={unreadOnly}
          onUnreadOnlyChange={setUnreadOnly}
          onMarkAllRead={markAllRead}
          emptyLabel={unreadOnly ? "No unread notifications" : "No notifications"}
          pagination={{ page: 1, pageCount: 1, itemCount: rows.length, pageSize: 50 }}
          groups={groups}
        />
      </div>
    </Screen>
  );
}
