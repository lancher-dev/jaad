/** The markup the persisted switcher should adopt from an incoming document,
 *  or null when there is nothing to adopt. */
export function nextSwitcherMarkup(incoming: Document): string | null {
  const next = incoming.querySelector("jaad-locale-switcher");
  return next ? next.innerHTML : null;
}
