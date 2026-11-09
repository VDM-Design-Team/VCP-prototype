"use client";

import * as React from "react";
import { HOLIDAYS, type Holiday } from "@/data/holidays";

/* The Holiday Registry as the prototype has it right now (Planning · 03). It
   lives in the root layout beside the AV store, so leave added in the
   registry shows in the Planning List's availability until the page is
   reloaded, or a scenario starts, which puts the sample entries back. */
interface HolidayStore {
  holidays: readonly Holiday[];
  add: (h: Omit<Holiday, "id">) => Holiday;
  update: (id: string, change: Partial<Holiday>) => void;
  remove: (id: string) => void;
  reset: () => void;
}

const HolidayStoreContext = React.createContext<HolidayStore | null>(null);

export function HolidayStoreProvider({ children }: { children: React.ReactNode }) {
  const [holidays, setHolidays] = React.useState<readonly Holiday[]>(HOLIDAYS);
  const next = React.useRef(100);
  const store = React.useMemo<HolidayStore>(
    () => ({
      holidays,
      add: (h) => {
        const created = { ...h, id: `h${next.current++}` };
        setHolidays((list) => [...list, created]);
        return created;
      },
      update: (id, change) => setHolidays((list) => list.map((h) => (h.id === id ? { ...h, ...change } : h))),
      remove: (id) => setHolidays((list) => list.filter((h) => h.id !== id)),
      reset: () => setHolidays(HOLIDAYS),
    }),
    [holidays],
  );
  return <HolidayStoreContext.Provider value={store}>{children}</HolidayStoreContext.Provider>;
}

export function useHolidays() {
  const store = React.useContext(HolidayStoreContext);
  if (!store) throw new Error("useHolidays needs HolidayStoreProvider");
  return store;
}
