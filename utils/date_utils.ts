/**
 * Format a Date into a string of form YYYY-mm-DD HH:MM:SS
 * e.g. "2025-04-29 03:53:15"
 * @param date
 */
export function formatDateTime(date: Date | null): string {
  if (!date) {
    return "";
  }
  const intermediateString = date.toISOString().replace("T", " ");
  const periodIdx = intermediateString.indexOf(".");

  return intermediateString.substring(0, periodIdx);
}
