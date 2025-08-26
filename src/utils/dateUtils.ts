/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Get today's date in YYYY-MM-DD format using local timezone
 * @returns string in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get date in YYYY-MM-DD format using local timezone
 * @param date - Date object or date string
 * @returns string in YYYY-MM-DD format
 */
export const formatDateToYYYYMMDD = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get current timezone
 * @returns timezone string
 */
export const getCurrentTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Check if two dates are the same day (local timezone)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns boolean
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

/**
 * Get date difference in days
 * @param date1 - First date
 * @param date2 - Second date
 * @returns number of days difference
 */
export const getDaysDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const timeDiff = d1.getTime() - d2.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
};

/**
 * Get current timestamp in local timezone (not UTC)
 * @returns string in ISO format but adjusted to local timezone
 */
export const getLocalTimestamp = (): string => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000; // offset in milliseconds
  const localDate = new Date(now.getTime() - offset);
  return localDate.toISOString();
};

/**
 * Format date to YYYY-MM-DD from any date input using local timezone
 * @param date - Date object, string, or undefined (uses current date)
 * @returns string in YYYY-MM-DD format
 */
export const formatDateToLocalYYYYMMDD = (date?: Date | string): string => {
  const dateObj = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
  return formatDateToYYYYMMDD(dateObj);
};

/**
 * Get current date and time in local timezone
 * @returns object with date and time strings
 */
export const getCurrentLocalDateTime = () => {
  const now = new Date();
  return {
    date: formatDateToYYYYMMDD(now),
    time: now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }),
    datetime: now.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  };
};

/**
 * Convert UTC date string to local date string
 * @param utcDateString - UTC date string
 * @returns local date string in YYYY-MM-DD format
 */
export const convertUTCToLocalDate = (utcDateString: string): string => {
  const utcDate = new Date(utcDateString);
  return formatDateToYYYYMMDD(utcDate);
};

/**
 * Get current time in HH:MM:SS format (local timezone)
 * @returns string in HH:MM:SS format
 */
export const getCurrentTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Check if a date is today (local timezone)
 * @param date - Date to check
 * @returns boolean
 */
export const isToday = (date: Date | string): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Get yesterday's date in YYYY-MM-DD format (local timezone)
 * @returns string in YYYY-MM-DD format
 */
export const getYesterdayDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDateToYYYYMMDD(yesterday);
};

/**
 * Get tomorrow's date in YYYY-MM-DD format (local timezone)
 * @returns string in YYYY-MM-DD format
 */
export const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateToYYYYMMDD(tomorrow);
};
