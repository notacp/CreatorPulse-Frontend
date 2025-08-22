import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

/**
 * Ensures a value is an array, returning an empty array if not
 * @param value - The value to check
 * @returns An array (either the original if it was an array, or empty array)
 */
export function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Safe array mapping that handles potential undefined/null values
 * @param array - The array-like value to map
 * @param mapFn - The mapping function
 * @returns Mapped array or empty array if input is invalid
 */
export function safeMap<T, R>(array: unknown, mapFn: (item: T, index: number) => R): R[] {
  const safeArray = ensureArray<T>(array);
  return safeArray.map(mapFn);
}

/**
 * Validates API response data structure and ensures arrays are properly formatted
 * @param response - API response object
 * @param expectedArrayField - Optional field name that should contain an array
 * @returns Validated response with ensured array structure
 */
export function validateApiResponse<T>(response: any, expectedArrayField?: string): T {
  if (!response || typeof response !== 'object') {
    console.warn('Invalid API response:', response);
    return (expectedArrayField ? { [expectedArrayField]: [] } : []) as T;
  }
  
  if (expectedArrayField && response[expectedArrayField]) {
    response[expectedArrayField] = ensureArray(response[expectedArrayField]);
  }
  
  return response;
}
