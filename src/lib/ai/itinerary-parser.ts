import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Gemini Client ──────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * The structured JSON schema we expect Gemini to extract from
 * raw itinerary text (Tally.so submission, PDF content, etc.)
 */
export interface ParsedItinerary {
  title: string;
  subtitle: string;
  durationDays: number;
  durationNights: number;
  startDate: string;
  endDate: string;
  groupSize: string;
  price: string;
  priceNote?: string;
  highlights: { label: string; value: string }[];
  itinerarySummary: string[];
  inclusions: string[];
  exclusions: string[];
  days: {
    dayNumber: number;
    date?: string;
    title: string;
    location: string;
    summary: string;
    meals: string[];
    activities: {
      time: string;
      title: string;
      description: string;
      iconCategory?: 'flight' | 'hotel' | 'meal' | 'activity' | 'transport';
    }[];
  }[];
  hotels: {
    name: string;
    rating: string;
    location: string;
    description: string;
  }[];
}

const getSystemPrompt = (language: string, style: string, brandName: string) => `You are a travel itinerary data extraction specialist for a luxury digital magazine platform.

Your job is to extract structured itinerary data from raw text submissions.

CORE OBJECTIVE:
- Extract ALL days and activities.
- Identify specific travel components for icons:
  * Flights: Detect flight numbers (e.g., JL 720, SQ 950) or "Flight", "Penerbangan". Set iconCategory: 'flight'.
  * Hotels: Detect "Check-in", "Stay at", "Hotel", "Ryokan", "Villa". Set iconCategory: 'hotel'.
  * Meals: Detect "Breakfast", "Lunch", "Dinner" or Indonesian equivalents (MP/Makan Pagi, MS/Makan Siang, MM/Makan Malam). Set iconCategory: 'meal'.
  * Transport: Detect "Transfer", "Pick up", "Shinkansen", "Private car". Set iconCategory: 'transport'.
- If an activity includes a meal code (B/L/D or MP/MS/MM), extract it into the 'meals' array for that day.

BRANDING RULES:
- IMPORTANT: The travel agent's brand name is "${brandName}".
- If you find any other wholesaler or competing agency names in the raw text, REPLACE them with "${brandName}".

LANGUAGE REQUIREMENT:
- You MUST translate all extracted text content into: ${language === 'en' ? 'English' : 'Indonesian (Bahasa Indonesia)'}.

STYLE REQUIREMENT:
- Style: ${style}.
- Original: KEEP IT RAW. Preserve exact wording, tone, and formatting of the source text. Only apply brand replacement and translation.
- Friendly: Transform into a warm, inviting, and community-focused narrative. Use words like "explore together", "your home away from home", and "we'll discover". Tone should be like a knowledgeable friend.
- Persuasive: Focus on ROI, exclusivity, and "once-in-a-lifetime" appeal. Use high-impact adjectives (luxurious, elite, unparalleled). Highlight why THIS specific itinerary is better than any other. Focus on benefits and transformations.
- Energetic: High-tempo, exciting, and FOMO-driven. Use short, punchy sentences. Focus on action: "Race through...", "Dive into...", "Experience the thrill!". Use plenty of active verbs.

ALWAYS respond with ONLY valid JSON matching the schema. No markdown, no explanation, just JSON.`;

const EXTRACTION_PROMPT = `Extract the following structured data from this travel itinerary submission.

Return a JSON object with this exact schema:
{
  "title": "Trip title",
  "subtitle": "Short compelling subtitle",
  "durationDays": number,
  "durationNights": number,
  "startDate": "ISO date string or empty string if not specified",
  "endDate": "ISO date string or empty string if not specified",
  "groupSize": "e.g. 'Private / Max 4' or 'Group of 10'",
  "price": "Price as displayed string, e.g. 'IDR 65.000.000'",
  "priceNote": "e.g. 'per person, twin sharing'",
  "highlights": [{ "label": "string", "value": "string" }],
  "itinerarySummary": ["standout experience 1", "standout experience 2"],
  "inclusions": ["inclusion 1", "inclusion 2"],
  "exclusions": ["exclusion 1", "exclusion 2"],
  "days": [{
    "dayNumber": 1,
    "date": "formatted date if available",
    "title": "Day title",
    "location": "City/Region",
    "summary": "One-line summary of the day",
    "meals": ["Breakfast", "Lunch"],
    "activities": [{
      "time": "HH:MM",
      "title": "Activity name",
      "description": "Brief description",
      "iconCategory": "flight | hotel | meal | transport | activity"
    }]
  }],
  "hotels": [{
    "name": "Hotel name",
    "rating": "e.g. 5 Star Luxury",
    "location": "City, Region",
    "description": "Brief description"
  }]
}

Here is the raw itinerary text:
---
`;

export interface FileData {
  mimeType: string;
  data: string; // Base64 encoded string
}

/**
 * Parses raw itinerary text and/or file using Gemini AI and returns structured data.
 *
 * @param rawText - The raw itinerary content or instructions
 * @param brandName - The travel agency brand name
 * @param language - The target language ('id' or 'en')
 * @param style - The target writing style
 * @param fileData - Optional file to parse (e.g. PDF base64)
 * @returns ParsedItinerary - Structured itinerary data
 */
export async function parseItinerary(
  rawText: string,
  brandName: string = 'Our Agency',
  language: 'id' | 'en' = 'id',
  style: 'original' | 'friendly' | 'persuasive' | 'energetic' = 'original',
  fileData?: FileData
): Promise<ParsedItinerary> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: style === 'original' ? 0.2 : 0.6, // Higher temp for stylized rewrites
      responseMimeType: 'application/json',
    },
    systemInstruction: getSystemPrompt(language, style, brandName),
  });

  const promptParts: any[] = [EXTRACTION_PROMPT + rawText];
  if (fileData) {
    promptParts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  const result = await model.generateContent(promptParts);
  const response = result.response;
  const text = response.text();

  try {
    const parsed: ParsedItinerary = JSON.parse(text);
    return parsed;
  } catch {
    console.error('[AI Parser] Failed to parse Gemini response:', text);
    throw new Error('AI failed to return valid JSON. Raw response logged.');
  }
}
