'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { products } from "./data/products";

const variantId = process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_ID ?? "gid://shopify/ProductVariant/REPLACE_ME";

type QuickCheckoutOptions = {
  quantity?: number;
  scentVariant?: string;
  addonVariants?: string[];
};

const quickCheckoutUrl = ({ quantity = 1, scentVariant, addonVariants = [] }: QuickCheckoutOptions = {}) => {
  const params = new URLSearchParams({
    variant: variantId,
    qty: quantity.toString(),
  });
  if (scentVariant) {
    params.append("scent", scentVariant);
  }
  addonVariants.forEach((addon) => {
    params.append("addon", addon);
  });
  return `/api/quick-checkout?${params.toString()}`;
};
const needsVariantUpdate = variantId.includes("REPLACE_ME");

const brands = [
  {
    name: "Heritage Florals",
    description: "Timeless botanical essences",
    color: "#C4A27F",
    image: "/DiffProductShot.png",
    notes: "Rose • Jasmine • Tuberose",
    spaces: "Living room, dressing table",
    pair: "Rose Petal",
    handle: "heritage"
  },
  {
    name: "Modern Woods",
    description: "Contemporary forest notes",
    color: "#6B8E7F",
    image: "/DiffProductShot.png",
    notes: "Cedar • Sandalwood • Pine",
    spaces: "Library, study",
    pair: "Mint Leaf",
    handle: "modern"
  },
  {
    name: "Citrus Luxe",
    description: "Bright Mediterranean spirits",
    color: "#E8B85D",
    image: "/DiffProductShot.png",
    notes: "Bergamot • Neroli • Verbena",
    spaces: "Kitchen, entry",
    pair: "Lavender Veil",
    handle: "citrus"
  },
  {
    name: "Ocean Mist",
    description: "Coastal serenity captured",
    color: "#7BA3B0",
    image: "/DiffProductShot.png",
    notes: "Marine • Driftwood • Salt",
    spaces: "Bath, bedroom",
    pair: "Ocean Mist",
    handle: "ocean"
  },
  {
    name: "Spice & Earth",
    description: "Warm exotic undertones",
    color: "#A67B5B",
    image: "/DiffProductShot.png",
    notes: "Cardamom • Amber • Vetiver",
    spaces: "Dining, lounge",
    pair: "Vanilla Ember",
    handle: "spice"
  },
  {
    name: "Zen Garden",
    description: "Pure meditative calm",
    color: "#9CAF88",
    image: "/DiffProductShot.png",
    notes: "Green tea • Bamboo • Rain",
    spaces: "Yoga nook, bedside",
    pair: "Lavender Veil",
    handle: "zen"
  },
];

const quizQuestions = [
  {
    id: 'mood',
    title: 'What mood are you setting?',
    options: [
      { label: 'Blooming & romantic', value: 'heritage', helper: 'Think fresh florals and candlelit dinners.' },
      { label: 'Modern & grounded', value: 'modern', helper: 'Structured woods for studies and libraries.' },
      { label: 'Sunlit & bright', value: 'citrus', helper: 'Spark citrus oils for kitchens and entries.' },
      { label: 'Coastal & airy', value: 'ocean', helper: 'Mineral sea notes for open windows.' }
    ]
  },
  {
    id: 'space',
    title: 'Where will it live?',
    options: [
      { label: 'Bedroom / bath retreat', value: 'zen', helper: 'Soft greens and tea leaves calm evenings.' },
      { label: 'Dining or lounge', value: 'spice', helper: 'Cardamom and amber elevate gatherings.' },
      { label: 'Creative studio', value: 'modern', helper: 'Sharp woods keep focus steady.' },
      { label: 'Living room centerpiece', value: 'heritage', helper: 'Classic florals fill larger spaces.' }
    ]
  },
  {
    id: 'energy',
    title: 'Pick an energy level',
    options: [
      { label: 'Slow mornings', value: 'zen', helper: 'Meditative, quiet diffusion.' },
      { label: 'Entertaining at night', value: 'spice', helper: 'Warm, sensual layers.' },
      { label: 'Everyday uplift', value: 'citrus', helper: 'Bright, approachable notes.' },
      { label: 'Seasonal shift', value: 'ocean', helper: 'Freshened air and salted breeze.' }
    ]
  }
];

