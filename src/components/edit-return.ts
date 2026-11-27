/**
 * The AV page opened its own edit page: leaving the edit page (its back arrow, Submit, Save as draft) steps back
 * to that page in the history instead of opening it again. Opening it again left the edit page behind it, so the
 * AV page's back arrow went to the edit page, and back again: it toggled between the two (AV · 06 review).
 */
let openedFrom: string | undefined;

/** The AV page is opening its edit page. */
export const openingEditFrom = (id: string) => {
  openedFrom = id;
};

/** Whether the edit page of `id` was opened from its AV page, which is then the page behind it. */
export const cameFromAV = (id: string) => openedFrom === id;

/** The edit page is closing: whatever opens it next says again where from. */
export const forgetEditOrigin = () => {
  openedFrom = undefined;
};
