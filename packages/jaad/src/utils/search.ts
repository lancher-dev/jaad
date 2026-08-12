export interface SearchItem {
  title: string;
  slug: string;
  chapter: string | null;
  body: string;
}

const MAX_RESULTS = 10;
const EMPTY_QUERY_RESULTS = 8;

/** Rank by where the query appears: title beats chapter beats body. */
export function scoreItems(index: SearchItem[], query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return index.slice(0, EMPTY_QUERY_RESULTS);

  return index
    .map((item) => {
      let score = 0;
      if (item.title.toLowerCase().includes(q)) score += 10;
      if (item.title.toLowerCase().startsWith(q)) score += 5;
      if (item.chapter?.toLowerCase().includes(q)) score += 3;
      if (item.body.toLowerCase().includes(q)) score += 1;
      return { item, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map((s) => s.item);
}

/** A window of body text around the first match, ellipsised at both ends. */
export function getSnippet(body: string, query: string): string {
  const q = query.trim();
  if (!q) return "";
  const idx = body.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return "";

  const start = Math.max(0, idx - 40);
  const end = Math.min(body.length, idx + q.length + 80);
  return (
    (start > 0 ? "..." : "") +
    body.slice(start, end) +
    (end < body.length ? "..." : "")
  );
}

/** Split around every case-insensitive occurrence, marking the matches. */
export function splitOnMatches(
  text: string,
  query: string,
): { text: string; match: boolean }[] {
  const q = query.trim();
  if (!q) return [{ text, match: false }];

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .split(new RegExp(`(${escaped})`, "gi"))
    .filter((part) => part !== "")
    .map((part) => ({
      text: part,
      match: part.toLowerCase() === q.toLowerCase(),
    }));
}