const reviewEntries = [
  {
    name: "Lena A.",
    location: "Hudson Valley, NY",
    scent: "Rose Petal",
    title: "Like a florist just left",
    body: "The complimentary vial felt curated, not like a throwaway sample. Soft rose, zero powder."
  },
  {
    name: "Priya M.",
    location: "San Francisco, CA",
    scent: "Lavender Veil",
    title: "Spa-level calm",
    body: "Diffuser running nightly. Lavender Veil is herbaceous with a citrus lift—no synthetic edge."
  },
  {
    name: "Jack Davis",
    location: "Fayetteville, AR",
    scent: "Mint Leaf",
    title: "Crisp and clean",
    body: "Mint Leaf reads modern apothecary. Guests ask what hotel we stayed at—cred earned."
  },
  {
    name: "Harper V.",
    location: "Chicago, IL",
    scent: "Vanilla Ember",
    title: "Warm, not sugary",
    body: "Vanilla Ember layers beautifully with incense cones. Complimentary vial convinced me to subscribe."
  },
  {
    name: "Mila R.",
    location: "Brooklyn, NY",
    scent: "Ocean Mist",
    title: "Glasshouse on the coast",
    body: "Ocean Mist keeps our loft air light. Notes are saline and mineral, never perfumey."
  },
  {
    name: "Theo K.",
    location: "Portland, OR",
    scent: "Jasmine No. 02",
    title: "Evening ritual upgraded",
    body: "Started with Jasmine No. 02. Complex, luminous, and somehow smoky. Free vial? Unreal."
  },
  {
    name: "Marin D.",
    location: "Savannah, GA",
    scent: "Lavender Veil",
    title: "Verified diffuser owner",
    body: "Shipping was fast. Lavender Veil calms the whole house. Already eyeing Rose Petal next."
  },
  {
    name: "Callum P.",
    location: "Seattle, WA",
    scent: "Mint Leaf",
    title: "Fresh office air",
    body: "Mint Leaf clears stale air in my studio. Complimentary vial came with authenticity card."
  },
  {
    name: "Isla F.",
    location: "Los Angeles, CA",
    scent: "Ocean Mist",
    title: "Scent concierge is real",
    body: "They followed up to see if Ocean Mist resonated. Swaps honored within a week."
  },
  {
    name: "Julien C.",
    location: "Boston, MA",
    scent: "Rose Petal",
    title: "Magazine-worthy",
    body: "Between the amber glass bottle and the aroma, the free vial sold me on the full ritual set."
  }
];

type RitualShopItem = {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  value: string;
  image: string;
  badge: string;
  qty?: number;
  requiredSelections?: number;
};

const ritualShop: RitualShopItem[] = [
  {
    id: "diffuser-only",
    name: "Aura Diffuser",
    subtitle: "Matte Sandstone",
    price: "$40",
    value: "Ships with free scent",
    image: "/AuraProduct.jpg",
    badge: "Ready to ship",
    qty: 1
  },
  {
    id: "starter-pairing",
    name: "Starter Pairing",
    subtitle: "Diffuser + 2 additional vials",
    price: "$49.99",
    value: "Best value bundle",
    image: "/2For1.jpg",
    badge: "Most selected",
    qty: 1,
    requiredSelections: 2,
  },
  {
    id: "seasonal-reserve",
    name: "Seasonal Reserve",
    subtitle: "Diffuser + 4 essences",
    price: "$60.00",
    value: "Includes concierge swap",
    image: "/4For1.jpg",
    badge: "Limited October run",
    qty: 1,
    requiredSelections: 4,
  }
];

type FreeScentOptionBase = {
  id: string;
  name: string;
  mood: string;
  notes: string;
  image: string;
  accent: string;
  fit?: 'cover' | 'contain';
  productId: string;
};

type FreeScentOption = FreeScentOptionBase & {
  variantId?: string;
};

const productVariantMap = products.reduce<Record<string, string>>((acc, product) => {
  if (product.variantId) {
    acc[product.id] = product.variantId;
  }
  return acc;
}, {});

const baseFreeScentOptions: FreeScentOptionBase[] = [
  {
    id: "rose",
    name: "Rose Petal",
    mood: "Velvet florals",
    notes: "Rose · Geranium · Musk",
    image: "/RoseProduct.jpg",
    accent: "#C4A27F",
    productId: "rose-petal-oil",
  },
  {
    id: "lavender",
    name: "Lavender Veil",
    mood: "Serene botanical",
    notes: "Lavender · Bergamot · Chamomile",
    image: "/Lavender.jpg",
    accent: "#B8A4C5",
    fit: 'contain',
    productId: "lavender-oil",
  },
  {
    id: "jasmine",
    name: "Jasmine No. 02",
    mood: "Evening bloom",
    notes: "White Florals · Citrus Peel",
    image: "/Jasmine.jpg",
    accent: "#E6C8A0",
    productId: "jasmine-oil",
  },
  {
    id: "mint",
    name: "Mint Leaf",
    mood: "Cool tonic",
    notes: "Peppermint · Basil · Green Tea",
    image: "/Mint.jpg",
    accent: "#95C1AF",
    fit: 'contain',
    productId: "mint-oil",
  },
  {
    id: "vanilla",
    name: "Vanilla Ember",
    mood: "Warm gourmand",
    notes: "Vanilla · Amber · Sandalwood",
    image: "/Vanilla.jpg",
    accent: "#D1A88E",
    fit: 'contain',
    productId: "vanilla-oil",
  },
  {
    id: "ocean",
    name: "Ocean Mist",
    mood: "Coastal calm",
    notes: "Sea Salt · Driftwood · Marine",
    image: "/Ocean.jpg",
    accent: "#8FB7C6",
    productId: "ocean-mist-oil",
  }
];

