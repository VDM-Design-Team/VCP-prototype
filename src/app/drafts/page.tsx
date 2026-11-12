"use client";

import { AVListScreen } from "@/components/av-list";
import { CreateAVButton } from "@/components/create-av-button";
import { VIEWER, isInitiator } from "@/data/added-values";

/* Drafts — Figma 254:74537: the viewer's own Added Values still in Draft
   (AV · 03 Save as Draft). A draft is only its initiator's until it's submitted. */
export default function DraftsScreen() {
  return (
    <AVListScreen
      active="drafts"
      title="Drafts"
      omit={["status", "initiator"]}
      include={(av) => av.status === "Draft" && isInitiator(av, VIEWER.name)}
      empty={{ title: "No drafts", description: "An Added Value you start and don't submit waits here." }}
      emptyAction={<CreateAVButton />}
    />
  );
}
