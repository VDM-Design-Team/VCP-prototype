"use client";

import * as React from "react";
import type { AVStatus, CommentData } from "@vdm-design-team/vcp-design-system";
import { ADDED_VALUES, CHAINS, NEW_AV_IDS, VIEWER, stageLabel, type AddedValue } from "@/data/added-values";

/* The Added Values as the prototype has them right now. It lives in the root
   layout, so rejecting or handing off an AV on its page shows on every list
   until the page is reloaded — which starts from the sample data again. */
interface AVStore {
  avs: readonly AddedValue[];
  get: (id: string) => AddedValue | undefined;
  /** Move an AV to a spine status or a chain step, logging it in its Status History. */
  moveTo: (id: string, to: string, change?: Partial<AddedValue>) => void;
  update: (id: string, change: Partial<AddedValue>) => void;
  addComment: (id: string, comment: CommentData) => void;
  /**
   * Activity · 01: the viewer's reaction on a comment (or reply) flips — added, or taken back.
   * A new emoji goes after the others (Figma: in the order first added); one at 0 goes away.
   */
  react: (id: string, commentId: string, emoji: string) => void;
  remove: (id: string) => void;
  /** Add a new AV (created in the prototype) under the next free reference, and return it. */
  create: (av: Omit<AddedValue, "id" | "ref">) => AddedValue;
  /** Several at once (a multipart AV's parts), each under its own free reference, in order. */
  createMany: (avs: Omit<AddedValue, "id" | "ref">[]) => AddedValue[];
  /**
   * Back to the sample data: what starting a scenario does, so nothing carries
   * over. A scenario's own AVs replace the sample ones with the same id, or are added.
   */
  reset: (overrides?: readonly AddedValue[]) => void;
}

const AVStoreContext = React.createContext<AVStore | null>(null);

/* Reactions keep who reacted by name; the count is how many. The page shows the viewer as "You". */
function toggleReaction(comments: readonly CommentData[], commentId: string, emoji: string): CommentData[] {
  return comments.map((c) => {
    if (c.id !== commentId) return c.replies ? { ...c, replies: toggleReaction(c.replies, commentId, emoji) } : c;
    const reactions = [...(c.reactions ?? [])];
    const at = reactions.findIndex((r) => r.emoji === emoji);
    const people = at === -1 ? [] : [...(reactions[at].people ?? [])];
    const next = people.includes(VIEWER.name) ? people.filter((p) => p !== VIEWER.name) : [...people, VIEWER.name];
    const reaction = { emoji, count: next.length, people: next };
    if (at === -1) reactions.push(reaction);
    else if (next.length) reactions[at] = reaction;
    else reactions.splice(at, 1);
    return { ...c, reactions };
  });
}

export function AVStoreProvider({ children }: { children: React.ReactNode }) {
  const [avs, setAvs] = React.useState<AddedValue[]>(ADDED_VALUES);

  const store = React.useMemo<AVStore>(() => {
    const touch = (id: string, change: (av: AddedValue) => AddedValue) =>
      setAvs((list) =>
        list.map((av) =>
          av.id === id ? { ...change(av), updatedAt: new Date().toISOString(), updatedLabel: "Just now" } : av,
        ),
      );
    return {
      avs,
      get: (id) => avs.find((av) => av.id === id),
      moveTo: (id, to, change) => {
        touch(id, (av) => {
          /* `to` is a chain step's id or a spine status. */
          const isStep = CHAINS[av.domain].some((s) => s.id === to);
          const next = isStep
            ? { ...av, status: "In Progress" as AVStatus, step: to }
            : { ...av, status: to as AVStatus, step: undefined };
          return {
            ...next,
            ...change,
            history: [
              { actor: VIEWER.name, from: stageLabel(av), to: stageLabel(next), when: "Just now" },
              ...av.history,
            ],
          };
        });
        /* AV · 10, decided 9 Nov 2026: a multipart parent completes when its last part does. */
        if (to === "Completed")
          setAvs((list) => {
            const parentId = list.find((av) => av.id === id)?.parent;
            const parent = parentId ? list.find((av) => av.id === parentId) : undefined;
            if (!parent?.parts || parent.status === "Completed") return list;
            const done = parent.parts.every((p) => list.find((av) => av.id === p)?.status === "Completed");
            if (!done) return list;
            return list.map((av) =>
              av.id === parent.id
                ? {
                    ...av,
                    status: "Completed" as AVStatus,
                    step: undefined,
                    history: [{ actor: VIEWER.name, from: stageLabel(av), to: "Completed", when: "Just now" }, ...av.history],
                    updatedAt: new Date().toISOString(),
                    updatedLabel: "Just now",
                  }
                : av,
            );
          });
      },
      update: (id, change) => touch(id, (av) => ({ ...av, ...change })),
      addComment: (id, comment) => touch(id, (av) => ({ ...av, comments: [comment, ...av.comments] })),
      react: (id, commentId, emoji) =>
        setAvs((list) => list.map((av) => (av.id === id ? { ...av, comments: toggleReaction(av.comments, commentId, emoji) } : av))),
      remove: (id) => setAvs((list) => list.filter((av) => av.id !== id)),
      createMany: (list) => {
        const taken = new Set(avs.map((av) => av.id));
        const created = list.map((fields) => {
          const id = NEW_AV_IDS.find((free) => !taken.has(free)) ?? `vcp-${1211 + taken.size}`;
          taken.add(id);
          return { ...fields, id, ref: id.toUpperCase() } as AddedValue;
        });
        setAvs((current) => [...created, ...current]);
        return created;
      },
      create: (fields) => {
        const id = NEW_AV_IDS.find((free) => !avs.some((av) => av.id === free)) ?? `vcp-${1211 + avs.length}`;
        const created: AddedValue = { ...fields, id, ref: id.toUpperCase() };
        setAvs((list) => [created, ...list]);
        return created;
      },
      /* A scenario's AVs replace the sample ones with the same id; the rest are
         added (they use references kept free for new AVs, which have pages). */
      reset: (overrides = []) =>
        setAvs([
          ...overrides.filter((o) => !ADDED_VALUES.some((av) => av.id === o.id)),
          ...ADDED_VALUES.map((av) => overrides.find((o) => o.id === av.id) ?? av),
        ]),
    };
  }, [avs]);

  return <AVStoreContext.Provider value={store}>{children}</AVStoreContext.Provider>;
}

export function useAddedValues() {
  const store = React.useContext(AVStoreContext);
  if (!store) throw new Error("useAddedValues needs <AVStoreProvider> above it (it's in the root layout).");
  return store;
}
