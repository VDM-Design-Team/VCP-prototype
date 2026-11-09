"use client";

import * as React from "react";
import { NotificationInbox, PageTitle } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { useNotifications } from "@/components/notification-store";
import { NotificationRow } from "@/components/notification-rows";

/* Activity · 02: the notification inbox, where the popover's "View notifications inbox" goes. Figma
   "Notification Inbox" (1030:173233): Mark all as read, Show unread only, the rows (no comment previews),
   and the pager. Figma draws it without the rail; the prototype keeps its shell (see the flow doc). */
export default function NotificationInboxScreen() {
  const { notifications, markAllRead } = useNotifications();
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const rows = notifications.filter((n) => !unreadOnly || n.unread);
  return (
    <Screen active="notifications" header={<PageTitle title="Notification Inbox" />}>
      {/* Where a guided scenario's step points (Activity · 02): see src/flows/types.ts. */}
      <div className="py-6" data-flow-step="inbox">
        <NotificationInbox
          unreadOnly={unreadOnly}
          onUnreadOnlyChange={setUnreadOnly}
          onMarkAllRead={markAllRead}
          emptyLabel={unreadOnly ? "No unread notifications" : "No notifications"}
          pagination={{ page: 1, pageCount: 1, itemCount: rows.length, pageSize: 50 }}
        >
          {rows.map((n) => (
            <NotificationRow key={n.id} n={n} withComment={false} />
          ))}
        </NotificationInbox>
      </div>
    </Screen>
  );
}
