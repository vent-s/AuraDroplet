'use client';

import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
import { products } from "./data/products";
import { track } from "@/lib/analytics";

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

type Brand = {
  name: string;
  description: string;
  color: string;
  image: string;
  notes: string;
  spaces: string;
  pair: string;
  handle: string;
  structure: {
    top: string;
    heart: string;
    base: string;
  };
};

const brands: Brand[] = [
  {
    name: "Heritage Florals",
    description: "Timeless botanical essences",
    color: "#C4A27F",
    image: "/DiffProductShot.png",
    notes: "Rose • Jasmine • Tuberose",
    spaces: "Living room, dressing table",
    pair: "Rose Petal",
    handle: "heritage",
    structure: {
      top: "Rose Dew",
      heart: "Jasmine Leaf",
      base: "Musk Amber",
    },
  },
  {
    name: "Modern Woods",
    description: "Contemporary forest notes",
    color: "#6B8E7F",
    image: "/DiffProductShot.png",
    notes: "Cedar • Sandalwood • Pine",
    spaces: "Library, study",
    pair: "Mint Leaf",
    handle: "modern",
    structure: {
      top: "Cedar",
      heart: "Sandalwood",
      base: "Smoked Pine",
    },
  },
  {
    name: "Citrus Luxe",
    description: "Bright Mediterranean spirits",
    color: "#E8B85D",
    image: "/DiffProductShot.png",
    notes: "Bergamot • Neroli • Verbena",
    spaces: "Kitchen, entry",
    pair: "Lavender Veil",
    handle: "citrus",
    structure: {
      top: "Neroli",
      heart: "Verbena",
      base: "Cedarwood",
    },
  },
  {
    name: "Ocean Mist",
    description: "Coastal serenity captured",
    color: "#7BA3B0",
    image: "/DiffProductShot.png",
    notes: "Marine • Driftwood • Salt",
    spaces: "Bath, bedroom",
    pair: "Ocean Mist",
    handle: "ocean",
    structure: {
      top: "Sea Spray",
      heart: "Driftwood",
      base: "Mineral Musk",
    },
  },
  {
    name: "Spice & Earth",
    description: "Warm exotic undertones",
    color: "#A67B5B",
    image: "/DiffProductShot.png",
    notes: "Cardamom • Amber • Vetiver",
    spaces: "Dining, lounge",
    pair: "Vanilla Ember",
    handle: "spice",
    structure: {
      top: "Cardamom",
      heart: "Amber Resin",
      base: "Vetiver",
    },
  },
  {
    name: "Zen Garden",
    description: "Pure meditative calm",
    color: "#9CAF88",
    image: "/DiffProductShot.png",
    notes: "Green tea • Bamboo • Rain",
    spaces: "Yoga nook, bedside",
    pair: "Lavender Veil",
    handle: "zen",
    structure: {
      top: "Green Tea",
      heart: "Lotus",
      base: "Fresh Rain",
    },
  },
];

type QuizQuestion = {
  id: string;
  title: string;
  selectionLimit: number;
  options: {
    label: string;
    value: string;
    helper: string;
  }[];
};

const quizQuestions: QuizQuestion[] = [
  {
    id: 'mood',
    title: 'What mood are you setting?',
    selectionLimit: 1,
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
    selectionLimit: 1,
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
    selectionLimit: 1,
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
  compareAtPrice?: string;
  savingsCopy?: string;
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
    compareAtPrice: "$59",
    savingsCopy: "Save 32%",
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
    compareAtPrice: "$72",
    savingsCopy: "Save 30%",
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
    compareAtPrice: "$92",
    savingsCopy: "Save 35%",
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

type ButtonVariant = 'primary' | 'secondary';

const buttonBaseClass =
  "inline-flex items-center justify-center rounded-full text-[11px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.28em] px-6 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F2B26]";

const buttonVariantClassMap: Record<ButtonVariant, string> = {
  primary: "bg-[var(--ink)] text-[var(--paper)] hover:bg-[#463b32]",
  secondary: "border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]",
};

const getButtonClass = (
  variant: ButtonVariant = 'primary',
  options: { disabled?: boolean; extra?: string } = {}
) => {
  const { disabled = false, extra = '' } = options;
  return [
    buttonBaseClass,
    buttonVariantClassMap[variant],
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
};


export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const firstProductRef = useRef<HTMLDivElement | null>(null);
  const quizAutoSelectRef = useRef(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [selectedScent, setSelectedScent] = useState<string | null>(null);
  const [quizResponses, setQuizResponses] = useState<Record<string, string>>({});
  const [bundleSelections, setBundleSelections] = useState<Record<string, string[]>>({});
  const [activeBundle, setActiveBundle] = useState<string | null>(null);
  const [hasPassedProductHero, setHasPassedProductHero] = useState(false);
  const [showMobileStickyBar, setShowMobileStickyBar] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success'>('idle');
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
  const heroProduct = ritualShop[0];
  const heroReview = reviewEntries[0];
  const aggregateReviewScore = 4.8;
  const aggregateReviewCount = 182;
  const recommendedScent = freeScentOptions.find(
    (scent) => scent.name.toLowerCase() === recommendedBrand.pair.toLowerCase()
  ) ?? freeScentOptions[0];

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
        track('deselect_item', {
          item_id: scentId,
          item_list_id: bundleId,
        });
        return { ...prev, [bundleId]: next };
      }
      if (current.length >= limit) {
        track('selection_limit_reached', {
          item_list_id: bundleId,
          attempted_item: scentId,
          limit,
        });
        return prev;
      }
      track('select_item', {
        item_id: scentId,
        item_list_id: bundleId,
        index: current.length + 1,
      });
      return { ...prev, [bundleId]: [...current, scentId] };
    });
  };

