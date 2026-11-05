"use client";

import { AVListScreen } from "@/components/av-list";

/* Archive → Completed. Figma 254:75230. */
export default function ArchiveCompletedScreen() {
  return (
    <AVListScreen
      active="archive/completed"
      title="Completed"
      include={(av) => av.status === "Completed"}
      empty={{ title: "Nothing here yet", description: "Added Values that were handed off and accepted show here." }}
    />
  );
}
