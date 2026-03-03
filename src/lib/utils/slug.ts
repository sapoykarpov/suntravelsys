/**
 * Utility functions for slug generation
 */

/**
 * Converts a string into a URL-safe slug
 * e.g. "The Kyoto Zen Experience" → "kyoto-zen-experience"
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')   // Remove special characters
        .replace(/\s+/g, '-')       // Replace spaces with hyphens
        .replace(/-+/g, '-')        // Collapse multiple hyphens
        .replace(/^-|-$/g, '');     // Trim leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a short random suffix
 * e.g. "kyoto-zen-experience-a3b8"
 */
export function generateUniqueSlug(text: string): string {
    const base = generateSlug(text);
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}-${suffix}`;
}
