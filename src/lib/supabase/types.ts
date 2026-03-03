// =============================================================
// Auto-generated Supabase Database types
// Mirrors the schema defined in /supabase/schema.sql
// =============================================================

export type ItineraryStatus = 'pending' | 'draft' | 'published' | 'archived';
export type ItineraryLanguage = 'id' | 'en';
export type ItineraryStyle = 'original' | 'friendly' | 'persuasive' | 'energetic';

export interface ItineraryMeta {
    title: string;
    subtitle: string;
    durationDays: number;
    durationNights: number;
    startDate: string;
    endDate: string;
    groupSize: string;
    price: string;
    priceNote?: string;
}

export interface Database {
    public: {
        Tables: {
            clients: {
                Row: {
                    id: string;
                    slug: string;
                    brand_name: string;
                    tagline: string | null;
                    primary_color: string;
                    secondary_color: string;
                    logo_url: string | null;
                    // Contact
                    phone: string | null;
                    whatsapp: string | null;
                    email: string | null;
                    website: string | null;
                    // Social platforms
                    instagram: string | null;
                    facebook: string | null;
                    tiktok: string | null;
                    twitter_x: string | null;
                    youtube: string | null;
                    linkedin: string | null;
                    // Timestamps
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    slug: string;
                    brand_name: string;
                    tagline?: string | null;
                    primary_color?: string;
                    secondary_color?: string;
                    logo_url?: string | null;
                    phone?: string | null;
                    whatsapp?: string | null;
                    email?: string | null;
                    website?: string | null;
                    instagram?: string | null;
                    facebook?: string | null;
                    tiktok?: string | null;
                    twitter_x?: string | null;
                    youtube?: string | null;
                    linkedin?: string | null;
                };
                Update: {
                    slug?: string;
                    brand_name?: string;
                    tagline?: string | null;
                    primary_color?: string;
                    secondary_color?: string;
                    logo_url?: string | null;
                    phone?: string | null;
                    whatsapp?: string | null;
                    email?: string | null;
                    website?: string | null;
                    instagram?: string | null;
                    facebook?: string | null;
                    tiktok?: string | null;
                    twitter_x?: string | null;
                    youtube?: string | null;
                    linkedin?: string | null;
                };
            };
            itineraries: {
                Row: {
                    id: string;
                    client_id: string;
                    status: ItineraryStatus;
                    theme: string;
                    version: string;
                    language: ItineraryLanguage;
                    style: ItineraryStyle;
                    meta: ItineraryMeta;
                    highlights: { label: string; value: string; icon?: string }[];
                    itinerary_summary: string[];
                    inclusions: string[];
                    exclusions: string[];
                    days: {
                        dayNumber: number;
                        date?: string;
                        title: string;
                        location: string;
                        summary: string;
                        heroImage: string;
                        videoUrl?: string;
                        activities: {
                            time: string;
                            title: string;
                            description: string;
                            image?: string;
                            icon?: string;
                        }[];
                    }[];
                    hotels: {
                        name: string;
                        rating: string;
                        location: string;
                        description: string;
                        imageUrl: string;
                    }[];
                    original_submission: Record<string, unknown> | null;
                    slug: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    status?: ItineraryStatus;
                    theme?: string;
                    version?: string;
                    language?: ItineraryLanguage;
                    style?: ItineraryStyle;
                    meta: ItineraryMeta;
                    highlights?: { label: string; value: string; icon?: string }[];
                    itinerary_summary?: string[];
                    inclusions?: string[];
                    exclusions?: string[];
                    days: {
                        dayNumber: number;
                        date?: string;
                        title: string;
                        location: string;
                        summary: string;
                        heroImage: string;
                        videoUrl?: string;
                        activities: {
                            time: string;
                            title: string;
                            description: string;
                            image?: string;
                            icon?: string;
                        }[];
                    }[];
                    hotels?: {
                        name: string;
                        rating: string;
                        location: string;
                        description: string;
                        imageUrl: string;
                    }[];
                    original_submission?: Record<string, unknown> | null;
                    slug: string;
                };
                Update: {
                    client_id?: string;
                    status?: ItineraryStatus;
                    theme?: string;
                    version?: string;
                    language?: ItineraryLanguage;
                    style?: ItineraryStyle;
                    meta?: ItineraryMeta;
                    highlights?: { label: string; value: string; icon?: string }[];
                    itinerary_summary?: string[];
                    inclusions?: string[];
                    exclusions?: string[];
                    days?: {
                        dayNumber: number;
                        date?: string;
                        title: string;
                        location: string;
                        summary: string;
                        heroImage: string;
                        videoUrl?: string;
                        activities: {
                            time: string;
                            title: string;
                            description: string;
                            image?: string;
                            icon?: string;
                        }[];
                    }[];
                    hotels?: {
                        name: string;
                        rating: string;
                        location: string;
                        description: string;
                        imageUrl: string;
                    }[];
                    original_submission?: Record<string, unknown> | null;
                    slug?: string;
                };
            };
            theme_presets: {
                Row: {
                    id: string;
                    preset_name: string;
                    theme_id: string;
                    font_pairing: string;
                    color_palette: Record<string, string>;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    preset_name: string;
                    theme_id: string;
                    font_pairing: string;
                    color_palette?: Record<string, string>;
                };
                Update: {
                    preset_name?: string;
                    theme_id?: string;
                    font_pairing?: string;
                    color_palette?: Record<string, string>;
                };
            };
        };
    };
}
