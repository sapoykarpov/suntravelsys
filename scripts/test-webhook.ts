/**
 * Mock Tally.so Webhook Test Script
 *
 * Run: npx tsx scripts/test-webhook.ts
 *
 * This simulates a Tally.so form submission hitting our webhook.
 * Make sure the dev server is running: npm run dev
 */

const WEBHOOK_URL = 'http://localhost:3001/api/webhooks/tally';

const mockTallyPayload = {
    eventId: 'evt_test_001',
    eventType: 'FORM_RESPONSE',
    createdAt: new Date().toISOString(),
    data: {
        responseId: 'resp_test_001',
        submissionId: 'sub_test_001',
        formId: 'form_dmi_travel',
        formName: 'DMI Submission Form',
        fields: [
            {
                key: 'question_brand',
                label: 'Brand Name / Agency Name',
                type: 'INPUT_TEXT',
                value: 'LuxeTravel Architect',
            },
            {
                key: 'question_email',
                label: 'Email',
                type: 'INPUT_TEXT',
                value: 'hello@luxetravel.com',
            },
            {
                key: 'question_whatsapp',
                label: 'WhatsApp Number',
                type: 'INPUT_TEXT',
                value: 'https://wa.me/6281234567890',
            },
            {
                key: 'question_instagram',
                label: 'Instagram',
                type: 'INPUT_TEXT',
                value: 'https://instagram.com/luxetravel',
            },
            {
                key: 'question_primary_color',
                label: 'Primary Brand Color',
                type: 'INPUT_TEXT',
                value: '#D4AF37',
            },
            {
                key: 'question_secondary_color',
                label: 'Secondary Brand Color',
                type: 'INPUT_TEXT',
                value: '#1A1A1A',
            },
            {
                key: 'question_theme',
                label: 'Theme Template',
                type: 'INPUT_TEXT',
                value: 'amazing-black',
            },
            {
                key: 'question_language',
                label: 'Language',
                type: 'INPUT_TEXT',
                value: 'Bahasa Indonesia',
            },
            {
                key: 'question_style',
                label: 'Style',
                type: 'INPUT_TEXT',
                value: 'Energetic',
            },
            {
                key: 'question_itinerary',
                label: 'Itinerary Details',
                type: 'TEXTAREA',
                value: `
The Kyoto Zen Experience — A Journey into Japanese Serenity

Duration: 7 Days / 6 Nights
Group Size: Private / Max 4
Start Date: October 15, 2024
End Date: October 21, 2024
Price: IDR 65.000.000 per person, twin sharing

Hotel: Hoshinoya Kyoto — 5 Star Luxury Ryokan in Arashiyama, Kyoto.
A meticulously restored century-old riverside property accessible only by boat.

DAY 1 — Arrival & The Art of Welcome (Kyoto)
Meals: D
Flight: JL 720 CGK-KIX 06:15-15:40
16:00 - VIP Airport Transfer: Meet and greet at Kansai International Airport with luxury private transfer to Kyoto.
17:00 - Check-in: Hoshinoya Kyoto: Arrive at your exclusive riverside ryokan via a private boat ride.
19:00 - Welcome Kaiseki Dinner: A 10-course traditional dining experience prepared by a master chef.

DAY 2 — Temples & Tranquility (Kyoto)
Meals: B, L, D
09:00 - Private Kinkaku-ji Tour: Early access to the Golden Pavilion before the crowds arrive.
13:00 - Zen Meditation & Tea: Private session with a Zen monk at a hidden 14th-century temple.
18:00 - Michelin Star Dinner: Exclusive dining at KIFUNE, a 2-star Michelin restaurant.

DAY 3 — Nara Day Trip (Nara)
Meals: B, L
08:00 - Shinkansen Experience: First-class bullet train to Nara.
10:00 - Todai-ji Temple: Visit the world's largest wooden building.
14:00 - Deer Park: Interact with the sacred deer of Nara.
18:00 - Return to Kyoto for free evening.

DAY 4 — Art & Culture (Kyoto)
Meals: B, D
09:00 - Geisha Quarter Walk: Guided tour of Gion with a local historian.
12:00 - Nishiki Market Food Tour: Taste your way through Kyoto's legendary food market.
15:00 - Kiyomizu-dera Temple: Visit the iconic cliff-side temple at golden hour.

DAY 5 — Arashiyama (Kyoto)
Meals: B, L
08:00 - Bamboo Forest: Early morning private walk through the famous bamboo grove.
11:00 - Monkey Park Iwatayama: Scenic hike with panoramic views.
14:00 - Sake Tasting: Private tasting at a 300-year-old brewery.

DAY 6 — Free Day & Spa (Kyoto)
Meals: B, D
08:00 - Free Morning: Optional shopping in Kyoto downtown.
14:00 - Onsen Spa Experience: Traditional Japanese hot spring bathing ritual.
19:00 - Farewell Dinner: Multi-course seasonal dinner at a riverside restaurant.

DAY 7 — Departure (Kyoto)
Meals: B
Flight: JL 729 KIX-CGK 18:00-23:15
09:00 - Check-out: Private boat ride departure from Hoshinoya.
11:00 - Airport Transfer: Luxury transfer to Kansai International Airport.

INCLUSIONS:
- Business Class Flights (JAL/ANA)
- 6 Nights 5-Star Ryokan Accommodation
- Private Chauffeur throughout the journey
- All exclusive experiences & entrance fees
- Daily Gourmet Breakfast & Dinner
- Shinkansen First Class Pass

EXCLUSIONS:
- Japan Tourist Visa
- Personal expenses & gratuities
- Travel Insurance
- Lunch (unless specified)
        `.trim(),
            },
        ],
    },
};

async function testWebhook() {
    console.log('🚀 Sending mock Tally.so payload to:', WEBHOOK_URL);
    console.log('─'.repeat(60));

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockTallyPayload),
        });

        const data = await response.json();

        console.log('📬 Response Status:', response.status);
        console.log('📦 Response Body:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('─'.repeat(60));
            console.log('✅ Test passed! Itinerary created:');
            console.log('   ID:', data.data.itineraryId);
            console.log('   Preview URL:', data.data.previewUrl);
            console.log('   Status:', data.data.status);
            console.log('');
            console.log('📝 Next steps:');
            console.log('   1. Go to http://localhost:3001/admin to see the queue');
            console.log('   2. Click the itinerary → change status to "published"');
            console.log(`   3. Visit http://localhost:3001${data.data.previewUrl}`);
        }
    } catch (error) {
        console.error('❌ Failed to reach webhook:', error);
        console.log('');
        console.log('Make sure the dev server is running: npm run dev');
    }
}

testWebhook();
