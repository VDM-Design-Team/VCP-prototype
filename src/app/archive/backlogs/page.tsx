"use client";

import { AVListScreen } from "@/components/av-list";

/* Archive → Backlogs. Figma 254:75230. */
export default function ArchiveBacklogsScreen() {
  return (
    <AVListScreen
      active="archive/backlogs"
      title="Backlogs"
      include={(av) => av.status === "Backlog"}
      empty={{ title: "Nothing here yet", description: "Added Values moved to the backlog wait here." }}
    />
  );
}
