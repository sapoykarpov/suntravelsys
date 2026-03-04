import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { imageUrl, base64Image, mimeType: bodyMimeType } = await req.json();

        if (!imageUrl && !base64Image) {
            return NextResponse.json({ error: 'imageUrl or base64Image required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
        }

        let finalBase64 = base64Image;
        let mimeType = bodyMimeType || 'image/jpeg';

        // If URL provided (and no base64), try to download
        if (!finalBase64 && imageUrl) {
            const imageRes = await fetch(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            if (!imageRes.ok) throw new Error(`Image fetch failed: ${imageRes.status}`);
            const imageBuffer = await imageRes.arrayBuffer();
            finalBase64 = Buffer.from(imageBuffer).toString('base64');
            mimeType = (imageRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
        }

        const prompt = `You are a CSS expert. Analyze the text effect in this image and return ONLY a JSON object with these exact keys.

Rules:
- "fontFamily": best matching Google Font name (e.g., "Impact", "Bangers", "Black Han Sans")
- "fontWeight": number as string (e.g., "900")  
- "color": valid CSS gradient or hex color (e.g., "linear-gradient(180deg, #FFD700 0%, #FF6B00 100%)")
- "textShadow": multi-layer CSS text-shadow (e.g., "2px 2px 0 #8B0000, 4px 4px 0 #5C0000, 0 0 20px rgba(0,0,0,0.7)")
- "webkitTextStroke": stroke (e.g., "3px #ffffff")
- "letterSpacing": (e.g., "0.05em")
- "textTransform": "uppercase" or "none"

Return ONLY the JSON object, no explanation, no markdown, no code blocks. Start with { and end with }.`;

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                inlineData: {
                                    mimeType,
                                    data: finalBase64
                                }
                            },
                            { text: prompt }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 512,
                    }
                })
            }
        );

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.error('Gemini API error:', errText);
            throw new Error(`Gemini API error: ${geminiRes.status}`);
        }

        const geminiData = await geminiRes.json();
        const rawText: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

        console.log('[analyze-text-effect] Gemini raw:', rawText.substring(0, 300));

        // Extract JSON — try multiple strategies
        let style: any = null;

        // Strategy 1: Direct parse
        try { style = JSON.parse(rawText.trim()); } catch (_) { }

        // Strategy 2: Extract between first { and last }
        if (!style || Object.keys(style).length === 0) {
            const start = rawText.indexOf('{');
            const end = rawText.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                try { style = JSON.parse(rawText.slice(start, end + 1)); } catch (_) { }
            }
        }

        // Strategy 3: Fallback — if still empty, build a visually impactful default
        if (!style || Object.keys(style).length === 0) {
            console.warn('[analyze-text-effect] Failed to parse. Using enhanced fallback.');
            style = {
                fontFamily: 'Bangers',
                fontWeight: '900',
                color: 'linear-gradient(180deg, #FFD700 0%, #FF8C00 50%, #FF4500 100%)',
                textShadow: '2px 2px 0 #8B0000, 4px 4px 0 #5C0000, 6px 6px 0 #3A0000, 0 0 30px rgba(255,100,0,0.5)',
                webkitTextStroke: '3px #ffffff',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
            };
        }

        return NextResponse.json({ style });

    } catch (error: any) {
        console.error('[analyze-text-effect] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
