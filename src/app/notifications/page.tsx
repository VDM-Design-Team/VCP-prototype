"use client";

import * as React from "react";
import { NotificationInbox, formatDate } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { useNotifications } from "@/components/notification-store";
import { NotificationRow } from "@/components/notification-rows";
import { TODAY } from "@/data/gantt";
import type { AppNotification } from "@/data/notifications";

/* "Today", "Yesterday", or the date ("03/11/2026"), from the prototype's today. */
const dayLabel = (iso: string) => {
  const days = Math.round((Date.parse(TODAY) - Date.parse(iso)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return formatDate(iso);
};

/* Activity · 02: the notification inbox, where the popover's "View notification inbox" goes. Figma
   "Notification Inbox" (1030:173233): Mark all as read, Show unread only, the rows (no comment previews),
   and the pager; no left menu, as Figma draws it, and the rows grouped by day (both decided 9 Nov 2026).
   DS 2.0.0's page: the title is the card's own heading and the page's h1 (a recorded difference from Figma,
   whose card has none), with no PageTitle band above it, and 40 above and below. */
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
    <Screen active="notifications" rail={false}>
      {/* Where a guided scenario's step points (Activity · 02): see src/flows/types.ts. */}
      <div className="py-10" data-flow-step="inbox">
        <NotificationInbox
          title="Notification Inbox"
          headingLevel={1}
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
