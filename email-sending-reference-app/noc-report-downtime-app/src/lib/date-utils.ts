import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const BANGKOK_TIMEZONE = "Asia/Bangkok";

/**
 * Format date for display in Bangkok timezone
 */
export function formatForDisplay(
    date: Date | string | null | undefined,
    format: string = "DD-MM-YYYY HH:mm:ss"
): string {
    if (!date) return "";
    return dayjs.utc(date).tz(BANGKOK_TIMEZONE).format(format);
}

/**
 * Format date for storage (convert Bangkok to UTC)
 */
export function formatForStorage(date: Date | string | null | undefined): Date {
    if (!date) return new Date();
    return dayjs.tz(date, BANGKOK_TIMEZONE).utc().toDate();
}

/**
 * Get current Bangkok time
 */
export function getBangkokNow(format?: string): string {
    const now = dayjs().tz(BANGKOK_TIMEZONE);
    return format ? now.format(format) : now.format("YYYY-MM-DD HH:mm:ss");
}

/**
 * Format date only (no time)
 */
export function formatDateOnly(date: Date | string | null | undefined): string {
    if (!date) return "";
    return dayjs.utc(date).tz(BANGKOK_TIMEZONE).format("DD-MM-YYYY");
}

/**
 * Get dayjs instance in Bangkok timezone
 */
export function toBangkokDayjs(date: Date | string | null | undefined) {
    if (!date) return dayjs().tz(BANGKOK_TIMEZONE);
    return dayjs.utc(date).tz(BANGKOK_TIMEZONE);
}
