"use client";

import { AVListScreen } from "@/components/av-list";
import { ARCHIVED } from "@/data/added-values";

/* Manage (Admin): every open Added Value in the domain, Pending ones
   included — where an admin accepts or rejects them. Figma 940:167946. */
export default function ManageScreen() {
  return (
    <AVListScreen
      active="manage"
      title="Manage Added Values"
      bulk
      include={(av) => av.status !== "Draft" && !ARCHIVED.includes(av.status)}
      empty={{ title: "No open Added Values", description: "New Added Values wait here for an admin to accept them." }}
    />
  );
}
