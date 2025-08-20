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
