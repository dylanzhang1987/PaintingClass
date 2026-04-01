import { format } from 'date-fns';

// Simple Chinese holiday data for 2025-2026
// This is a subset of common holidays - in production, use an API or more complete data
const HOLIDAY_DATA = {
  2025: [
    { date: '2025-01-01.00:00:00.000Z', name: '元旦', isHoliday: true },
    { date: '2025-01-28.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2025-01-29.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2025-01-30.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2025-01-31.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2025-02-01.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2025-02-02.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2025-02-03.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2025-04-04.00:00:00.000Z', name: '清明节', isHoliday: true },
    { date: '2025-04-05.00:00:00.000Z', name: '清明节', isHoliday: true },
    { date: '2025-04-06.00:00:00.000Z', name: '清明节', isHoliday: true },
    { date: '2025-05-01.00:00:00.000Z', name: '劳动节', isHoliday: true },
    { date: '2025-05-02.00:00:00.000Z', name: '劳动节', isHoliday: true },
    { date: '2025-05-03.00:00:00.000Z', name: '劳动节', isHoliday: true },
    { date: '2025-05-04.00:00:00.000Z', name: '劳动节', isHoliday: true },
    { date: '2025-05-05.00:00:00.000Z', name: '劳动节', isHoliday: true },
    { date: '2025-05-31.00:00:00.000Z', name: '端午节', isHoliday: true },
    { date: '2025-06-01.00:00:00.000Z', name: '端午节', isHoliday: true },
    { date: '2025-06-02.00:00:00.000Z', name: '端午节', isHoliday: true },
    { date: '2025-10-01.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2025-10-02.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2025-10-03.00:00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2025-10-04.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2025-10-05.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2025-10-06.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2025-10-07.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2025-10-08.00:00:00.000Z', name: '国庆节', isHoliday: true },
  ],
  2026: [
    { date: '2026-01-01.00:00:00.000Z', name: '元旦', isHoliday: true },
    { date: '2026-01-17.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2026-01-18.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2026-01-19.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2026-01-20.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2026-01-21.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2026-01-22.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2026-01-23.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2026-01-24.00:00:00.000Z', name: '春节', isHoliday: true },
    { date: '2026-04-05.00:00:00.000Z', name: '清明节', isHoliday: true },
    { date: '2026-05-01.00:00:00.000Z', name: '劳动节', isHoliday: true },
    { date: '2026-05-02.00:00:00.000Z', name: '劳动节', isHoliday: true },
    { date: '2026-05-03.00:00:00.000Z', name: '劳动节', isHoliday: true },
    { date: '2026-05-04.00:00:00.000Z', name: '劳动节', isHoliday: true },
    { date: '2026-05-05.00:00:00.000Z', name: '劳动节', isHoliday: true },
    { date: '2026-06-19.00:00:00.000Z', name: '端午节', isHoliday: true },
    { date: '2026-06-20.00:00:00.000Z', name: '端午节', isHoliday: true },
    { date: '2026-06-21.00:00:00.000Z', name: '端午节', isHoliday: true },
    { date: '2026-09-19.00:00:00.000Z', name: '中秋节', isHoliday: true },
    { date: '2026-09-20.00:00:00.000Z', name: '中秋节', isHoliday: true },
    { date: '2026-09-21.00:00:00.000Z', name: '中秋节', isHoliday: true },
    { date: '2026-10-01.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2026-10-02.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2026-10-03.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2026-10-04.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2026-10-05.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2026-10-06.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2026-10-07.00:00:00.000Z', name: '国庆节', isHoliday: true },
    { date: '2026-10-08.00:00:00.000Z', name: '国庆节', isHoliday: true },
  ]
};

// Cache for holidays by year
const holidaysCache = {};

/**
 * Format date object to YYYY-MM-DD string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDateString = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get Chinese holidays for a specific year
 * @param {number} year - The year to get holidays for
 * @returns {Promise<Array>} Array of holiday objects
 */
export const getHolidays = async (year) => {
  if (holidaysCache[year]) {
    return holidaysCache[year];
  }

  try {
    // Use pre-defined holiday data
    const holidays = HOLIDAY_DATA[year] || [];

    // Normalize holiday objects
    const normalizedHolidays = holidays.map(holiday => {
      // Parse the date string
      const dateStr = holiday.date.split('.')[0]; // Remove .00:00:00.000Z
      const dateObj = new Date(dateStr + 'T00:00:00.000Z');

      return {
        date: formatDateString(dateObj),
        name: holiday.name,
        isHoliday: true,
        isWorkday: holiday.isWorkday || false
      };
    });

    holidaysCache[year] = normalizedHolidays;
    return normalizedHolidays;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
};

/**
 * Check if a specific date is a holiday
 * @param {Date} date - Date to check
 * @returns {Promise<boolean>} True if the date is a holiday
 */
export const isHoliday = async (date) => {
  if (!date) return false;
  const dateString = formatDateString(date);

  const holidays = await getHolidays(date.getFullYear());
  return holidays.some(holiday => holiday.date === dateString && holiday.isHoliday);
};

/**
 * Check if a specific date is a workday (makeup day)
 * @param {Date} date - Date to check
 * @returns {Promise<boolean>} True if the date is a workday
 */
export const isWorkday = async (date) => {
  if (!date) return false;
  const dateString = formatDateString(date);

  const holidays = await getHolidays(date.getFullYear());
  return holidays.some(holiday => holiday.date === dateString && holiday.isWorkday);
};

/**
 * Get the holiday name for a specific date
 * @param {Date} date - Date to check
 * @returns {Promise<string|null>} Holiday name or null if not a holiday
 */
export const getHolidayName = async (date) => {
  if (!date) return null;
  const dateString = formatDateString(date);

  const holidays = await getHolidays(date.getFullYear());
  const holiday = holidays.find(holiday => holiday.date === dateString && holiday.isHoliday);
  return holiday ? holiday.name : null;
};

/**
 * Get all holidays for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Promise<Array>} Array of holiday objects for the month
 */
export const getMonthHolidays = async (year, month) => {
  const holidays = await getHolidays(year);
  return holidays.filter(holiday => {
    const [hYear, hMonth] = holiday.date.split('-').map(Number);
    return hYear === year && hMonth === month + 1;
  });
};

/**
 * Clear the holidays cache
 */
export const clearHolidayCache = () => {
  Object.keys(holidaysCache).forEach(key => {
    delete holidaysCache[key];
  });
};
