"use client";

import * as React from "react";
import { ConfirmModal, confirmations } from "@vdm-design-team/vcp-design-system";
import { useShellState } from "./shell-state";

/**
 * A page with unsaved changes asks before they're lost, however you leave:
 * - the page's own back arrow (`leave`);
 * - any in-app link: the rail, the top bar, the bell (they go through `useGuardedPush`);
 * - the browser's back button (an extra history entry catches it, then the walk back resumes on Confirm);
 * - closing or reloading the tab (the browser's own prompt: its words can't be changed).
 * The question is the design system's `ConfirmModal` with `confirmations.leavePage()`:
 * "Are you sure you want to leave?", Cancel and a red Confirm. The design system can't know a
 * navigation is happening (docs/confirm-modal.md): asking is the page's job, so it lives here.
 */
export function useLeaveGuard(dirty: boolean) {
  const { setLeaveGuard } = useShellState();
  /* Where to go once Confirm is pressed. */
  const [leaving, setLeaving] = React.useState<(() => void) | null>(null);
  const latestDirty = React.useRef(dirty);
  /* The extra history entry is in place, so the browser's back lands on it rather than leaving. */
  const caught = React.useRef(false);
  /* Confirm was pressed: let the navigation through without asking again. */
  const letGo = React.useRef(false);
  React.useEffect(() => {
    latestDirty.current = dirty;
  });

  /** Ask first when there are unsaved changes: true when it will ask (and go on Confirm), false when there's nothing to lose. */
  const ask = React.useCallback((go: () => void) => {
    if (!latestDirty.current || letGo.current) return false;
    setLeaving(() => go);
    return true;
  }, []);

  /* In-app links. */
  React.useEffect(() => {
    setLeaveGuard(ask);
    return () => setLeaveGuard(null);
  }, [ask, setLeaveGuard]);

  /* The browser's back: once there's something to lose, add a history entry for this same page. Back then
     only steps off it; the page puts it back and asks. Confirm goes back past both. */
  React.useEffect(() => {
    if (!dirty || caught.current) return;
    window.history.pushState({ leaveGuard: true }, "", window.location.href);
    caught.current = true;
  }, [dirty]);
  React.useEffect(() => {
    const onPop = () => {
      if (!caught.current || letGo.current) return;
      if (!latestDirty.current) {
        /* Nothing to lose any more: this back press just used up the extra entry. */
        caught.current = false;
        return;
      }
      window.history.pushState({ leaveGuard: true }, "", window.location.href);
      setLeaving(() => () => window.history.go(-2));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* Closing or reloading the tab: only the browser can ask, in its own words. */
  React.useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /**
   * Leave by the page's own way out (its back arrow). With the extra history entry in place, going back
   * means going back past it too.
   */
  const leave = (go: () => void) => {
    if (!ask(go)) go();
  };
  /** Go back in history, past the extra entry when there is one. */
  const goBack = () => window.history.go(caught.current ? -2 : -1);

  const dialog = (
    <ConfirmModal
      open={!!leaving}
      onClose={() => setLeaving(null)}
      onConfirm={() => {
        const go = leaving;
        setLeaving(null);
        letGo.current = true;
        go?.();
      }}
      {...confirmations.leavePage()}
    />
  );

  return { leave, goBack, dialog };
}
