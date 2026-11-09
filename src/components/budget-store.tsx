"use client";

import * as React from "react";
import { BUDGETS, type Budgets, type QuarterKey, type DomainBudget } from "@/data/budgets";

/* Admin · 01: the saved budgets. The super admin's page edits a draft and saves it here; the admin's
   Dashboard card reads it. In the root layout; a scenario starting puts the samples back. */
interface BudgetStore {
  budgets: Budgets;
  save: (key: QuarterKey, rows: Record<string, DomainBudget>) => void;
  reset: () => void;
}

const Ctx = React.createContext<BudgetStore | null>(null);

export function BudgetStoreProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = React.useState<Budgets>(BUDGETS);
  const store = React.useMemo<BudgetStore>(
    () => ({
      budgets,
      save: (key, rows) => setBudgets((all) => ({ ...all, [key]: rows })),
      reset: () => setBudgets(BUDGETS),
    }),
    [budgets],
  );
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useBudgets() {
  const store = React.useContext(Ctx);
  if (!store) throw new Error("useBudgets needs BudgetStoreProvider");
  return store;
}
