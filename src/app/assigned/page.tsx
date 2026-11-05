"use client";

import { AVListScreen } from "@/components/av-list";
import { ARCHIVED, VIEWER } from "@/data/added-values";

/* Assigned: the open Added Values the viewer is working on. Figma 350:46136. */
export default function AssignedScreen() {
  return (
    <AVListScreen
      active="assigned"
      title="Assigned"
      include={(av) => av.assignees.some((a) => a.name === VIEWER.name) && !ARCHIVED.includes(av.status)}
      empty={{ title: "Nothing assigned to you", description: "Added Values assigned to you show here until they're done." }}
    />
  );
}
