import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface TextEffectCSS {
    fontFamily: string;
    fontSize?: string;
    fontWeight: string;
    color: string; // Hex or CSS Gradient
    textShadow: string; // Multi-layered for 3D effect
    webkitTextStroke: string; // "width color"
    letterSpacing: string;
    textTransform: 'uppercase' | 'none';
    backgroundClip?: 'text';
    webkitBackgroundClip?: 'text';
    colorTransparent?: boolean;
    rotation?: string;
    perspective?: string;
    skew?: string;
}

export async function POST(req: NextRequest) {
    try {
        const { imageUrl } = await req.json();

        if (!imageUrl) {
            return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const prompt = `Analyze the TEXT EFFECT in this image. I want to replicate this exact style using CSS.
        
        Focus on:
        1. COLOR: Is it a gradient? (e.g., yellow to orange).
        2. STROKE: Is there an outline? (e.g., thick white stroke).
        3. 3D EFFECT: Look at the shadows. Are there multiple layers of shadow to create depth?
        4. TEXTURE: Is it glossy or matte?
        5. TYPOGRAPHY: Is it extremely bold/black?
        
        Return ONLY valid JSON matching this schema:
        {
          "fontFamily": "suggested google font name",
          "fontWeight": "e.g. 900",
          "color": "CSS linear-gradient(...) or hex",
          "textShadow": "CSS value for multi-layered shadow (comma separated)",
          "webkitTextStroke": "width color",
          "letterSpacing": "e.g. -0.05em",
          "textTransform": "uppercase",
          "colorTransparent": true/false (if using gradient fills),
          "skew": "e.g. -5deg, 0deg"
        }`;

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { text: `Image URL to analyze: ${imageUrl}\nFocus on replicating the 'QUEST' style text effect.` }
                        ]
                    }]
                })
            }
        );

        const geminiData = await geminiRes.json();
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error('No valid JSON');

        const style = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ style });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
