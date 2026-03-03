import { ItineraryPayload } from '../types/itinerary';

export const mockItinerary: ItineraryPayload = {
    id: "itn_9x8f7d6s5a4",
    version: "1.0",
    theme: "amazing-black",
    brand: {
        id: "brd_1",
        name: "LuxeTravel Architect",
        tagline: "Curating your dream escapes since 2018",
        primaryColor: "#D4AF37", // Gold
        secondaryColor: "#1A1A1A", // Dark
        logoUrl: "LTA", // Using text for now
        contact: {
            whatsapp: "https://wa.me/6281234567890",
            instagram: "https://instagram.com/",
            website: "https://example.com"
        }
    },
    meta: {
        title: "The Kyoto Zen Experience",
        subtitle: "A Journey into Japanese Serenity",
        durationDays: 7,
        durationNights: 6,
        startDate: "2024-10-15T00:00:00.000Z",
        endDate: "2024-10-21T00:00:00.000Z",
        groupSize: "Private / Max 4",
        price: "IDR 65.000.000",
        priceNote: "per person, twin sharing"
    },
    highlights: [
        { label: "Duration", value: "7 Days" },
        { label: "Group Size", value: "Max 4 Pax" },
        { label: "Hotel", value: "5-Star Ryokan" }
    ],
    itinerarySummary: ["Private Tea Ceremony", "Shinkansen First Class", "Michelin Star Kaiseki"],
    inclusions: [
        "Business Class Flights (JAL/ANA)",
        "6 Nights 5-Star Ryokan Accommodation",
        "Private Chauffeur throughout the journey",
        "All exclusive experiences & entrance fees",
        "Daily Gourmet Breakfast & Dinner"
    ],
    exclusions: [
        "Japan Tourist Visa",
        "Personal expenses & gratuities",
        "Travel Insurance"
    ],
    days: [
        {
            dayNumber: 1,
            date: "Oct 15, 2024",
            location: "Kyoto",
            title: "Arrival & The Art of Welcome",
            summary: "Arrive in Kyoto and settle into your private sanctuary.",
            heroImage: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200",
            activities: [
                {
                    time: "14:00",
                    title: "VIP Airport Transfer",
                    description: "Meet and greet at Kansai International Airport with luxury private transfer to Kyoto."
                },
                {
                    time: "16:00",
                    title: "Check-in: Hoshinoya Kyoto",
                    description: "Arrive at your exclusive riverside ryokan via a private boat ride.",
                    image: "https://images.unsplash.com/photo-1588614959060-4d144f28b207?w=800"
                },
                {
                    time: "19:00",
                    title: "Welcome Kaiseki Dinner",
                    description: "A 10-course traditional dining experience prepared by a master chef."
                }
            ]
        },
        {
            dayNumber: 2,
            date: "Oct 16, 2024",
            location: "Kyoto",
            title: "Temples & Tranquility",
            summary: "Explore the spiritual heart of Japan.",
            heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200",
            activities: [
                {
                    time: "09:00",
                    title: "Private Kinkaku-ji Tour",
                    description: "Early access to the Golden Pavilion before the crowds arrive."
                },
                {
                    time: "13:00",
                    title: "Zen Meditation & Tea",
                    description: "Private session with a Zen monk at a hidden 14th-century temple."
                }
            ]
        }
    ],
    hotels: [
        {
            name: "Hoshinoya Kyoto",
            rating: "5 Star Luxury",
            location: "Arashiyama, Kyoto",
            description: "A meticulously restored century-old riverside property accessible only by boat.",
            imageUrl: "https://images.unsplash.com/photo-1588614959060-4d144f28b207?w=800"
        }
    ]
};
