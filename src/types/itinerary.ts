export type ThemeTemplate =
  | 'amazing-black'
  | 'bento'
  | 'viral-tiktok'
  | 'scrapbook'
  | 'interactive-map'
  | 'conde-nast'
  | 'japan-editorial'
  | 'bali-andi'
  | 'umrah-mature'
  | 'umrah-youth'
  | 'umroh-event'
  | 'default';

export interface BrandProfile {
  id: string;
  name: string;
  tagline?: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  website?: string;
  address?: string;
  // Legacy support for nested contact if needed, but flatter is better for now
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  contact?: {
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    website?: string;
    email?: string;
  };
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
  iconCategory?: 'flight' | 'hotel' | 'meal' | 'transport' | 'activity' | 'camera';
}

export interface ItineraryDay {
  dayNumber: number;
  date?: string;
  title: string;
  location: string;
  summary: string;
  heroImage: string;
  videoUrl?: string;
  meals?: string[];
  activities: Activity[];
}

export interface Highlight {
  label: string;
  value: string;
  icon?: string;
}

export interface Hotel {
  name: string;
  rating: string;
  location: string;
  description: string;
  imageUrl: string;
}

export interface CoverTextSettings {
  fontSize?: number;       // px, e.g. 48
  position?: 'top' | 'center' | 'bottom';
  color?: string;          // e.g. '#ffffff'
  strokeColor?: string;    // text stroke/outline color
  strokeWidth?: number;    // px, e.g. 1
  shadowColor?: string;    // text-shadow color
  shadowBlur?: number;     // text-shadow blur radius in px
}

export interface ItineraryPayload {
  id: string;
  version: string;
  theme: ThemeTemplate;
  meta: {
    title: string;
    subtitle: string;
    durationDays: number;
    durationNights: number;
    startDate: string;
    endDate: string;
    groupSize: string;
    price: string;
    priceNote?: string;
    coverImage?: string;
  };
  highlights: Highlight[];
  itinerarySummary?: string[];
  inclusions: string[];
  exclusions: string[];
  days: ItineraryDay[];
  hotels?: Hotel[];
  brand: BrandProfile;
  coverTextSettings?: CoverTextSettings;
  content_original?: any; // Full original parsed object
  content_personalized?: any; // Full personalized parsed object
  active_version?: 'original' | 'personalized';
  language: 'id' | 'en';
  style: 'original' | 'friendly' | 'persuasive' | 'energetic';
}
