/**
 * Unsplash API helper for auto-image fetching
 * Free tier: 50 requests/hour (Demo), 5000/hour (Production)
 * API docs: https://unsplash.com/documentation
 */

interface UnsplashPhoto {
    id: string;
    urls: {
        full: string;
        regular: string; // 1080px — ideal for carousel slides
        small: string;
        thumb: string;
    };
    alt_description: string | null;
    user: {
        name: string;
        links: { html: string };
    };
    links: { html: string };
}

interface UnsplashResult {
    photos: { url: string; thumb: string; alt: string; credit: string }[];
    error?: string;
}

/**
 * Search Unsplash for travel photos based on a query keyword
 * Falls back to Picsum if no API key is configured
 */
export async function searchUnsplashPhotos(
    query: string,
    count: number = 6
): Promise<UnsplashResult> {
    const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

    // Fallback: use Picsum or default travel images if no key
    if (!accessKey) {
        return {
            photos: getFallbackPhotos(query, count),
            error: 'No Unsplash API key configured. Using fallback images.',
        };
    }

    try {
        const encoded = encodeURIComponent(`${query} travel destination`);
        const res = await fetch(
            `https://api.unsplash.com/search/photos?query=${encoded}&per_page=${count}&orientation=portrait&content_filter=high`,
            {
                headers: {
                    Authorization: `Client-ID ${accessKey}`,
                    'Accept-Version': 'v1',
                },
                next: { revalidate: 3600 }, // cache 1 hour
            }
        );

        if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);

        const data = await res.json();
        const results = data.results as UnsplashPhoto[];

        return {
            photos: results.map((p) => ({
                url: p.urls.regular,
                thumb: p.urls.thumb,
                alt: p.alt_description || query,
                credit: `Photo by ${p.user.name} on Unsplash`,
            })),
        };
    } catch (err) {
        console.error('[Unsplash] Search failed:', err);
        return {
            photos: getFallbackPhotos(query, count),
            error: String(err),
        };
    }
}

/**
 * Client-side version for use in 'use client' components
 */
export async function searchUnsplashPhotosClient(
    query: string,
    count: number = 6
): Promise<UnsplashResult> {
    const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
        return { photos: getFallbackPhotos(query, count), error: 'No API key' };
    }

    try {
        const encoded = encodeURIComponent(`${query} travel`);
        const res = await fetch(
            `https://api.unsplash.com/search/photos?query=${encoded}&per_page=${count}&orientation=portrait`,
            {
                headers: {
                    Authorization: `Client-ID ${accessKey}`,
                    'Accept-Version': 'v1',
                },
            }
        );

        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        return {
            photos: (data.results as UnsplashPhoto[]).map((p) => ({
                url: p.urls.regular,
                thumb: p.urls.thumb,
                alt: p.alt_description || query,
                credit: `Photo by ${p.user.name} on Unsplash`,
            })),
        };
    } catch (err) {
        return { photos: getFallbackPhotos(query, count), error: String(err) };
    }
}

/**
 * Curated fallback travel images from Unsplash (no API key needed)
 * These are direct CDN URLs with proper licensing
 */
function getFallbackPhotos(query: string, count: number) {
    // Seed based on query for consistent results per destination
    const seed = query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: count }, (_, i) => ({
        url: `https://picsum.photos/seed/${seed + i}/1080/1350`,
        thumb: `https://picsum.photos/seed/${seed + i}/200/250`,
        alt: `${query} travel photo ${i + 1}`,
        credit: 'Via Picsum Photos',
    }));
}
