"use client";

import * as React from "react";
import { DomainCard, PageTitle, TagManagementModal, useToast } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { neighbours, useFocusAfterRemove } from "@/components/focus-after-remove";
import { useSettings } from "@/components/settings-store";
import type { PanelItem } from "@/data/settings";

/* Admin · 04: the super admin's Domains (Figma 808:104308): the domains and the projects, each with Add New, a
   rename and a delete. Add New Tag 984:376450 (a project), Add New Domain 984:376997, Delete Domain 984:377443. */
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Dialog = { kind: "domain" | "project"; item?: PanelItem; deleting?: boolean } | null;

export default function DomainsScreen() {
  const { domains, setDomains, projects, setProjects } = useSettings();
  const { toast } = useToast();
  const [dialog, setDialog] = React.useState<Dialog>(null);
  /* Never drop focus: after a delete, the next row's Delete, the previous one's, or the list's Add New. */
  const area = React.useRef<HTMLDivElement>(null);
  const focusAfter = useFocusAfterRemove(area);
  const listOf = (kind: "domain" | "project") => (kind === "domain" ? domains : projects);
  const setListOf = (kind: "domain" | "project") => (kind === "domain" ? setDomains : setProjects);

  return (
    <Screen active="domains" header={<PageTitle title="Domains" />}>
      <div ref={area} className="grid grid-cols-1 items-start gap-4 py-6 lg:grid-cols-2" data-flow-step="domains">
        <DomainCard
          title="Domains"
          items={domains}
          onAdd={() => setDialog({ kind: "domain" })}
          onEdit={(item) => setDialog({ kind: "domain", item: domains.find((d) => d.id === item.id) })}
          onDelete={(item) => setDialog({ kind: "domain", item: domains.find((d) => d.id === item.id), deleting: true })}
        />
        <DomainCard
          title="Projects"
          items={projects}
          onAdd={() => setDialog({ kind: "project" })}
          onEdit={(item) => setDialog({ kind: "project", item: projects.find((p) => p.id === item.id) })}
          onDelete={(item) => {
            /* Figma draws a confirm for a domain only; a project goes with an Undo. */
            const before = projects;
            focusAfter(neighbours(projects.map((p) => p.label), item.label, "Add New"));
            setProjects(projects.filter((p) => p.id !== item.id));
            toast({ tone: "info", title: "Deleted", description: `${item.label} is deleted.`, actionLabel: "Undo", onAction: () => setProjects(before) });
          }}
        />
      </div>
      <TagManagementModal
        open={!!dialog}
        /* A project is Figma's "tag" dialog; a domain has its own add and delete. */
        type={dialog?.deleting ? "delete-domain" : dialog?.kind === "domain" ? "domain" : "tag"}
        mode={dialog?.item && !dialog.deleting ? "edit" : "add"}
        initialName={dialog?.item?.label ?? ""}
        onClose={() => setDialog(null)}
        onSubmit={(name) => {
          if (!dialog) return;
          const list = listOf(dialog.kind);
          setListOf(dialog.kind)(dialog.item ? list.map((i) => (i.id === dialog.item!.id ? { ...i, label: name } : i)) : [...list, { id: `${slug(name)}-${Date.now()}`, label: name }]);
          setDialog(null);
          toast({ tone: "success", title: dialog.item ? "Renamed" : "Added", description: `${name} is saved.` });
        }}
        onConfirm={() => {
          if (!dialog?.item) return;
          const gone = dialog.item;
          focusAfter(neighbours(domains.map((d) => d.label), gone.label, "Add New"));
          setDomains(domains.filter((d) => d.id !== gone.id));
          setDialog(null);
          /* The confirm says it can't be undone (Figma 984:377443), so there is no Undo. */
          toast({ tone: "info", title: "Domain deleted", description: `${gone.label} is deleted.` });
        }}
      />
    </Screen>
  );
}