const renderScentCard = (scent: FreeScentOption, { variant = 'grid' }: { variant?: 'grid' | 'carousel' } = {}) => {
    const isSelected = selectedScent === scent.id;
    const padding = variant === 'carousel' ? 'p-4' : 'p-5';
    const imageHeight = variant === 'carousel' ? 'h-44' : 'h-52';
    const minWidth = variant === 'carousel' ? 'min-w-[250px]' : '';

    return (
      <button
        type="button"
        key={`${variant}-${scent.id}`}
        onClick={() => {
          setSelectedScent(scent.id);
          try {
            localStorage.setItem('selectedFreeScent', scent.id);
          } catch {
            // ignore persistence issues
          }
          track('select_content', {
            content_type: 'free_scent',
            item_id: scent.id,
            item_name: scent.name,
          });
        }}
        aria-pressed={isSelected}
        className={`group relative text-left bg-white border rounded-[var(--radius-card)] ${padding} ${minWidth} transition-shadow duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amber)] ${
          isSelected ? 'border-[var(--amber)] shadow-[var(--shadow-card)]' : 'border-[var(--mist)] hover:shadow-[var(--shadow-card)]'
        }`}
      >
        <div className={`relative rounded-[var(--radius-card)] overflow-hidden ${imageHeight}`}>
          <Image
            src={scent.image}
            alt={scent.name}
            fill
            sizes="(max-width: 768px) 70vw, (max-width: 1024px) 45vw, 25vw"
            className={`${scent.fit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-500 group-hover:scale-105`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 text-[11px] uppercase tracking-[0.35em] text-white/80">
            {scent.mood}
          </div>
          {isSelected && (
            <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[var(--amber)] text-white flex items-center justify-center text-sm font-semibold">
              ✓
            </div>
          )}
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#8B7355]">Complimentary</p>
              <h4 className="text-2xl font-light text-[var(--ink)]">{scent.name}</h4>
            </div>
            <span
              className={`w-12 h-12 rounded-full border flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.3em] ${
                isSelected ? 'bg-[var(--amber)] border-[var(--amber)] text-white' : 'border-[var(--mist)] text-[#8B877F]'
              }`}
            >
              {isSelected ? 'Set' : 'Tap'}
            </span>
          </div>
          <p className="text-sm italic text-[#5F5B56]">{scent.notes}</p>
          <p className="text-xs text-[#6B6762]">
            {isSelected ? 'Currently selected.' : `Tap to include ${scent.name} in your order.`}
          </p>
        </div>
      </button>
    );
  };

  const handleFreeScentCheckout = () => {
    if (!selectedScent || needsVariantUpdate) {
      return;
    }
    try {
      localStorage.setItem('selectedFreeScent', selectedScent);
    } catch {
      // ignore persistence failures
    }
    if (selectedScentDetails && selectedScentVariantId) {
      track('begin_checkout', {
        checkout_type: 'free_scent_cta',
        items: [
          {
            item_id: 'diffuser',
            item_name: 'Aura Diffuser',
            quantity: 1,
          },
          {
            item_id: selectedScentDetails.id,
            item_name: selectedScentDetails.name,
            item_category: 'complimentary_scent',
            quantity: 1,
          },
        ],
      });
    }
    window.location.href = needsVariantUpdate
      ? '#set-variant'
      : quickCheckoutUrl({ quantity: 1, scentVariant: selectedScentVariantId });
  };

  const handlePricingBannerCta = () => {
    const offerSection = document.getElementById('free-scent-offer');
    offerSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleQuickAdd = (item: RitualShopItem) => {
    if (needsVariantUpdate) {
      alert('Please configure the diffuser variant ID before checking out.');
      return;
    }

    const requiredSelections = item.requiredSelections ?? 0;
    const selections = getBundleSelections(item.id);

    if (requiredSelections > 0 && selections.length < requiredSelections) {
      track('view_item_list', {
        item_list_id: item.id,
        item_list_name: item.name,
      });
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

    const selectionDetails = selections
      .map((scentId) => freeScentOptions.find((scent) => scent.id === scentId))
      .filter((scent): scent is FreeScentOption => Boolean(scent?.variantId));

    const eventItems = [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: 'bundle',
        quantity: item.qty ?? 1,
      },
      ...selectionDetails.map((scent) => ({
        item_id: scent.id,
        item_name: scent.name,
        item_category: 'bundle_scent',
        quantity: 1,
      })),
    ];

    if (selectedScentDetails && selectedScentVariantId) {
      eventItems.push({
        item_id: selectedScentDetails.id,
        item_name: selectedScentDetails.name,
        item_category: 'complimentary_scent',
        quantity: 1,
      });
    }

    track('begin_checkout', {
      checkout_type: requiredSelections > 0 ? 'bundle_quick_add' : 'single_quick_add',
      items: eventItems,
      item_list_id: item.id,
    });

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
      setShowMobileStickyBar(window.scrollY > 100);
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

  useEffect(() => {
    if (
      quizComplete &&
      recommendedScent &&
      !selectedScent &&
      !quizAutoSelectRef.current
    ) {
      quizAutoSelectRef.current = true;
      setSelectedScent(recommendedScent.id);
      localStorage.setItem('selectedFreeScent', recommendedScent.id);
    }
  }, [quizComplete, recommendedScent, selectedScent]);

  useEffect(() => {
    if (!firstProductRef.current) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) {
          return;
        }
        setHasPassedProductHero(!entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    observer.observe(firstProductRef.current);
    return () => observer.disconnect();
  }, []);

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
              className={getButtonClass('primary', { extra: 'lg:hidden px-4 py-2 text-sm tracking-wide' })}
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/80" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center px-6 lg:px-8 pt-20 pb-12 lg:pt-24">
          <div
            className={`max-w-2xl text-center z-10 transition-opacity duration-700 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
              opacity: Math.max(0, 1 - scrollY * 0.002)
            }}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-white/70 mb-4">Free fall scent included</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-6">
              Aura Diffuser. Whisper-quiet sanctuary.
            </h1>
            <p className="text-lg text-white/80 mb-8">
              Transform any room into a sanctuary in seconds with sculpted ceramic, 12-hour runtime, and concierge scent matching.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handlePricingBannerCta}
                className={getButtonClass('primary')}
              >
                Shop Aura Diffuser
              </button>
              <a
                href="#free-scent-offer"
                className={getButtonClass('secondary', {
                  extra: 'border-white/70 text-white hover:bg-white/20 hover:text-white',
                })}
              >
                Get yours today
              </a>
            </div>
            <p className="mt-4 text-sm text-white/80">Ships in 24h · 30-day returns</p>
            <p className="mt-6 text-white/80 text-sm flex items-center justify-center gap-2">
              <span className="flex text-[#F6C892] gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={`hero-star-${i}`}>★</span>
                ))}
              </span>
              <span>Over 500+ happy customers</span>
            </p>
            <p className="mt-6 text-white/70 text-xs uppercase tracking-[0.3em]">Scroll to see autumn offers</p>
          </div>
          <div className="hidden md:flex flex-col gap-3 absolute bottom-12 right-10 bg-white/90 text-[#2F2B26] rounded-3xl p-5 w-72 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
            <div className="relative h-40 rounded-2xl overflow-hidden bg-[#F8F4EE]">
              <Image
                src="/DiffProductShot.png"
                alt="Aura Diffuser on marble plinth"
                fill
                sizes="300px"
                className="object-contain p-4"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#8B7355]">Aura Diffuser</p>
                <p className="text-2xl font-light">$40</p>
              </div>
              <button
                onClick={() => handleQuickAdd(heroProduct)}
                className={getButtonClass('primary', { extra: 'px-4 py-2' })}
              >
                Add to cart
              </button>
            </div>
            <p className="text-xs text-[#6B6762]">Includes free scent · Ships in 24h</p>
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

      {/* Pricing Banner */}
      <section className="bg-[var(--paper)] px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center bg-white border border-[var(--mist)] rounded-[24px] p-8 lg:p-12 shadow-[var(--shadow-soft)]">
            <div className="order-2 lg:order-1 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--amber)] mb-3">
                  Aura Diffuser
                </p>
                <h2 className="text-4xl lg:text-[44px] font-light leading-tight text-[var(--ink)]">
                  Quiet ceramic diffusion for every room.
                </h2>
                <p className="text-base text-[#4A4540] mt-3">
                  Sculpted matte stone, 12-hour runtime, and concierge scent matching bundled as standard.
                </p>
              </div>

              <div>
                <div className="flex items-baseline gap-4">
                  <p className="text-5xl font-light text-[var(--ink)]">${heroProduct.price}</p>
                  {heroProduct.compareAtPrice && (
                    <p className="text-base text-[#8B877F]">was {heroProduct.compareAtPrice}</p>
                  )}
                </div>
                <p className="text-base text-[var(--ink)] mt-2 font-medium">Includes a complimentary fall essence ($28 value).</p>
                <p className="text-sm text-[#5F5B56] mt-1">Free shipping when you add any second vial.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (needsVariantUpdate) {
                      return;
                    }
                    if (selectedScent) {
                      handleQuickAdd(heroProduct);
                      return;
                    }
                    handlePricingBannerCta();
                  }}
                  disabled={needsVariantUpdate}
                  className={getButtonClass('primary', {
                    disabled: needsVariantUpdate,
                    extra: 'w-full sm:flex-1',
                  })}
                >
                  {needsVariantUpdate
                    ? 'Finish store setup'
                    : selectedScent
                    ? 'Add diffuser + free scent'
                    : 'Choose your free scent'}
                </button>
                <a
                  href="#bundle-shop"
                  className={getButtonClass('secondary', { extra: 'w-full sm:flex-1 text-center' })}
                >
                  See bundles
                </a>
              </div>
              <p className="text-xs text-[#6B6762] uppercase tracking-[0.3em]">
                Free shipping on US orders $50+ • 30-day returns
              </p>
              {needsVariantUpdate && (
                <p className="text-xs text-[#8B7355] mt-2">
                  Add your NEXT_PUBLIC_SHOPIFY_VARIANT_ID in .env to enable checkout.
                </p>
              )}

              <div className="rounded-2xl border border-[var(--mist)] bg-white p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-4">
                  <div aria-hidden="true" className="flex text-[var(--amber)] text-lg">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={`aggregate-top-${i}`}>★</span>
                    ))}
                  </div>
                  <div>
                    <p className="text-4xl font-semibold text-[var(--ink)]">
                      {aggregateReviewScore.toFixed(1)}/5
                      <span className="text-base font-normal text-[#6B6762] ml-3">
                        ({aggregateReviewCount} reviews)
                      </span>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#4C4842] italic flex-1">
                  &ldquo;{heroReview.title}&rdquo; — {heroReview.name}, {heroReview.location}
                </p>
                <a href="#reviews" className="text-[11px] uppercase tracking-[0.35em] text-[var(--amber)] font-semibold">
                  Read reviews
                </a>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/5] w-full rounded-[var(--radius-card)] bg-[var(--clay)] border border-[var(--mist)] overflow-hidden">
                <Image
                  src="/DiffProductShot.png"
                  alt="Aura Diffuser on marble plinth"
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 35vw, 80vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  '12-hour runtime',
                  'Auto shut-off glow',
                  'Free fall scent',
                  '2-year warranty',
                ].map((copy) => (
                  <span
                    key={copy}
                    className="px-4 py-1.5 text-xs tracking-[0.25em] uppercase text-[#6B6762] border border-[var(--mist)] rounded-full bg-white/70"
                  >
                    {copy}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 text-xs text-[#6B6762] uppercase tracking-[0.3em]">
            <span>Concierge scent swaps</span>
            <span>•</span>
            <span>Ships in 24h</span>
            <span>•</span>
            <span>Clean, IFRA-compliant oils</span>
          </div>
        </div>
      </section>
      {/* Free Scent Picker */}
      <section id="free-scent-offer" className="relative py-24 bg-gradient-to-br from-[#F8F3ED] via-[#FAF9F7] to-[#F1E7DA] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-20 w-72 h-72 bg-[#E8D7C6]/50 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-[#DADFE6]/50 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] items-center">
            <div className="relative order-1">
              <div className="absolute top-6 left-6 z-10 text-[11px] uppercase tracking-[0.4em] text-white/85 bg-black/35 px-4 py-1 rounded-full backdrop-blur">
                Step 1 of 3
              </div>
              <div className="relative h-[420px] rounded-[36px] overflow-hidden shadow-[0_35px_70px_rgba(33,24,17,0.22)]">
                <Image
                  src="/AutumnOffer.jpg"
                  alt="Free scent offer styling"
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E120B]/80 via-[#2B1C12]/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white/80 text-[11px] uppercase tracking-[0.4em]">
                  Complimentary fall atelier
                </div>
              </div>
            </div>
            <div className="order-2 space-y-5">
              <p className="text-xs tracking-[0.35em] uppercase text-[#D28755]">Complimentary scent concierge</p>
              <div>
                <div className="h-1 w-full bg-[#EADCCE] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--amber)] w-1/3" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-[#6B6762] mt-2">Choose your free fall blend</p>
              </div>
              <h3 className="text-4xl lg:text-5xl font-light text-[var(--ink)] tracking-tight">
                Free fall scent with every diffuser.
              </h3>
              <div className="space-y-3 text-base text-[#4A4540]">
                <p>Pick any fall scent—it&apos;s complimentary with your first diffuser.</p>
                <p>We tuck the vial into the box automatically.</p>
                <p>No code, no minimums, and concierge swaps within 14 days.</p>
              </div>
              <p className="text-sm text-[#6B6762]">Prefer surprises? We&apos;ll send Rose Petal if you skip this step.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="-mx-6 md:hidden">
              <div
                id="free-scent-carousel"
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-2 pr-16"
              >
                {freeScentOptions.map((scent) => (
                  <div key={`carousel-${scent.id}`} className="snap-center">
                    {renderScentCard(scent, { variant: 'carousel' })}
                  </div>
                ))}
              </div>
              <p className="px-6 text-xs text-[#6B6762] uppercase tracking-[0.3em]">Swipe to explore scents →</p>
            </div>
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {freeScentOptions.map((scent) => renderScentCard(scent))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#4A4540]">
              Selected:&nbsp;
              <strong>{selectedScentDetails ? selectedScentDetails.name : 'Rose Petal (default)'}</strong>
              <button
                type="button"
                className="ml-3 text-xs uppercase tracking-[0.3em] text-[#8B7355]"
                onClick={() =>
                  document.getElementById('free-scent-carousel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }
              >
                Change
              </button>
            </p>
            <p className="text-xs text-[#6B6762] uppercase tracking-[0.3em]">Complimentary vial auto-applies at checkout</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleFreeScentCheckout}
              disabled={!selectedScent || needsVariantUpdate}
              className={getButtonClass('primary', {
                disabled: !selectedScent || needsVariantUpdate,
                extra: 'w-full',
              })}
            >
              {needsVariantUpdate ? 'Finish store setup' : selectedScent ? 'Add diffuser + free scent' : 'Select a scent'}
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-[#8B7355] underline underline-offset-4 text-center"
            >
              Need help choosing?
            </button>
          </div>
        </div>
      </section>
      {/* Client Reviews */}
      <section id="reviews" className="py-24 bg-[#F9F4ED] border-t border-[#E9DFD2]">
        <div className="max-w-4xl mx-auto px-6 lg:px-0 space-y-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-[#B77950] mb-3">Verified Ritualists</p>
            <h2 className="text-4xl font-light text-[#2F2B26] tracking-tight">Loved by autumn clientele</h2>
            <p className="text-base text-[#6B6762] mt-3">Free scent swap within 14 days if you don&apos;t love it.</p>
          </div>

          <div className="rounded-3xl border border-[#E9DFD2] bg-white p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div aria-hidden="true" className="flex text-[#C47A3B] text-lg">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <span key={`aggregate-block-${starIndex}`}>★</span>
                  ))}
                </div>
                <p className="text-4xl font-semibold text-[#2F2B26]">
                  {aggregateReviewScore.toFixed(1)}/5
                  <span className="text-base font-normal text-[#6B6762] ml-3">({aggregateReviewCount} reviews)</span>
                </p>
              </div>
              <a
                href="#reviews-list"
                className={getButtonClass('secondary', { extra: 'px-6 py-2 text-[11px]' })}
              >
                Read all reviews
              </a>
            </div>
            <p className="text-base text-[#4C4842] italic">&ldquo;{heroReview.body}&rdquo; — {heroReview.name}, {heroReview.location}</p>
            <div id="reviews-list" className="grid gap-4 md:grid-cols-2">
              {reviewEntries.slice(1, 3).map((review) => (
                <div key={`pull-quote-${review.name}`} className="bg-[#FFFBF5] border border-[#F1E4D6] rounded-2xl p-4 flex flex-col gap-3">
                  <p className="text-sm font-semibold text-[#2F2B26]">{review.title}</p>
                  <p className="text-sm text-[#4C4842] leading-relaxed">{review.body}</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#8B7355]">{review.name} · {review.location}</p>
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-[#8B7355]">
              <a href="#reviews">Read all {aggregateReviewCount} reviews →</a>
            </p>
          </div>
        </div>
      </section>
      {/* Meet the Founder */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-0 space-y-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#8B7355]">Meet the Founder</p>
          <h3 className="text-3xl lg:text-4xl font-light text-[#2F2B26] leading-tight">Intentional scent, minus the fuss.</h3>
          <p className="text-base text-[#4A4540] max-w-2xl mx-auto">I built AuraDroplet so homes could smell curated instead of perfumey—clean oils, concierge guidance, and an easy swap if your first pick isn&apos;t love.</p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              {
                title: 'Quiet hydration',
                copy: '12-hour misting with a whisper-quiet motor and automatic shut-off.',
              },
              {
                title: 'Clean scent',
                copy: 'Premium botanical oils—never fillers or synthetics.',
              },
              {
                title: 'Hassle-free',
                copy: 'Free fall scent plus concierge swaps within 14 days.',
              },
            ].map((pillar) => (
              <div key={pillar.title} className="rounded-[var(--radius-card)] border border-[var(--mist)] bg-[var(--clay)]/60 p-5">
                <p className="text-sm font-semibold text-[#8B7355] uppercase tracking-[0.3em] mb-2">{pillar.title}</p>
                <p className="text-base text-[#4A4540]">{pillar.copy}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-4 pt-2">
            <button
              onClick={() => {
                track('select_promotion', {
                  promotion_id: 'founder_shop_cta',
                  promotion_name: 'Founder block CTA',
                });
                handlePricingBannerCta();
              }}
              className={getButtonClass('primary', { extra: 'px-8 py-3 mt-2' })}
            >
              Shop Aura Diffuser + Free Fall Scent
            </button>
            <p className="text-sm text-[#6B6762]">Ships in 24h • Clean ingredients • Easy returns</p>
          </div>
          <p className="text-xs text-[#6B6762]">Need help? Email <a href="mailto:ashervaughn43@gmail.com" className="text-[#C47A3B] underline">ashervaughn43@gmail.com</a></p>
        </div>
      </section>

      {/* Conversion Shop Strip */}
      <section id="bundle-shop" className="py-24 bg-[#201C18] text-white border-t border-[#362F27]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#F0C9A9] mb-4">Bundle & save</p>
              <h2 className="text-4xl lg:text-5xl font-light leading-tight">Prefer a set? Save up to 30%.</h2>
              <p className="text-base text-white/70 mt-4 max-w-xl">
                Bundle the diffuser with curated seasonal oils and save up to 30% on every order.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 text-[11px] uppercase tracking-[0.35em] text-white/70">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ED9F72]" />Ships in 24h</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#D28755]" />Free exchanges</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#B07454]" />Pay in 4</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ritualShop.map((item, index) => {
              const selections = getBundleSelections(item.id);
              const selectedCount = selections.length;
              const requiredSelections = item.requiredSelections ?? 0;
              const needsSelection = requiredSelections > 0;
              const showChooseOptions = needsSelection;

              return (
                <article
                  key={item.id}
                  ref={index === 0 ? firstProductRef : undefined}
                  className="group relative bg-[#281F1A] border border-white/20 rounded-3xl overflow-hidden flex flex-col"
                  style={{ overflow: activeBundle === item.id && needsSelection ? 'visible' : undefined }}
                >
                  <div className="relative bg-gradient-to-br from-[#3A3430] to-[#281F1A]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={800}
                      height={600}
                      className={`h-56 w-full ${index === 0 ? 'object-contain' : 'object-cover'} group-hover:scale-105 transition-transform duration-700`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 text-[11px] uppercase tracking-[0.35em] bg-white/15 px-4 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                  <div className="flex-1 p-5 flex flex-col">
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/60">{index === 0 ? 'Diffuser' : 'Bundle'}</p>
                      <h3 className="text-2xl font-light mt-2">{item.name}</h3>
                      <p className="text-sm text-white/70 mt-1">{item.subtitle}</p>
                    </div>
                    <div className="mt-auto">
                      <div className="space-y-1 mb-3">
                        <div className="flex items-baseline gap-2">
                          {item.compareAtPrice && (
                            <span className="text-sm text-white/50 line-through">{item.compareAtPrice}</span>
                          )}
                          <p className="text-2xl font-light">{item.price}</p>
                          {item.savingsCopy && (
                            <span className="text-[11px] uppercase tracking-[0.3em] text-[#F5C4A5]">{item.savingsCopy}</span>
                          )}
                        </div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/70">{item.value}</p>
                      </div>
                      <div className="space-y-3">
                        <button
                          type="button"
                          className="text-xs text-white/80 underline underline-offset-4"
                          onClick={() => track('select_content', { content_type: 'bundle_details', item_id: item.id })}
                        >
                          What&apos;s included
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              if (needsVariantUpdate) {
                                return;
                              }
                              if (showChooseOptions) {
                                const willOpen = activeBundle !== item.id;
                                track(willOpen ? 'view_item_list' : 'collapse_item_list', {
                                  item_list_id: item.id,
                                  item_list_name: item.name,
                                });
                                setActiveBundle((prev) =>
                                  prev === item.id ? null : item.id
                                );
                                return;
                              }
                              handleQuickAdd(item);
                            }}
                            aria-expanded={needsSelection ? activeBundle === item.id : undefined}
                            className={getButtonClass('primary', {
                              disabled: needsVariantUpdate,
                              extra: 'w-full gap-2 justify-center',
                            })}
                            disabled={needsVariantUpdate}
                          >
                            {showChooseOptions ? `Choose options (${selectedCount}/${requiredSelections})` : 'Add to cart'}
                            {needsSelection && (
                              <svg
                                className={`w-4 h-4 transition-transform ${activeBundle === item.id ? 'rotate-180' : ''}`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                aria-hidden="true"
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
                                    Pick {requiredSelections} essences to complete this bundle.
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
                                className={getButtonClass('primary', {
                                  disabled: selectedCount < requiredSelections || needsVariantUpdate,
                                  extra: 'w-full mt-4 py-2.5 text-sm',
                                })}
                                disabled={selectedCount < requiredSelections || needsVariantUpdate}
                              >
                                Add to cart with scents
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="text-sm text-white/80 underline underline-offset-4"
                          onClick={() => track('select_content', { content_type: 'details', item_id: item.id })}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-4 text-sm text-white">
            <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Secure checkout via Shop Pay, Apple Pay, and major cards.</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Concierge texts you within 24 hours to confirm your complimentary scent.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Quiz */}
      <section id="quiz" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.35em] text-[#8B7355] mb-3">Two-minute quiz</p>
            <h2 className="text-4xl lg:text-5xl font-light mb-4 text-[#3A3834] tracking-tight">We&apos;ll match you to a palette</h2>
            <p className="text-lg text-[#6B6762] font-light">Answer three quick prompts to see the brand that fits your space.</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-[#9B9792]">
              <p>{answeredCount}/{quizQuestions.length} answered</p>
              <button
                type="button"
                onClick={() => document.getElementById('conversion-shop')?.scrollIntoView({ behavior: 'smooth' })}
                className="underline underline-offset-4 text-[#8B7355]"
              >
                Skip quiz →
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
            <div className="space-y-6">
              {quizQuestions.map((question, questionIndex) => (
                <div key={question.id} className="bg-[#F8F3ED] border border-[#E8E2D8] rounded-3xl p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-[#8B7355] mb-2">
                    Step {questionIndex + 1} of {quizQuestions.length} · {question.selectionLimit > 1 ? `Choose up to ${question.selectionLimit}` : 'Choose one'}
                  </p>
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
                <p className="text-base text-white/80 mb-6">{recommendedBrand.description}</p>
                <div className="space-y-4 text-sm text-white/90">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-white/60 mb-1">Notes</p>
                    <p className="capitalize">{recommendedBrand.notes}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-white/60 mb-1">Best for</p>
                    <p>{recommendedBrand.spaces}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-white/60 mb-2">Top · Heart · Base</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-white">
                      {Object.entries(recommendedBrand.structure).map(([level, note]) => (
                        <div key={level} className="bg-white/10 rounded-xl px-3 py-2 text-center">
                          <p className="uppercase tracking-[0.25em] text-[10px] text-white/60">{level}</p>
                          <p className="text-sm">{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (recommendedScent) {
                      setSelectedScent(recommendedScent.id);
                      localStorage.setItem('selectedFreeScent', recommendedScent.id);
                      if (!needsVariantUpdate) {
                        handleQuickAdd(heroProduct);
                      }
                    }
                  }}
                  disabled={!quizComplete || needsVariantUpdate}
                  className={`w-full text-center py-3 rounded-full text-sm font-semibold uppercase tracking-[0.3em] ${
                    quizComplete && !needsVariantUpdate ? 'bg-white text-[#1F1914]' : 'bg-white/10 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {needsVariantUpdate
                    ? 'Finish store setup'
                    : `Add diffuser + ${recommendedScent?.name ?? recommendedBrand.name}`}
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById('free-scent-offer')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-center text-sm text-white/80 underline underline-offset-4"
                >
                  Browse all scents
                </button>
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
              <p className="text-sm text-[#C4C0BA] mb-4 font-light">1–2 emails/month. Unsubscribe anytime.</p>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!newsletterEmail) {
                    return;
                  }
                  setNewsletterStatus('success');
                  setNewsletterEmail('');
                }}
              >
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                  value={newsletterEmail}
                  onChange={(event) => {
                    setNewsletterEmail(event.target.value);
                    setNewsletterStatus('idle');
                  }}
                  placeholder="you@example.com"
                  className="flex-1 px-4 py-2.5 bg-[#4A4844] text-white placeholder-[#9B9792] border border-[#5A5854] focus:border-[#8B7355] focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className={getButtonClass('primary', { extra: 'px-6 py-2.5' })}
                >
                  Join
                </button>
              </form>
              {newsletterStatus === 'success' && (
                <p className="mt-2 text-sm text-[#C4C0BA] flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#8B7355]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  You&apos;re in! Watch for rituals soon.
                </p>
              )}
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

      {/* Sticky CTA for mobile within first scroll */}
      {showMobileStickyBar && (
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-50 px-4"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto rounded-2xl border border-black/10 bg-[#1F1914] text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] px-4 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">Aura Diffuser</p>
                <p className="text-lg font-semibold">{heroProduct.price} · Free fall scent</p>
              </div>
              <button
                type="button"
                onClick={() => handleQuickAdd(heroProduct)}
                disabled={needsVariantUpdate}
                className={getButtonClass('primary', {
                  disabled: needsVariantUpdate,
                  extra: 'px-5 py-3 text-sm',
                })}
              >
                {needsVariantUpdate ? 'Set variant' : 'Add to cart'}
              </button>
            </div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/70">
              Ships today · Free exchanges · Safe checkout
            </div>
          </div>
        </div>
      )}

      {/* Sticky desktop CTA once the product grid is out of view */}
      {hasPassedProductHero && (
        <div className="hidden lg:block fixed inset-x-0 bottom-0 z-40 px-6 pb-6">
          <div className="mx-auto max-w-4xl rounded-2xl border border-black/10 bg-white/95 backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.25)] px-8 py-5 flex items-center gap-6">
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#2F2B26] uppercase tracking-[0.3em] flex items-center gap-2">
                Aura Diffuser
                <span className="text-xs font-normal text-[#6B6762]">In stock — ships today</span>
              </p>
              <p className="text-xl font-light text-[#2F2B26]">{heroProduct.price} · Free premium scent automatically applies</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuickAdd(heroProduct)}
                disabled={needsVariantUpdate}
                className={`px-8 py-3 rounded-full text-sm font-semibold tracking-wide uppercase ${
                  needsVariantUpdate ? 'bg-[#D8D3CC] text-[#8B877F] cursor-not-allowed' : 'bg-[#1F1914] text-white hover:bg-[#8B7355]'
                }`}
              >
                {needsVariantUpdate ? 'Set variant' : 'Add to cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
