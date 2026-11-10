"use client";

import { AVListScreen } from "@/components/av-list";
import { useShellState } from "@/components/shell-state";
import { ARCHIVED, DOMAINS } from "@/data/added-values";

/* Manage (Admin): every open Added Value in the domain, Pending ones
   included — where an admin accepts or rejects them. Figma 940:167946. The
   domain is the one picked in the rail's switcher (Admin · 01, decided 10 Nov 2026). */
export default function ManageScreen() {
  const { domain } = useShellState();
  const value = DOMAINS.find((d) => d.name === domain)?.value;
  return (
    <AVListScreen
      active="manage"
      title="Manage Added Values"
      bulk
      include={(av) => av.domain === value && av.status !== "Draft" && !ARCHIVED.includes(av.status)}
      empty={{ title: "No open Added Values", description: "New Added Values wait here for an admin to accept them." }}
    />
  );
}
