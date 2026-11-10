"use client";

import * as React from "react";

/**
 * Never drop focus (CLAUDE.md): when a row is deleted its Delete button goes with it, and a dialog that
 * opened from it hands focus back to nothing. The page moves it on purpose, after the dialog has closed:
 * to the next row's Delete, else the previous one's, else a fallback (the search, or the list's Add New).
 * `docs/accounts-table.md` "Focus after a delete" is the rule.
 *
 * Give it the area to look in; call the returned function with the accessible names to try, in order
 * ("Delete Sam", "Delete Priya", SEARCH). The first one on screen after the next render takes focus.
 */
export const SEARCH = "__search";

export function useFocusAfterRemove(root: React.RefObject<HTMLElement | null>) {
  const pending = React.useRef<string[] | null>(null);
  React.useEffect(() => {
    const want = pending.current;
    if (!want) return;
    pending.current = null;
    /* After the dialog (if any) has handed focus back to the button that has gone. */
    const timer = window.setTimeout(() => {
      const area = root.current;
      if (!area) return;
      /* An IconButton alone is named by its `title`; a Button by its words. */
      const nameOf = (el: HTMLElement) => (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim();
      for (const name of want) {
        const el =
          name === SEARCH
            ? area.querySelector<HTMLElement>('input[type="search"]')
            : [...area.querySelectorAll<HTMLElement>("button")].find((b) => nameOf(b) === name);
        if (el) {
          el.focus();
          return;
        }
      }
    }, 0);
    return () => window.clearTimeout(timer);
  });
  return React.useCallback((names: string[]) => {
    pending.current = names;
  }, []);
}

/** The names to try after deleting `label` from `labels`: the next one's Delete, the previous one's, then the fallbacks. */
export const neighbours = (labels: readonly string[], label: string, ...fallbacks: string[]) => {
  const at = labels.indexOf(label);
  return [labels[at + 1], labels[at - 1]].filter((l): l is string => !!l).map((l) => `Delete ${l}`).concat(fallbacks);
};
