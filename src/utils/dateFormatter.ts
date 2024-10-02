// Utility function to format the date to local timezone
export function formatToLocalDate(utcDateString: string): string {
  const date = new Date(utcDateString); // Parse the UTC date string
  // Use Intl.DateTimeFormat for better localization support
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short', // Shows timezone abbreviation
  }).format(date);
}
