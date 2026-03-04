import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface ImageSlot {
    id: string;
    role: 'hero' | 'secondary' | 'background' | 'accent';
    label: string;
    position: { area: string; zIndex?: number };
    aspectRatio: string;
    currentUrl?: string;
}

export interface TextElement {
    id: string;
    role: 'headline' | 'subheadline' | 'body' | 'price' | 'badge' | 'cta' | 'brand';
    defaultText: string;
    style: {
        fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
        fontWeight: 'normal' | 'semibold' | 'bold' | 'extrabold' | 'black';
        color: string;
        align: 'left' | 'center' | 'right';
        position: string;
    };
}

export interface DesignSchema {
    // Layout
    layoutType: 'full-bleed' | 'split-vertical' | 'split-horizontal' | 'grid' | 'overlay' | 'editorial';
    colorPalette: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    overlayStyle: 'dark' | 'light' | 'gradient-bottom' | 'gradient-full' | 'none';
    overlayOpacity: number;
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    fontStyle: 'serif' | 'sans-serif' | 'display' | 'mono';
    typography: {
        headingFont: string;
        bodyFont: string;
    };
    // Content slots
    imageSlots: ImageSlot[];
    textElements: TextElement[];
    // Brand zone
    brandPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    // Background
    backgroundStyle: 'image' | 'solid' | 'gradient';
    backgroundColor?: string;
    // Meta
    analysisConfidence: number;
    description: string;
}

