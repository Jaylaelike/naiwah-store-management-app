import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the base path for the application
 * In production: /naiwah
 * In development: empty string
 */
export function getBasePath(): string {
  return process.env.NODE_ENV === 'production' ? '/naiwah' : '';
}

/**
 * Construct API URL with correct basePath
 * Example: apiUrl('/api/notifications') -> '/naiwah/api/notifications' (prod) or '/api/notifications' (dev)
 */
export function apiUrl(path: string): string {
  const basePath = getBasePath();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}
