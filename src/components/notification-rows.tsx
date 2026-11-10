"use client";

import * as React from "react";
import { NotificationItem, type MentionSegment } from "@vdm-design-team/vcp-design-system";
import { useAddedValues } from "@/components/av-store";
import { useNotifications } from "@/components/notification-store";
import { useGuardedPush } from "@/components/shell-state";
import { MEMBERS, findComment, forViewer, plainText } from "@/components/comments";
import { VIEWER } from "@/data/added-values";
import type { AppNotification } from "@/data/notifications";

/* Activity · 02: a notification as a DS NotificationItem. The comment kinds read their comment from the
   AV store, so a reply or a reaction made here is the one on the AV page, and back. */

const COMMENT_KINDS = new Set(["commented", "mention", "reacted"]);

export function NotificationRow({
  n,
  withComment,
  onOpened,
}: {
  n: AppNotification;
  /** The popover shows the comment, its reactions and a reply; the inbox doesn't (Figma 1030:173233). */
  withComment: boolean;
  /** After the row opened its AV: the popover closes. */
  onOpened?: () => void;
}) {
  const push = useGuardedPush();
  const { get, react, replyTo, editComment, deleteComment } = useAddedValues();
  const { setRead } = useNotifications();
  const av = get(n.avId);
  if (!av) return null;
  const comment = withComment && n.commentId && COMMENT_KINDS.has(n.kind) ? findComment(forViewer(av.comments), n.commentId) : undefined;
  const mine = comment?.replies?.find((r) => r.author.id === VIEWER.id);
  /* "reacted" previews your own comment: nothing to reply to there. */
  const canReply = !!comment && n.kind !== "reacted";

  const common = {
    actor: { name: n.actor },
    subject: av.title,
    time: n.time,
    unread: n.unread,
    onToggleRead: () => setRead(n.id, n.unread),
    /* Opening it reads it (the prototype's rule; Figma doesn't say), and goes to the AV. */
    onSelect: () => {
      setRead(n.id, true);
      onOpened?.();
      push(`/added-values/${n.avId}`);
    },
    ...(comment && {
      preview: plainText(comment.body),
      reactions: comment.reactions,
      onToggleReaction: (emoji: string) => react(av.id, comment.id, emoji),
      onSelectEmoji: (emoji: string) => react(av.id, comment.id, emoji),
      members: MEMBERS,
      currentUser: VIEWER,
    }),
    ...(canReply && {
      ...(mine && { reply: { author: VIEWER, value: mine.body } }),
      /* Figma 1218:150788: a reply reads the notification; deleting it brings the dot back. */
      ...(!mine && {
        onReply: (value: MentionSegment[]) => {
          replyTo(av.id, comment!.id, {
            id: `c-${Date.now()}`,
            author: VIEWER,
            time: "Just now",
            createdAt: new Date().toISOString(),
            body: value,
          });
          setRead(n.id, true);
        },
      }),
      ...(mine && {
        onEditReply: (value: MentionSegment[]) => editComment(av.id, mine.id, value),
        onDeleteReply: () => {
          deleteComment(av.id, mine.id);
          setRead(n.id, false);
        },
      }),
    }),
  };

  return n.kind === "moved" ? (
    <NotificationItem kind="moved" status={n.status} {...common} />
  ) : (
    <NotificationItem kind={n.kind} {...common} />
  );
}
