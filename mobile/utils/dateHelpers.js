// Simple date formatting helper for React Native Expo projects
// Provides a user‑friendly formatted date without external dependencies.
// Handles ISO strings, Date objects, null/undefined, and invalid dates.

/**
 * Formats a date or date string into a readable representation.
 * Uses Intl.DateTimeFormat with the current locale.
 * Example output: "Jan 5, 2024, 3:30 PM"
 *
 * @param {string|Date|null|undefined} dateInput - The date value to format.
 * @returns {string} Formatted date string or a fallback for invalid input.
 */
export function formatDate(dateInput) {
  if (!dateInput) return "";
  const dateObj = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(dateObj.getTime())) return "Invalid date";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  try {
    return new Intl.DateTimeFormat(undefined, options).format(dateObj);
  } catch (_) {
    return dateObj.toLocaleString();
  }
}
