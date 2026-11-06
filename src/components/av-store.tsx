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
  remove: (id: string) => void;
  /** Add a new AV (created in the prototype) under the next free reference, and return it. */
  create: (av: Omit<AddedValue, "id" | "ref">) => AddedValue;
  /** Back to the sample data: what starting a scenario does, so nothing carries over. */
  reset: () => void;
}

const AVStoreContext = React.createContext<AVStore | null>(null);

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
      moveTo: (id, to, change) =>
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
        }),
      update: (id, change) => touch(id, (av) => ({ ...av, ...change })),
      addComment: (id, comment) => touch(id, (av) => ({ ...av, comments: [comment, ...av.comments] })),
      remove: (id) => setAvs((list) => list.filter((av) => av.id !== id)),
      create: (fields) => {
        const id = NEW_AV_IDS.find((free) => !avs.some((av) => av.id === free)) ?? `vcp-${1211 + avs.length}`;
        const created: AddedValue = { ...fields, id, ref: id.toUpperCase() };
        setAvs((list) => [created, ...list]);
        return created;
      },
      reset: () => setAvs(ADDED_VALUES),
    };
  }, [avs]);

  return <AVStoreContext.Provider value={store}>{children}</AVStoreContext.Provider>;
}

export function useAddedValues() {
  const store = React.useContext(AVStoreContext);
  if (!store) throw new Error("useAddedValues needs <AVStoreProvider> above it (it's in the root layout).");
  return store;
}
