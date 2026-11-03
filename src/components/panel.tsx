import * as React from "react";

/**
 * A titled box of page content, as plain token markup — the same one the
 * design system's AppShell stories use. The design system has no card
 * component; if screens keep needing this, propose one there instead of
 * growing it here.
 */
export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-stroke-default bg-surface-elevated p-4">
      <h2 className="mb-1 text-title-sm-semibold text-text-primary">{title}</h2>
      <div className="text-body-sm-regular text-text-secondary">{children}</div>
    </section>
  );
}
