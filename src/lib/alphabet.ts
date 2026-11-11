/** Groups items under the first letter of their name (A–Z), with everything else under "#". */
export function groupByLetter<T>(items: T[], name: (item: T) => string) {
  const groups = Map.groupBy(items, (item) => {
    const first = name(item).trim().charAt(0).toUpperCase();
    return /^[A-Z]$/.test(first) ? first : "#";
  });
  return [...groups.entries()].sort(([a], [b]) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)));
}
