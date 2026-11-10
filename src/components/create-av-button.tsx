"use client";

import { Button } from "@vdm-design-team/vcp-design-system";
import { useGuardedPush } from "./shell-state";

/** "Create Added Value": the top bar's button (any page) and the empty Drafts page's. Opens the creation page. */
export function CreateAVButton() {
  const push = useGuardedPush();
  return <Button onClick={() => push("/added-values/new")}>Create Added Value</Button>;
}
