"use client";

import * as React from "react";
import { ACCOUNTS, DOMAIN_LIST, PANEL, PROJECT_LIST, TEAMS, type Account, type PanelItem, type Team } from "@/data/settings";

/* Admin · 04: what Settings, Accounts and Domains edit. In the root layout, so a change survives moving
   around the app (the dashboard's team filter reads the teams); a scenario starting puts the samples back. */
type PanelList = "roles" | "statuses" | "assigneeTypes";

interface SettingsStore {
  accounts: Account[];
  saveAccount: (account: Account) => void;
  removeAccount: (id: string) => void;
  panel: typeof PANEL;
  setPanelList: (domain: string, list: PanelList, items: PanelItem[]) => void;
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  domains: PanelItem[];
  setDomains: (items: PanelItem[]) => void;
  projects: PanelItem[];
  setProjects: (items: PanelItem[]) => void;
  reset: () => void;
}

const Ctx = React.createContext<SettingsStore | null>(null);

export function SettingsStoreProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = React.useState(ACCOUNTS);
  const [panel, setPanel] = React.useState(PANEL);
  const [teams, setTeams] = React.useState(TEAMS);
  const [domains, setDomains] = React.useState(DOMAIN_LIST);
  const [projects, setProjects] = React.useState(PROJECT_LIST);
  const store = React.useMemo<SettingsStore>(
    () => ({
      accounts,
      saveAccount: (account) =>
        setAccounts((all) => (all.some((a) => a.id === account.id) ? all.map((a) => (a.id === account.id ? account : a)) : [account, ...all])),
      removeAccount: (id) => setAccounts((all) => all.filter((a) => a.id !== id)),
      panel,
      setPanelList: (domain, list, items) =>
        setPanel((all) => ({ ...all, [domain]: { ...(all[domain] ?? { roles: [], statuses: [], assigneeTypes: [] }), [list]: items } })),
      teams,
      setTeams,
      domains,
      setDomains,
      projects,
      setProjects,
      reset: () => {
        setAccounts(ACCOUNTS);
        setPanel(PANEL);
        setTeams(TEAMS);
        setDomains(DOMAIN_LIST);
        setProjects(PROJECT_LIST);
      },
    }),
    [accounts, panel, teams, domains, projects],
  );
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const store = React.useContext(Ctx);
  if (!store) throw new Error("useSettings needs SettingsStoreProvider");
  return store;
}
