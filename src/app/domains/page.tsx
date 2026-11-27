"use client";

import * as React from "react";
import { DomainsPage, useToast } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { useSettings } from "@/components/settings-store";
import { useAddedValues } from "@/components/av-store";

/* Admin · 04: the super admin's Domains (Figma 808:104308): the domains and the projects, each with Add New, a
   rename and a delete. Add New Tag 984:376450 (a project), Add New Domain 984:376997, Delete Domain 984:377443. */
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function DomainsScreen() {
  const { domains, setDomains, projects, setProjects } = useSettings();
  const { avs } = useAddedValues();
  const { toast } = useToast();
  const setListOf = (id: string) => (id === "domains" ? setDomains : setProjects);

  return (
    <Screen
      active="domains"
      /* DS 2.0's DomainsPage is the whole page, title first, with its own 32 at the sides: it goes where the shell
         takes the title band, not in the body (inset 32 already), as the Domain Budget page does. Its Tag Management
         owns the Add New, rename and delete dialogs, and puts focus on the card's Add New after a delete. */
      header={
        <DomainsPage
          data-flow-step="domains"
          management={{
            lists: [
              { id: "domains", title: "Domains", items: domains, kind: "domain" },
              { id: "projects", title: "Projects", items: projects, noun: "Project" },
            ],
            onAdd: (list, name) => {
              setListOf(list.id)([...list.items, { id: `${slug(name)}-${Date.now()}`, label: name }]);
              toast({ tone: "success", title: `${name} added` });
            },
            onRename: (list, item, name) => {
              setListOf(list.id)(list.items.map((i) => (i.id === item.id ? { ...i, label: name } : i)));
              toast({ tone: "success", title: `Renamed to ${name}` });
            },
            onDelete: (list, item) => {
              if (list.id === "projects") {
                /* Decided 10 Nov 2026: a project Added Values still belong to can't be deleted. The dialog stays
                   open, so the person can cancel. */
                const n = avs.filter((av) => av.project === item.label).length;
                if (n) {
                  toast({ tone: "critical", title: `Can't delete ${item.label}`, description: `${item.label} is used by ${n} Added ${n === 1 ? "Value" : "Values"}. Move them to another project first.` });
                  return Promise.reject(new Error("in use"));
                }
              }
              setListOf(list.id)(list.items.filter((i) => i.id !== item.id));
              /* The confirm says it can't be undone, so there is no Undo. */
              toast({ tone: "success", title: `${item.label} deleted` });
            },
          }}
        />
      }
    >
      {null}
    </Screen>
  );
}
