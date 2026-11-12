import type { CommentData, MentionSegment } from "@vdm-design-team/vcp-design-system";
import { VIEWER } from "@/data/added-values";

/** Who can be mentioned in a comment: the viewer and the team. */
export const MEMBERS = [VIEWER, ...["Marvin Ode", "Alice Carter", "Jack Morgan", "Lena Novak", "Noah Foster"].map((name) => ({
  id: `u-${name.split(" ")[0].toLowerCase()}`,
  name,
}))];

/* The viewer's own reactions read "You", first, and tinted (Figma's Own Reaction). */
export const forViewer = (comments: readonly CommentData[]): CommentData[] =>
  comments.map((c) => ({
    ...c,
    reactions: c.reactions?.map((r) => {
      const mine = !!r.people?.includes(VIEWER.name);
      return { ...r, mine, people: mine ? ["You", ...r.people!.filter((p) => p !== VIEWER.name)] : r.people };
    }),
    replies: c.replies && forViewer(c.replies),
  }));

/** A comment anywhere in the tree. */
export const findComment = (comments: readonly CommentData[], id: string): CommentData | undefined => {
  for (const c of comments) {
    if (c.id === id) return c;
    const inReplies = c.replies && findComment(c.replies, id);
    if (inReplies) return inReplies;
  }
  return undefined;
};

/** A comment as plain text, mentions as "@Name": the notification preview. */
export const plainText = (body: readonly MentionSegment[]) =>
  body.map((s) => (s.type === "text" ? s.text : `@${s.label}`)).join("");
