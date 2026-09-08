/** Astro's deployment base without its trailing slash: "" at the site root. */
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

/** A root-relative href with the deployment base applied. */
export const withBase = (path: string) => `${base}${path}`;
