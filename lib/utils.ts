import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const maxChars = 22;
export const truncateLabel = (label: string) => {
  if (label?.length > maxChars) {
    return label?.slice(0, maxChars) + "...";
  }
  return label;
};

export const truncateLabelTable = (label: string) => {
  if (label?.length > 40) {
    return label?.slice(0, 40) + "...";
  }
  return label;
};

export const convertUTCtoIST = (utcDateString: string): string => {
  // Create a Date object from the UTC string
  const utcDate = new Date(utcDateString);

  // Convert UTC to IST (Indian Standard Time, UTC +5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const istDate = new Date(utcDate.getTime() + istOffset);

  // Format the date in a deterministic way
  const year = istDate.getUTCFullYear();
  const month = istDate.getUTCMonth();
  const day = istDate.getUTCDate();
  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${day.toString().padStart(2, '0')} ${monthNames[month]} ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
}