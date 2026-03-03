
/**
 * Utility for providing beautiful Unsplash fallbacks for travel itineraries.
 */

const TRAVEL_PLACEHOLDERS: Record<string, string> = {
    hero: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop',
    japan: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop',
    bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2000&auto=format&fit=crop',
    umrah: 'https://images.unsplash.com/photo-1565031491910-e57fac031c90?q=80&w=2000&auto=format&fit=crop',
    city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2000&auto=format&fit=crop',
    nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000&auto=format&fit=crop',
    food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop',
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000&auto=format&fit=crop',
    flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109c05e?q=80&w=2000&auto=format&fit=crop'
};

export function getFallbackImage(category: keyof typeof TRAVEL_PLACEHOLDERS = 'hero'): string {
    return TRAVEL_PLACEHOLDERS[category] || TRAVEL_PLACEHOLDERS.hero;
}

export function imageWithFallback(src: string | undefined | null, category?: keyof typeof TRAVEL_PLACEHOLDERS): string {
    if (!src || src.trim() === '' || src === 'empty') {
        return getFallbackImage(category);
    }
    return src;
}