const freeScentOptions: FreeScentOption[] = baseFreeScentOptions.map((option) => {
  const variantId = productVariantMap[option.productId];
  if (!variantId) {
    console.warn(`Missing Shopify variant ID for scent option "${option.name}" (product id: ${option.productId})`);
  }
  return {
    ...option,
    variantId,
  };
});

const scentVariantLookup = freeScentOptions.reduce<Record<string, string>>((acc, scent) => {
  if (scent.variantId) {
    acc[scent.id] = scent.variantId;
  }
  return acc;
}, {});


export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [selectedScent, setSelectedScent] = useState<string | null>(null);
  const [quizResponses, setQuizResponses] = useState<Record<string, string>>({});
  const [bundleSelections, setBundleSelections] = useState<Record<string, string[]>>({});
  const [activeBundle, setActiveBundle] = useState<string | null>(null);
  const selectedScentDetails = freeScentOptions.find((scent) => scent.id === selectedScent);
  const selectedScentVariantId = selectedScent ? scentVariantLookup[selectedScent] : undefined;
  const quizComplete = quizQuestions.every((question) => quizResponses[question.id]);
  const recommendedHandle = useMemo(() => {
    const scores: Record<string, number> = {};
    Object.values(quizResponses).forEach((value) => {
      scores[value] = (scores[value] || 0) + 1;
    });
    const [topHandle] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0] ?? [];
    return topHandle ?? 'heritage';
  }, [quizResponses]);
  const recommendedBrand = brands.find((brand) => brand.handle === recommendedHandle) ?? brands[0];
  const answeredCount = Object.values(quizResponses).filter(Boolean).length;

  const handleQuizSelect = (questionId: string, value: string) => {
    setQuizResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const getBundleSelections = (bundleId: string) => bundleSelections[bundleId] ?? [];

  const handleBundleScentToggle = (bundleId: string, scentId: string, limit: number) => {
    setBundleSelections((prev) => {
      if (limit <= 0) {
        return prev;
      }
      const current = prev[bundleId] ?? [];
      if (current.includes(scentId)) {
        const next = current.filter((id) => id !== scentId);
        return { ...prev, [bundleId]: next };
      }
      if (current.length >= limit) {
        return prev;
      }
      return { ...prev, [bundleId]: [...current, scentId] };
    });
  };

  const handleQuickAdd = (item: RitualShopItem) => {
    if (needsVariantUpdate) {
      alert('Please configure the diffuser variant ID before checking out.');
      return;
    }

    const requiredSelections = item.requiredSelections ?? 0;
    const selections = getBundleSelections(item.id);

    if (requiredSelections > 0 && selections.length < requiredSelections) {
      setActiveBundle(item.id);
      return;
    }

    const addonVariants = selections
      .map((scentId) => scentVariantLookup[scentId])
      .filter((id): id is string => Boolean(id));

    if (requiredSelections > 0 && addonVariants.length < requiredSelections) {
      alert('One or more selected scents are unavailable right now.');
      return;
    }

    const url = quickCheckoutUrl({
      quantity: item.qty ?? 1,
      scentVariant: selectedScentVariantId,
      addonVariants: Array.from(new Set(addonVariants)),
    });

    setActiveBundle(null);
    window.location.href = url;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowNav(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log('Auto-play prevented:', e));
    }
  }, []);

  useEffect(() => {
    if (selectedScent && !selectedScentVariantId) {
      console.warn(`Missing Shopify variant ID for selected scent: ${selectedScent}`);
    }
  }, [selectedScent, selectedScentVariantId]);

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      {/* Navigation */}
      <header
        className="fixed top-0 w-full bg-[#FAF9F7]/98 backdrop-blur-md z-50 border-b border-[#E8E6E3] transition-opacity duration-500"
        style={{ opacity: showNav ? 1 : 0, pointerEvents: showNav ? 'auto' : 'none' }}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 relative">
            {/* Mobile Shop Button */}
            <a
              href="/shop"
              className="lg:hidden px-4 py-2 bg-[#C4A27F] text-white text-sm font-medium tracking-wide hover:bg-[#8B7355] transition-all duration-300 rounded-sm"
            >
              SHOP
            </a>

            {/* Left Menu - Desktop */}
            <div className="hidden lg:flex items-center space-x-1 flex-1">
              <a href="/shop" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors font-medium">Shop</a>
              <span className="text-[#C4C0BA]">·</span>
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Diffusers</a>
              <span className="text-[#C4C0BA]">·</span>
              <a href="/starter-kits" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Starter Kits</a>
              <span className="text-[#C4C0BA]">·</span>
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Brands</a>
            </div>

            {/* Logo - Centered */}
            <h1 className="text-xl lg:text-2xl font-light tracking-[0.15em] text-[#3A3834] lg:px-8">AURADROPLET</h1>

            {/* Right Menu + Icons */}
            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-end">
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Essences</a>
              <span className="text-[#C4C0BA]">·</span>
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Refills</a>
              <span className="text-[#C4C0BA]">·</span>
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Gifts</a>
            </div>

            {/* Right Icons - Mobile Always Visible */}
            <div className="flex items-center space-x-6 lg:ml-6">
              <button className="text-[#3A3834] hover:text-[#8B7355] transition-colors" aria-label="Account">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button className="text-[#3A3834] hover:text-[#8B7355] transition-colors" aria-label="Search">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="text-[#3A3834] hover:text-[#8B7355] transition-colors relative" aria-label="Cart">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Video Hero */}
      <section className="relative min-h-screen overflow-hidden bg-[#1B1611]">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: `scale(${1 + scrollY * 0.0001})`,
              opacity: Math.max(0.4, 1 - scrollY * 0.001)
            }}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
          >
            <source src="/AuraDroplet.mp4" type="video/mp4" />
          </video>
          {/* Elegant overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center px-6 lg:px-8 pt-24 pb-12">
          <div
            className={`max-w-3xl text-center z-10 transition-opacity duration-700 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
              opacity: Math.max(0, 1 - scrollY * 0.002)
            }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-6">
              Aura Diffuser. Whisper-quiet sanctuary.
            </h1>
            <p className="text-white/70 text-sm uppercase tracking-[0.3em]">Scroll to see autumn offers</p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-white/60">
            <span className="text-xs tracking-widest">SCROLL</span>
            <svg className="w-4 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Free Scent Picker */}
      <section className="relative py-24 bg-gradient-to-br from-[#F8F3ED] via-[#FAF9F7] to-[#F1E7DA] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-20 w-72 h-72 bg-[#E8D7C6]/50 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-[#DADFE6]/50 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          {/* Promotional Hero - Full Width */}
          <div className="grid lg:grid-cols-2 gap-12 mb-14">
            <div className="relative">
              <div className="absolute -inset-5 border border-[#D78752]/50 rounded-[42px]" />
              <div className="absolute inset-5 border border-[#E6B078]/40 rounded-[38px]" />
              <div className="relative h-[430px] rounded-[36px] overflow-hidden shadow-[0_35px_70px_rgba(33,24,17,0.22)]">
                <Image
                  src="/AutumnOffer.jpg"
                  alt="Autumn Atelier Offer"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E120B]/80 via-[#2B1C12]/30 to-transparent" />
                <div className="absolute inset-0 p-10 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between text-[10px] tracking-[0.55em] uppercase text-white/70">
                    <span>Autumn Offer</span>
                    <span>Issue No. 04</span>
                  </div>
                  <div className="text-sm font-light tracking-[0.4em] uppercase text-white/70">
                    <span>The Golden Hour Edit</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-xs tracking-[0.35em] uppercase text-[#D28755] mb-4 font-medium">Autumn ritual incentive</p>
              <h3 className="text-4xl lg:text-5xl font-light text-[#2F2B26] tracking-tight mb-6">
                We&apos;d like to help you discover a scent for autumn.
              </h3>
              <p className="text-lg text-[#4A4540] font-light leading-relaxed mb-6">
                Select one essence to experience, <span className="font-medium text-[#C47A3B]">complimentary</span>. All six scents available{' '}<span aria-hidden="true">·</span>{' '}Through October 31st.
              </p>
              <p className="text-base text-[#5F5B56] font-light mb-4">Take your time choosing below.</p>
              <p className="text-sm text-[#6B6762] font-light">
                If it&apos;s not quite right, exchange it within 14 days—we&apos;re here to help you find your perfect match.
              </p>
            </div>
          </div>

          {/* Scent Grid + Sticky Selection Card */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* Scent Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {freeScentOptions.map((scent) => {
                const isSelected = selectedScent === scent.id;
                return (
                  <button
                    type="button"
                    key={scent.id}
                    onClick={() => setSelectedScent(scent.id)}
                    className={`group relative text-left bg-white/80 backdrop-blur-sm border-2 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(42,37,32,0.12)] ${
                      isSelected ? 'border-[#C4A27F] ring-2 ring-[#C4A27F]/30' : 'border-transparent'
                    }`}
                  >
                    {/* FREE Badge */}
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="bg-gradient-to-br from-[#D4AF37] to-[#C4A27F] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-lg">
                        FREE
                      </div>
                    </div>

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="absolute top-4 left-4 z-10 w-8 h-8 bg-[#C4A27F] rounded-full flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-300">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    <div
                      className="absolute inset-x-6 top-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${scent.accent}, transparent)` }}
                    />
                    <div className="flex flex-col gap-4">
                      <div className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden ${scent.fit === 'contain' ? 'bg-[#F7F3ED]' : ''}`}>
                        <Image
                          src={scent.image}
                          alt={scent.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className={`transition-transform duration-500 group-hover:scale-105 ${scent.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                        />
                        <div className="absolute inset-0 ring-1 ring-black/5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs uppercase tracking-[0.25em] text-[#8B7355]">15 ml</p>
                          <span className="text-xs font-bold tracking-wider text-[#C47A3B]">$0.00</span>
                        </div>
                        <h3 className="text-xl font-light text-[#2F2B26] mb-1">{scent.name}</h3>
                        <p className="text-sm text-[#6B6762] mb-3 font-light italic">{scent.mood}</p>
                        <p className="text-sm text-[#4A4743] font-medium tracking-wide mb-4">{scent.notes}</p>
                        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em]">
                          <span className="inline-flex items-center gap-2 text-[#5F5B56]">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: scent.accent }} />
                            Botanical grade
                          </span>
                          <span className={`font-bold ${isSelected ? 'text-[#C4A27F]' : 'text-[#8B7355]'}`}>
                            {isSelected ? '✓ Selected' : 'Select'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sticky Selection Card */}
            <div className="lg:sticky lg:top-24 bg-white/90 backdrop-blur-lg border-2 border-[#E5E1DB] p-8 rounded-2xl shadow-[0_20px_60px_rgba(58,56,52,0.12)] h-fit">
              <p className="text-sm text-[#8B7355] uppercase tracking-[0.3em] mb-6">Your selection</p>
              {selectedScentDetails ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C4A27F] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#C47A3B] uppercase tracking-wider">Free with diffuser</span>
                    </div>
                    <h3 className="text-2xl font-light text-[#2F2B26] mb-2">{selectedScentDetails.name}</h3>
                    <p className="text-[#5F5B56] text-sm font-light mb-4">{selectedScentDetails.notes}</p>
                  </div>
                  <div className="bg-[#F8F4EE] border border-[#E4D9CC] rounded-xl p-4 text-sm text-[#4A4540]">
                    <p className="font-medium text-[#2F2B26] text-xs uppercase tracking-wider mb-1">What&apos;s included</p>
                    <p>✓ 15ml premium essential oil</p>
                    <p>✓ Complimentary with any diffuser</p>
                    <p>✓ 14-day exchange guarantee</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6 p-6 bg-gradient-to-br from-[#FFF9F0] to-[#F8F4EE] rounded-xl border-2 border-dashed border-[#C4A27F]/50">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#D4AF37] to-[#C4A27F] rounded-full flex items-center justify-center">
                        <span className="text-3xl text-white font-bold">1</span>
                      </div>
                      <p className="text-lg font-medium text-[#2F2B26] mb-2">Select Your Free Scent</p>
                      <p className="text-sm text-[#6B6762]">Choose from 6 botanical blends</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-[#6B6762]">
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C4A27F]" />
                      <span>$28 value — yours free</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C4A27F]" />
                      <span>Complimentary with diffuser purchase</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C4A27F]" />
                      <span>Free exchanges within 14 days</span>
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (selectedScent) {
                    localStorage.setItem('selectedFreeScent', selectedScent);
                  }
                  window.location.href = '/shop';
                }}
                disabled={!selectedScent}
                className={`mt-8 w-full py-4 text-white tracking-[0.2em] text-xs font-semibold uppercase transition-all duration-300 ${
                  selectedScent
                    ? 'bg-[#2F2B26] hover:bg-[#8B7355] cursor-pointer'
                    : 'bg-gray-300 cursor-not-allowed opacity-60'
                }`}
              >
                {selectedScent ? 'Build my ritual →' : 'Select a scent first'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Client Reviews */}
      <section className="py-24 bg-[#F9F4ED] border-t border-[#E9DFD2]">
        <div className="max-w-4xl mx-auto px-6 lg:px-0">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-[#B77950] mb-3">Verified Ritualists</p>
            <h2 className="text-4xl font-light text-[#2F2B26] tracking-tight">What our autumn clientele is saying</h2>
            <p className="text-sm text-[#6B6762] mt-4">
              4.9 average across 1,200+ Aura diffuser owners. Exchanges honored within 14 days.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-y-6 left-10 right-10 border border-[#E2D5C4]/80 rounded-[32px] pointer-events-none" />
            <div className="relative overflow-x-auto pb-6 pl-4 snap-x snap-mandatory flex gap-6">
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F9F4ED] to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F9F4ED] to-transparent" />
              {reviewEntries.map((review, index) => (
                <article
                  key={`${review.name}-${index}`}
                  className="relative shrink-0 w-[320px] h-[360px] bg-white/95 border border-[#E9DFD2] rounded-[28px] p-6 shadow-[0_25px_60px_rgba(42,37,32,0.08)] snap-center flex flex-col justify-between"
                  style={{ transform: `translateX(-${index * 40}px)` }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-[#8B7355]">Aura Diffuser Owner</p>
                        <p className="text-lg text-[#2F2B26] font-light">{review.name} · {review.location}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[#2F2B26]">
                        <div className="flex text-[#C47A3B]">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <svg key={starIndex} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-[#5A544E]">5.0</span>
                      </div>
                    </div>
                    <div className="mb-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#7B776F]">
                      <span>Complimentary scent</span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D28755' }} />
                      <span>{review.scent}</span>
                    </div>
                    <h3 className="text-xl font-light text-[#2F2B26] mb-3 leading-tight">{review.title}</h3>
                    <p className="text-sm text-[#4C4842] leading-relaxed">{review.body}</p>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.35em] text-[#A59E95]">
                    Verified purchase · {index + 1}/10
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Founder */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-0 space-y-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#8B7355]">Meet the Founder</p>
          <h3 className="text-3xl lg:text-4xl font-light text-[#2F2B26] leading-tight">
            Make every home feel like a sanctuary—quiet, hydrated, and beautifully scented.
          </h3>
          <div className="text-left max-w-2xl mx-auto space-y-4">
            <p className="text-[#5A5550] text-base leading-relaxed">
              Hi, I&apos;m Asher, the founder of AuraDroplet. Our mission when making this brand is to give you luxury diffusers that transform your space into the sanctuary you deserve.
            </p>
            <p className="text-[#5A5550] text-base leading-relaxed">
              We&apos;ve helped over 15,000 homes nationwide create peaceful, beautifully scented spaces with our sculpted ceramic design, 12-hour runtime, and whisper-quiet performance.
            </p>
            <p className="text-[#5A5550] text-base leading-relaxed">
              If you ever want to contact me personally, my email is{' '}
              <a href="mailto:ashervaughn43@gmail.com" className="text-[#C47A3B] hover:underline font-medium">
                ashervaughn43@gmail.com
              </a>
              {' '}or reach out to our business email at{' '}
              <a href="mailto:auradroplet@gmail.com" className="text-[#C47A3B] hover:underline font-medium">
                auradroplet@gmail.com
              </a>
            </p>
          </div>
          <div className="bg-[#F8F4EE] border border-[#E4D9CC] rounded-2xl p-5 text-sm text-[#4A4540]">
            <p className="font-medium text-[#2F2B26] uppercase tracking-[0.3em] text-xs">60-day home trial</p>
            <p>Try Aura risk-free. If it doesn&apos;t transform your space, return it free—no forms, no restocking fees.</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#3A3834] justify-center">
            <div className="flex text-[#C47A3B] gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <span>4.9/5 · 15,000+ reviews</span>
          </div>
          <button
            onClick={() => document.getElementById('conversion-shop')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-[#3A3834] border border-[#3A3834] px-6 py-2 rounded-full text-sm hover:bg-[#3A3834] hover:text-white transition-colors"
          >
            View autumn deals ↓
          </button>
          <p className="text-xs text-[#6B6762]">Free returns · 2-year warranty · Free shipping</p>
        </div>
      </section>

      {/* Conversion Shop Strip */}
      <section className="py-24 bg-[#201C18] text-white border-t border-[#362F27]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#F0C9A9] mb-4">Secure your ritual</p>
              <h2 className="text-4xl lg:text-5xl font-light leading-tight">Our Best-Selling Sets</h2>
              <p className="text-base text-white/70 mt-4 max-w-2xl">
                Transform your space with elegantly crafted ceramic diffusers that perform beautifully all day long. Join 15,000+ customers who&apos;ve elevated their home fragrance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 text-[11px] uppercase tracking-[0.35em] text-white/70">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ED9F72]" />Ships in 24h</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#D28755]" />Free exchanges</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#B07454]" />Pay in 4</span>
            </div>
          </div>

          <div id="conversion-shop" className="grid md:grid-cols-3 gap-6">
            {ritualShop.map((item, index) => {
              const selections = getBundleSelections(item.id);
              const selectedCount = selections.length;
              const requiredSelections = item.requiredSelections ?? 0;
              const needsSelection = requiredSelections > 0;

              return (
                <article
                  key={item.id}
                  className="group relative bg-[#281F1A] border border-white/10 rounded-[28px] overflow-hidden flex flex-col"
                  style={{ overflow: activeBundle === item.id && needsSelection ? 'visible' : undefined }}
                >
                  <div className="relative bg-gradient-to-br from-[#3A3430] to-[#281F1A]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={800}
                      height={600}
                      className={`h-64 w-full ${index === 0 ? 'object-contain' : 'object-cover'} group-hover:scale-105 transition-transform duration-700`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 text-[11px] uppercase tracking-[0.35em] bg-white/15 px-4 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/60">{index === 0 ? 'Diffuser' : 'Bundle'}</p>
                      <h3 className="text-2xl font-light mt-3">{item.name}</h3>
                      <p className="text-sm text-white/70 mt-1">{item.subtitle}</p>
                    </div>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-3xl font-light">{item.price}</p>
                          <p className="text-xs uppercase tracking-[0.3em] text-[#ED9F72]">{item.value}</p>
                        </div>
                        <div className="text-right text-xs text-white/60">
                          <p>Complimentary scent</p>
                          <p>2-year warranty</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (needsVariantUpdate) {
                                return;
                              }
                              if (needsSelection) {
                                setActiveBundle((prev) =>
                                  prev === item.id ? null : item.id
                                );
                                return;
                              }
                              handleQuickAdd(item);
                            }}
                            aria-expanded={needsSelection ? activeBundle === item.id : undefined}
                            className={`w-full py-3 rounded-full font-medium tracking-wide transition-colors flex items-center justify-center gap-2 ${
                              needsVariantUpdate
                                ? 'bg-white/40 text-[#201C18]/60 cursor-not-allowed'
                                : 'bg-white text-[#201C18] hover:bg-[#F7E9DE]'
                            }`}
                            disabled={needsVariantUpdate}
                          >
                            {needsSelection
                              ? `Select scents (${selectedCount}/${requiredSelections})`
                              : 'Quick add'}
                            {needsSelection && (
                              <svg
                                className={`w-4 h-4 transition-transform ${
                                  activeBundle === item.id ? 'rotate-180' : ''
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                              </svg>
                            )}
                          </button>
                          {needsSelection && activeBundle === item.id && (
                            <div className="absolute left-0 right-0 top-full z-20 mt-3 bg-white text-[#2F2B26] border border-white/20 rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.35)] p-5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[11px] uppercase tracking-[0.35em] text-[#8B7355]">
                                    Customize your kit
                                  </p>
                                  <p className="text-sm text-[#6B6762] mt-1">
                                    Pick {requiredSelections} color-coded essences to complete this bundle.
                                  </p>
                                </div>
                                <span className="text-xs font-semibold text-[#2F2B26] bg-[#F8F4EE] px-2 py-1 rounded-full">
                                  {selectedCount}/{requiredSelections} selected
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-4">
                                {freeScentOptions.map((scent) => {
                                  const isSelected = selections.includes(scent.id);
                                  const limitReached = selectedCount >= requiredSelections;
                                  const disableSelect = !isSelected && (limitReached || !scent.variantId);

                                  return (
                                    <button
                                      key={scent.id}
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        handleBundleScentToggle(item.id, scent.id, requiredSelections);
                                      }}
                                      disabled={disableSelect}
                                      className={`text-left p-3 rounded-xl border transition-all ${
                                        isSelected
                                          ? 'bg-[#2F2B26] text-white border-[#2F2B26]'
                                          : 'bg-[#F8F4EE] text-[#2F2B26] border-transparent hover:border-[#C4A27F]'
                                      } ${disableSelect ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                      <span className="block text-sm font-medium">{scent.name}</span>
                                      <span className="block text-[11px] uppercase tracking-[0.25em] text-[#6B6762] mt-1">
                                        {scent.notes}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                              <p className="mt-4 text-xs text-[#6B6762]">
                                {selectedCount < requiredSelections
                                  ? `Choose ${requiredSelections - selectedCount} more ${requiredSelections - selectedCount === 1 ? 'scent' : 'scents'} to unlock checkout.`
                                  : 'All set — lock in your bundle below.'}
                              </p>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  handleQuickAdd(item);
                                }}
                                className="mt-4 w-full py-2.5 rounded-full bg-[#2F2B26] text-white text-sm font-medium tracking-wide hover:bg-[#8B7355] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={selectedCount < requiredSelections || needsVariantUpdate}
                              >
                                Confirm & checkout
                              </button>
                            </div>
                          )}
                        </div>
                        <button className="px-6 py-3 rounded-full border border-white/30 text-white text-sm tracking-wide hover:bg-white/10">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col lg:flex-row items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Secure checkout via Shop Pay, Apple Pay, and major cards.
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Concierge texts you within 24 hours to confirm your complimentary scent.
            </div>
          </div>
        </div>
      </section>

      {/* Brand Quiz */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.35em] text-[#8B7355] mb-3">Two-minute quiz</p>
            <h2 className="text-4xl lg:text-5xl font-light mb-4 text-[#3A3834] tracking-tight">We&apos;ll match you to a palette</h2>
            <p className="text-lg text-[#6B6762] font-light">Answer three quick prompts to see the brand that fits your space.</p>
            <p className="text-sm text-[#9B9792] mt-3">{answeredCount}/{quizQuestions.length} answered</p>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
            <div className="space-y-6">
              {quizQuestions.map((question, questionIndex) => (
                <div key={question.id} className="bg-[#F8F3ED] border border-[#E8E2D8] rounded-3xl p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-[#8B7355] mb-2">Step {questionIndex + 1}</p>
                  <h3 className="text-2xl font-light text-[#2F2B26] mb-4">{question.title}</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {question.options.map((option) => {
                      const isSelected = quizResponses[question.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleQuizSelect(question.id, option.value)}
                          className={`text-left border rounded-2xl px-4 py-3 transition-all ${
                            isSelected ? 'border-[#3A3834] bg-white shadow-lg' : 'border-transparent bg-white/60'
                          }`}
                        >
                          <p className="font-medium text-[#2F2B26]">{option.label}</p>
                          <p className="text-sm text-[#6B6762]">{option.helper}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#1F1914] text-white rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-3">Recommendation</p>
                <h3 className="text-4xl font-light mb-2">{recommendedBrand.name}</h3>
                <p className="text-sm text-white/70 mb-6">{recommendedBrand.description}</p>
                <div className="space-y-4 text-sm text-white/80">
                  <div>
                    <p className="uppercase tracking-[0.3em] text-xs text-white/50 mb-1">Notes</p>
                    <p>{recommendedBrand.notes}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.3em] text-xs text-white/50 mb-1">Best for</p>
                    <p>{recommendedBrand.spaces}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.3em] text-xs text-white/50 mb-1">Pairs with</p>
                    <p>{recommendedBrand.pair}</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/starter-kits"
                  className={`w-full text-center py-3 rounded-full uppercase tracking-[0.3em] text-xs ${quizComplete ? 'bg-white text-[#1F1914]' : 'bg-white/20 text-white/60 pointer-events-none'}`}
                >
                  {quizComplete ? 'Shop this palette' : 'Answer all steps'}
                </Link>
                <a href="#conversion-shop" className="text-center text-sm text-white/70 underline underline-offset-4">
                  Browse all collections
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3A3834] text-[#E8E6E3] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-light text-2xl mb-4 tracking-[0.15em]">AURADROPLET</h3>
              <p className="text-sm text-[#C4C0BA] leading-relaxed font-light">
                Fragrance, considered. Transform your space into a sanctuary with our curated collection of diffusers and essences.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-white">Shop</h4>
              <ul className="space-y-3 text-sm text-[#C4C0BA] font-light">
                <li><a href="#" className="hover:text-white transition-colors">Diffusers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Starter Kits</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Brands</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Essences</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refills</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gifts</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-white">Support</h4>
              <ul className="space-y-3 text-sm text-[#C4C0BA] font-light">
                <li><a href="#" className="hover:text-white transition-colors">Scent Quiz</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Care Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-white">Newsletter</h4>
              <p className="text-sm text-[#C4C0BA] mb-4 font-light">Join our community for exclusive rituals and offers.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2.5 bg-[#4A4844] text-white placeholder-[#9B9792] border border-[#5A5854] focus:border-[#8B7355] focus:outline-none transition-colors"
                />
                <button className="px-6 py-2.5 bg-[#8B7355] hover:bg-[#A08669] text-white font-medium transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-[#4A4844] pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#9B9792]">
            <p className="font-light">&copy; 2024 AuraDroplet. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky mobile checkout CTA - only display once a complimentary scent is selected */}
      {selectedScent && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50">
          <div className="mx-4 mb-4 rounded-2xl border border-black/10 bg-white/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.2)] px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#2F2B26]">Claim diffuser + free scent</p>
              <p className="text-xs text-[#6B6762]">Ships in 48h · Shop Pay & Apple Pay</p>
            </div>
            <a
              href={needsVariantUpdate ? '#set-variant' : quickCheckoutUrl({ quantity: 1, scentVariant: selectedScentVariantId })}
              className={`px-4 py-2 rounded-full text-sm font-semibold tracking-wide ${needsVariantUpdate ? 'bg-[#CFCBC5] text-[#8B877F] pointer-events-none' : 'bg-[#2F2B26] text-white hover:bg-[#8B7355]'}`}
            >
              Checkout
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