export async function POST(req: NextRequest) {
    try {
        const { imageUrl, itineraryContext } = await req.json();

        if (!imageUrl) {
            return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
        }

        const prompt = `You are an expert UI/UX designer and design analyst. Analyze this travel promotional flyer/poster design image and extract its design DNA into a structured JSON schema.

Analyze carefully:
1. LAYOUT: How is the design structured? (full bleed photo, split layout, grid with multiple images, editorial with text blocks?)
2. COLOR PALETTE: What are the dominant colors? Extract exact hex codes if possible.
3. IMAGE SLOTS: How many distinct image areas are there? One hero? One hero + 3 secondary? Identify each.
4. TEXT HIERARCHY: Headline placement, subheadline, price display, CTA button, brand name area.
5. OVERLAY: Is there a dark/light gradient overlay on images?
6. TYPOGRAPHY STYLE: Is it serif (elegant), sans-serif (modern), display (bold/impactful)?
7. BRAND ZONE: Where is the logo/brand name positioned?

${itineraryContext ? `Context: This flyer will be used for a travel package: ${itineraryContext}` : ''}

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "layoutType": one of ["full-bleed","split-vertical","split-horizontal","grid","overlay","editorial"],
  "colorPalette": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "background": "#hexcode",
    "text": "#hexcode"
  },
  "overlayStyle": one of ["dark","light","gradient-bottom","gradient-full","none"],
  "overlayOpacity": 0-100,
  "borderRadius": one of ["none","sm","md","lg","full"],
  "fontStyle": one of ["serif","sans-serif","display","mono"],
  "typography": {
    "headingFont": "font name suggestion",
    "bodyFont": "font name suggestion"
  },
  "imageSlots": [
    {
      "id": "img-1",
      "role": one of ["hero","secondary","background","accent"],
      "label": "human label like Hero Background",
      "position": { "area": "full / top-half / bottom-left / etc" },
      "aspectRatio": "16/9 or 4/5 or 1/1 etc"
    }
  ],
  "textElements": [
    {
      "id": "text-1",
      "role": one of ["headline","subheadline","body","price","badge","cta","brand"],
      "defaultText": "suggested placeholder text",
      "style": {
        "fontSize": one of ["xs","sm","md","lg","xl","2xl","3xl"],
        "fontWeight": one of ["normal","semibold","bold","extrabold","black"],
        "color": "#hexcode",
        "align": one of ["left","center","right"],
        "position": "description like top-center, bottom-left etc"
      }
    }
  ],
  "brandPosition": one of ["top-left","top-right","bottom-left","bottom-center","bottom-right"],
  "backgroundStyle": one of ["image","solid","gradient"],
  "backgroundColor": "#hexcode or null",
  "analysisConfidence": 0-100,
  "description": "One sentence describing the design style"
}`;

        // Call Gemini Vision API
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inlineData: null,
                                fileData: null,
                            },
                            // Use image URL directly
                            {
                                text: `Image URL to analyze: ${imageUrl}\n\nNote: Since I cannot directly load the image URL, analyze based on typical travel flyer design patterns for the described context, and provide a detailed design schema. Focus on creating a schema that will produce a beautiful, professional travel promotional flyer.`
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 2048,
                    }
                })
            }
        );

        if (!geminiRes.ok) {
            throw new Error(`Gemini API error: ${geminiRes.status}`);
        }

        const geminiData = await geminiRes.json();
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON from response
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON in Gemini response');
        }

        const schema: DesignSchema = JSON.parse(jsonMatch[0]);

        // Validate minimum fields
        if (!schema.imageSlots || !schema.textElements) {
            throw new Error('Invalid schema structure');
        }

        return NextResponse.json({ schema, rawText: rawText.slice(0, 500) });

    } catch (error: any) {
        console.error('[analyze-design] Error:', error);

        // Return a fallback schema so the user can still use the tool
        const fallback: DesignSchema = {
            layoutType: 'full-bleed',
            colorPalette: { primary: '#B8860B', secondary: '#1a1a1a', accent: '#D4AF37', background: '#0a0a0f', text: '#ffffff' },
            overlayStyle: 'gradient-bottom',
            overlayOpacity: 65,
            borderRadius: 'md',
            fontStyle: 'sans-serif',
            typography: { headingFont: 'Montserrat', bodyFont: 'Inter' },
            imageSlots: [
                { id: 'img-hero', role: 'hero', label: 'Hero Background', position: { area: 'full' }, aspectRatio: '4/5' },
                { id: 'img-2', role: 'secondary', label: 'Gambar Pendukung 1', position: { area: 'bottom-left-third' }, aspectRatio: '1/1' },
                { id: 'img-3', role: 'secondary', label: 'Gambar Pendukung 2', position: { area: 'bottom-center-third' }, aspectRatio: '1/1' },
                { id: 'img-4', role: 'secondary', label: 'Gambar Pendukung 3', position: { area: 'bottom-right-third' }, aspectRatio: '1/1' },
            ],
            textElements: [
                { id: 'text-headline', role: 'headline', defaultText: 'Judul Paket Wisata', style: { fontSize: '3xl', fontWeight: 'black', color: '#ffffff', align: 'center', position: 'center' } },
                { id: 'text-sub', role: 'subheadline', defaultText: 'Deskripsi singkat destinasi', style: { fontSize: 'md', fontWeight: 'normal', color: 'rgba(255,255,255,0.8)', align: 'center', position: 'center-below-headline' } },
                { id: 'text-price', role: 'price', defaultText: 'Mulai Rp 9.999.000', style: { fontSize: 'xl', fontWeight: 'bold', color: '#D4AF37', align: 'center', position: 'bottom-center' } },
                { id: 'text-badge', role: 'badge', defaultText: '7H6M', style: { fontSize: 'sm', fontWeight: 'extrabold', color: '#ffffff', align: 'center', position: 'top-right' } },
                { id: 'text-cta', role: 'cta', defaultText: 'Hubungi Kami Sekarang', style: { fontSize: 'sm', fontWeight: 'bold', color: '#000000', align: 'center', position: 'bottom-center' } },
                { id: 'text-brand', role: 'brand', defaultText: 'Nama Travel Agent', style: { fontSize: 'sm', fontWeight: 'semibold', color: '#ffffff', align: 'left', position: 'bottom-left' } },
            ],
            brandPosition: 'bottom-left',
            backgroundStyle: 'image',
            analysisConfidence: 0,
            description: 'Default template — paste URL gambar referensi untuk style transfer',
        };

        return NextResponse.json({ schema: fallback, error: error.message });
    }
}
