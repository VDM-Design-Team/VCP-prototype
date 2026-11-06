"use client";

import { AVListScreen } from "@/components/av-list";

/* Archive → Rejected. Figma 254:75230. */
export default function ArchiveRejectedScreen() {
  return (
    <AVListScreen
      active="archive/rejected"
      title="Rejected"
      include={(av) => av.status === "Rejected"}
      empty={{ title: "Nothing here yet", description: "Added Values rejected while Pending show here, with the reason." }}
    />
  );
}
