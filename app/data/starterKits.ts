export type StarterKit = {
  name: string;
  brand: string;
  essences: string;
  price: string;
  originalPrice: string;
  savings: string;
  image: string;
  badge?: string;
};

export const starterKits: StarterKit[] = [
  {
    name: "The Essential Ritual",
    brand: "Heritage Florals",
    essences: "Lavender Dreams • Rose Garden • Jasmine Night",
    price: "$98",
    originalPrice: "$115",
    savings: "Save 15%",
    image: "/auradroplet-hero.jpg",
    badge: "BEST SELLER"
  },
  {
    name: "Modern Sanctuary",
    brand: "Modern Woods",
    essences: "Cedar Calm • Sandalwood Serenity • Pine Forest",
    price: "$98",
    originalPrice: "$115",
    savings: "Save 15%",
    image: "/auradroplet-hero.jpg",
    badge: "NEW"
  },
  {
    name: "Coastal Escape",
    brand: "Ocean Mist",
    essences: "Sea Breeze • Marine Notes • Driftwood",
    price: "$98",
    originalPrice: "$115",
    savings: "Save 15%",
    image: "/auradroplet-hero.jpg",
    badge: "POPULAR"
  },
  {
    name: "Citrus Awakening",
    brand: "Citrus Luxe",
    essences: "Bergamot • Lemon Verbena • Orange Blossom",
    price: "$98",
    originalPrice: "$115",
    savings: "Save 15%",
    image: "/auradroplet-hero.jpg",
    badge: ""
  }
];
