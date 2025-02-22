import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function formatDateForDisplay(date: string | Date): string {
  return formatInTimeZone(
    typeof date === 'string' ? parseISO(date) : date,
    "UTC",
    "PPP"
  );
}

export function formatDateForForm(date: string | Date): string {
  return formatInTimeZone(
    typeof date === 'string' ? parseISO(date) : date,
    "UTC",
    "yyyy-MM-dd"
  );
} 