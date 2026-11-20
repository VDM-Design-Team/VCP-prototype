"use client";

import * as React from "react";
import { ConfirmDeleteModal, ContactsPage, useToast, type ContactRow } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { CONTACTS } from "@/data/contacts";

/* Admin · 04's Contact List (super admin; DS 2.0 `ContactsPage`, Figma `Contact List`): the messages sent through
   the contact form, to read and delete. Kept in the prototype only. */
const PAGE_SIZE = 10;
const deleteName = (row: ContactRow) => `Delete message from ${row.email}`;

export default function ContactListScreen() {
  const { toast } = useToast();
  const [all, setAll] = React.useState<readonly ContactRow[]>(CONTACTS);
  const [page, setPage] = React.useState(1);
  const [deleting, setDeleting] = React.useState<ContactRow | null>(null);
  const pageCount = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  /* Never drop focus: after a delete, the next message's Delete, else the previous one's, else the first on the
     page that took its place, else the empty message (the DS's own story does the same). */
  const area = React.useRef<HTMLDivElement>(null);
  const focusNext = React.useRef<string[] | null>(null);
  React.useEffect(() => {
    const want = focusNext.current;
    if (!want) return;
    focusNext.current = null;
    const timer = window.setTimeout(() => {
      const root = area.current;
      if (!root) return;
      const named = (name: string) => root.querySelector<HTMLElement>(`button[aria-label="${name}"], button[title="${name}"]`);
      const first = root.querySelector<HTMLElement>('button[aria-label^="Delete message from"], button[title^="Delete message from"]');
      const empty = root.querySelector<HTMLElement>("h3");
      const target = want.map(named).find(Boolean) ?? first ?? empty;
      if (target === empty && empty) empty.tabIndex = -1;
      target?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  });

  return (
    <Screen
      active="contact-list"
      /* DS 2.0's ContactsPage is the whole page, title first, with its own 32 at the sides: it goes where the shell
         takes the title band, not in the body (inset 32 already), as the Domain Budget page does. */
      header={
        <div ref={area} data-flow-step="contacts">
          <ContactsPage
            table={{
              rows,
              page: current,
              pageCount,
              onPageChange: setPage,
              itemCount: all.length,
              pageSize: PAGE_SIZE,
              onDelete: setDeleting,
              caption: "Messages",
            }}
          />
        </div>
      }
    >
      <ConfirmDeleteModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        itemLabel="Contact"
        itemName={deleting?.email ?? ""}
        onConfirm={() => {
          if (!deleting) return;
          const gone = deleting;
          const at = rows.findIndex((r) => r.id === gone.id);
          focusNext.current = [rows[at + 1], rows[at - 1]].filter((r): r is ContactRow => !!r).map(deleteName);
          setAll((a) => a.filter((r) => r.id !== gone.id));
          setDeleting(null);
          /* The confirm says it can't be undone, so there is no Undo. */
          toast({ tone: "success", title: "Message deleted", description: `The message from ${gone.email} was deleted.` });
        }}
      />
    </Screen>
  );
}
