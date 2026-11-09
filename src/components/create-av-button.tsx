"use client";

import { useRouter } from "next/navigation";
import { Button } from "@vdm-design-team/vcp-design-system";

/** "Create Added Value": the top bar's button (any page) and the empty Drafts page's. Opens the creation page. */
export function CreateAVButton() {
  const router = useRouter();
  return <Button onClick={() => router.push("/added-values/new")}>Create Added Value</Button>;
}
