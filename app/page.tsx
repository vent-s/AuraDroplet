'use client';

import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
import { products } from "./data/products";
import { track } from "@/lib/analytics";
import StarterKitStrip from "./components/StarterKitStrip";

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
    age: 56,
    location: "Hudson Valley, NY",
    scent: "Rose Petal",
    title: "Like a florist just left",
    body: "The complimentary vial felt curated, not like a throwaway sample. Soft rose, zero powder."
  },
  {
    name: "Priya M.",
    age: 44,
    location: "San Francisco, CA",
    scent: "Lavender Veil",
    title: "Spa-level calm",
    body: "Diffuser running nightly. Lavender Veil is herbaceous with a citrus lift—no synthetic edge."
  },
  {
    name: "Jack Davis",
    age: 52,
    location: "Fayetteville, AR",
    scent: "Mint Leaf",
    title: "Crisp and clean",
    body: "Mint Leaf reads modern apothecary. Guests ask what hotel we stayed at—cred earned."
  },
  {
    name: "Harper V.",
    age: 47,
    location: "Chicago, IL",
    scent: "Vanilla Ember",
    title: "Warm, not sugary",
    body: "Vanilla Ember layers beautifully with incense cones. Complimentary vial convinced me to subscribe."
  },
  {
    name: "Mila R.",
    age: 61,
    location: "Brooklyn, NY",
    scent: "Ocean Mist",
    title: "Glasshouse on the coast",
    body: "Ocean Mist keeps our loft air light. Notes are saline and mineral, never perfumey."
  },
  {
    name: "Theo K.",
    age: 58,
    location: "Portland, OR",
    scent: "Jasmine No. 02",
    title: "Evening ritual upgraded",
    body: "Started with Jasmine No. 02. Complex, luminous, and somehow smoky. Free vial? Unreal."
  },
  {
    name: "Marin D.",
    age: 63,
    location: "Savannah, GA",
    scent: "Lavender Veil",
    title: "Verified diffuser owner",
    body: "Shipping was fast. Lavender Veil calms the whole house. Already eyeing Rose Petal next."
  },
  {
    name: "Callum P.",
    age: 49,
    location: "Seattle, WA",
    scent: "Mint Leaf",
    title: "Fresh office air",
    body: "Mint Leaf clears stale air in my studio. Complimentary vial came with authenticity card."
  },
  {
    name: "Isla F.",
    age: 54,
    location: "Los Angeles, CA",
    scent: "Ocean Mist",
    title: "Scent concierge is real",
    body: "They followed up to see if Ocean Mist resonated. Swaps honored within a week."
  },
  {
    name: "Julien C.",
    age: 57,
    location: "Boston, MA",
    scent: "Rose Petal",
    title: "Magazine-worthy",
    body: "Between the amber glass bottle and the aroma, the free vial sold me on the full ritual set."
  }
];

const designTokens = {
  surface: {
    heroOffer: "bg-gradient-to-br from-[#1a0c08] via-[#140804] to-[#120806] backdrop-blur-[24px] border border-[rgba(255,255,255,0.12)] shadow-[0_32px_70px_rgba(0,0,0,0.75)]"
  },
  radius: {
    lg: "rounded-[24px]"
  },
  color: {
    accentBg: "bg-[#F3D4B3]",
    accentText: "text-[#1a0c08]"
  },
  spacing: {
    section: "space-y-6"
  }
} as const;

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
  "inline-flex items-center justify-center rounded-full text-sm md:text-base font-semibold uppercase tracking-[0.2em] px-6 py-3 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F2B26]";

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

const metaLabelClass = "text-xs sm:text-sm uppercase tracking-[0.3em] font-semibold text-[#5A5047]";
const sectionHeadingClass = "text-4xl lg:text-[44px] font-light leading-tight text-[var(--ink)]";
const cardShellClass = "rounded-[24px] border border-[var(--mist)] bg-white shadow-[0_18px_48px_rgba(30,24,20,0.08)]";
const supportPhoneNumber = "1-800-407-1910";
const supportEmailAddress = "care@auradroplet.com";
const navLinks = [
  { label: 'Shop Diffuser', href: '#order-section' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Starter Kits', href: '/starter-kits' },
  { label: 'Support', href: '#support' },
];
export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const firstProductRef = useRef<HTMLDivElement | null>(null);
  const quizAutoSelectRef = useRef(false);
  const reviewsScrollRef = useRef<HTMLDivElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [selectedScent, setSelectedScent] = useState<string | null>(null);
  const [quizResponses, setQuizResponses] = useState<Record<string, string>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [hasPassedProductHero, setHasPassedProductHero] = useState(false);
  const [showMobileStickyBar, setShowMobileStickyBar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAllScents, setShowAllScents] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success'>('idle');
  const [canScrollReviewsLeft, setCanScrollReviewsLeft] = useState(false);
  const [canScrollReviewsRight, setCanScrollReviewsRight] = useState(true);
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
  const scentOptionsToDisplay = useMemo(() => {
    if (showAllScents) {
      return freeScentOptions;
    }
    const favorites = freeScentOptions.slice(0, 3);
    if (selectedScent) {
      const active = freeScentOptions.find((option) => option.id === selectedScent);
      if (active && !favorites.some((option) => option.id === active.id)) {
        return [...favorites, active];
      }
    }
    return favorites;
  }, [showAllScents, selectedScent]);
  const primaryCtaLabel = 'Add diffuser + free oil to bag';
  const handlePrimaryCta = () => {
    if (needsVariantUpdate) {
      return;
    }
    if (!selectedScent) {
      handlePricingBannerCta();
      return;
    }
    handleQuickAdd(heroProduct);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || selectedScent) {
      return;
    }
    try {
      const stored = window.localStorage.getItem('selectedFreeScent');
      if (stored && scentVariantLookup[stored]) {
        setSelectedScent(stored);
        return;
      }
    } catch {
      // ignore hydration/localStorage issues
    }
    if (freeScentOptions[0]) {
      setSelectedScent(freeScentOptions[0].id);
    }
  }, [selectedScent]);

  const handleQuizSelect = (questionId: string, value: string) => {
    setQuizResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handlePricingBannerCta = () => {
    const orderSection = document.getElementById('order-section');
    orderSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSelectScent = (scentId: string) => {
    setSelectedScent(scentId);
    try {
      localStorage.setItem('selectedFreeScent', scentId);
    } catch {
      /* ignore persistence */
    }
    const scent = freeScentOptions.find((option) => option.id === scentId);
    if (scent) {
      track('select_content', {
        content_type: 'free_scent',
        item_id: scent.id,
        item_name: scent.name,
      });
    }
  };

  const handleQuickAdd = (item: RitualShopItem) => {
    if (needsVariantUpdate) {
      alert('Please configure the diffuser variant ID before checking out.');
      return;
    }
    if (!selectedScentVariantId) {
      handlePricingBannerCta();
      return;
    }

    const eventItems = [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: 'diffuser',
        quantity: item.qty ?? 1,
      },
    ];

    if (selectedScentDetails) {
      eventItems.push({
        item_id: selectedScentDetails.id,
        item_name: selectedScentDetails.name,
        item_category: 'complimentary_scent',
        quantity: 1,
      });
    }

    track('begin_checkout', {
      checkout_type: 'single_quick_add',
      items: eventItems,
      item_list_id: item.id,
    });

    const url = quickCheckoutUrl({
      quantity: item.qty ?? 1,
      scentVariant: selectedScentVariantId,
    });

    window.location.href = url;
  };

  const updateReviewsScrollButtons = () => {
    if (reviewsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = reviewsScrollRef.current;
      setCanScrollReviewsLeft(scrollLeft > 0);
      setCanScrollReviewsRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollReviews = (direction: 'left' | 'right') => {
    if (reviewsScrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left'
        ? reviewsScrollRef.current.scrollLeft - scrollAmount
        : reviewsScrollRef.current.scrollLeft + scrollAmount;

      reviewsScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      setTimeout(updateReviewsScrollButtons, 300);
    }
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
    if (typeof document === 'undefined') {
      return;
    }
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
    <main className="min-h-screen bg-[#ede0d4]">
      {/* Navigation */}
      <header
        className={`fixed top-0 w-full bg-[#e6ccb2]/95 backdrop-blur-md z-50 border-b border-[#b08968] transition-shadow duration-300 ${showNav ? 'shadow-[0_12px_35px_rgba(127,85,57,0.08)]' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Main Nav Row */}
          <nav className="flex items-center justify-between gap-6 py-2.5">
            <div className="flex items-center gap-5 flex-1">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 text-[#2F2B26] font-semibold px-3 py-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F2B26]"
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="text-[15px]">Menu</span>
              </button>
              <div className="hidden lg:flex items-center gap-6">
                {navLinks.slice(0, 2).map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-[15px] font-medium text-[#3A3834] hover:text-[#8B7355] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <h1 className="text-xl lg:text-2xl font-light tracking-[0.15em] text-[#3A3834] text-center">AURADROPLET</h1>

            <div className="flex items-center gap-4 flex-1 justify-end">
              <div className="hidden lg:flex items-center gap-6">
                {navLinks.slice(2).map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-[15px] font-medium text-[#3A3834] hover:text-[#8B7355] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <a
                href="#order-section"
                className="hidden sm:inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#2F2B26] border border-[#C4BAAB] rounded-full px-5 py-2 shadow-sm bg-white/80 hover:bg-white hover:border-[#8B7355] transition-all"
              >
                <span>View $40 offer</span>
                <span aria-hidden="true" className="text-[11px]">↓</span>
              </a>
            </div>
          </nav>
        </div>
      </header>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="relative ml-auto h-full w-full max-w-xs bg-[#FAF9F7] shadow-[0_25px_60px_rgba(0,0,0,0.35)] px-6 py-6 flex flex-col overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-[#2F2B26]">Menu</p>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#2F2B26]"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="mt-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={`mobile-${link.label}`}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-lg font-medium text-[#2F2B26]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-8 border-t border-[#E4D7C8] pt-6 text-sm text-[#4A4540] space-y-3">
              <p className="font-semibold text-[#2F2B26]">We&apos;re here daily, 9a–8p ET.</p>
              <a href={`tel:${supportPhoneNumber}`} className="flex items-center gap-2 text-[#2F2B26] font-medium">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75v10.5a1.5 1.5 0 001.5 1.5h2.25a1.5 1.5 0 011.5 1.5v.75a.75.75 0 001.125.65l2.745-1.647a1.5 1.5 0 01.765-.208H18a3 3 0 003-3V6.75A1.5 1.5 0 0019.5 5.25h-15A1.5 1.5 0 002.25 6.75z" />
                </svg>
                {supportPhoneNumber}
              </a>
              <a href={`mailto:${supportEmailAddress}`} className="block font-medium text-[#2F2B26] underline underline-offset-4">
                {supportEmailAddress}
              </a>
            </div>
            <div className="mt-auto pt-6">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={getButtonClass('primary', { extra: 'w-full' })}
              >
                Shop diffuser bundle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Clear value, price, CTA, rating */}
      <section className="relative min-h-[80vh] lg:min-h-screen overflow-hidden bg-[#1B1611]">
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
          {/* Subtle gradient - darker bottom half for text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.5) 100%)'
            }}
          />
        </div>

        {/* Hero Content - Simple centered stack over video */}
        <div className="relative h-full flex items-center justify-center px-6 lg:px-8">
          <div
            className={`max-w-2xl mx-auto text-center z-10 transition-opacity duration-700 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              transform: `translateY(${scrollY * 0.25}px)`,
              opacity: Math.max(0, 1 - scrollY * 0.002),
            }}
          >
            {/* 1. Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white leading-tight mb-4" style={{ fontFamily: 'Toledo, Georgia, serif' }}>
              Get More, Get Merry
            </h1>

            {/* 2. Subheadline */}
            <p className="text-xl sm:text-2xl text-white/85 leading-relaxed mb-6" style={{ fontFamily: 'BrandonText, sans-serif', fontWeight: 400 }}>
              Gift the best in bed (and bath)
            </p>

            {/* 3. Single Information Line */}
            <p className="text-base sm:text-lg text-white/90 mb-8 leading-relaxed">
              <span className="font-semibold">Aura Diffuser + Free Premium Oil</span>
              {' '}<span className="text-white/60">·</span>{' '}
              <span className="font-bold text-xl">$40</span>
              {' '}<span className="text-white/60">·</span>{' '}
              <span className="text-[#ddb892]">Save $20</span>
              {' '}<span className="text-white/60">·</span>{' '}
              <span className="text-white/80">★ {aggregateReviewScore.toFixed(1)} ({aggregateReviewCount} reviews)</span>
            </p>

            {/* 4. One Main Button */}
            <button
              type="button"
              onClick={() => document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 bg-[#ddb892] hover:bg-[#f5d5a8] text-[#1a0c08] text-base sm:text-lg font-bold uppercase tracking-wide rounded-full transition-all duration-200 hover:scale-[1.02] shadow-[0_12px_35px_rgba(0,0,0,0.4)] mb-3"
            >
              Add Diffuser + Free Oil to Bag
            </button>

            {/* 5. Tiny Reassurance Line */}
            <p className="text-sm text-white/60">
              Ships in 24 hours · Free returns
            </p>
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

      {/* Best-Selling Starter Kits */}
      <div id="starter-kits">
        <StarterKitStrip />
      </div>

      {/* Free Scent Deal - Choose Your Oil */}
      <section id="order-section" className="bg-gradient-to-b from-[#ede0d4] via-[#e6ccb2] to-[#ede0d4] px-6 lg:px-8 pt-8 md:pt-16 pb-10 md:pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Rich Dark Brown Card */}
          <div
            ref={firstProductRef}
            className="bg-[#7f5539] rounded-[20px] md:rounded-[32px] p-5 md:p-12 shadow-[0_30px_60px_rgba(127,85,57,0.4)]"
          >
            <div className="grid gap-5 md:gap-10 md:grid-cols-[0.95fr_1.05fr] items-center">
              {/* Image Section */}
              <div className="space-y-2 md:space-y-4">
                {/* Label above image */}
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-[#ede0d4] font-medium">
                  Thanksgiving Offer · Cozy Home
                </p>

                {/* Image with cream border - reduced height on mobile */}
                <div className="relative h-44 md:h-96 rounded-[20px] md:rounded-[28px] overflow-hidden border border-[#ede0d4]">
                  <Image
                    src="/AutumnOffer.jpg"
                    alt="Aura Diffuser and fall oils"
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 45vw, 100vw"
                    priority
                  />
                </div>
              </div>

              {/* Text Section */}
              <div
                className="space-y-3 md:space-y-5 text-left"
                style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
              >
                {/* Hero Message - Full opacity cream */}
                <h3 className="text-[22px] sm:text-[28px] md:text-[32px] font-semibold text-[#ede0d4] leading-tight tracking-tight">
                  We&apos;d like to help you discover a scent for autumn.
                </h3>

                <div className="space-y-2 md:space-y-3 pt-1 md:pt-2">
                  {/* Ghost Button */}
                  <a
                    href="/free-scent"
                    className="inline-flex w-full md:w-auto justify-center px-6 md:px-8 py-2.5 md:py-3 bg-[#C65D3B] text-white text-sm md:text-base font-semibold rounded-2xl hover:bg-[#a84d2f] transition-all"
                  >
                    Claim Your Free Scent
                  </a>
                  {/* Fine print - 75% opacity cream */}
                  <p className="text-xs md:text-sm text-[#ede0d4]/75">
                    Ships in 24h · ⭐ {aggregateReviewScore.toFixed(1)} from {aggregateReviewCount} owners
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Reviews */}
      <section className="py-24 bg-gradient-to-b from-[#ede0d4] to-[#e6ccb2] border-t border-[#ddb892]">
        <div className="max-w-4xl mx-auto px-6 lg:px-0">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-[#b08968] mb-3">Verified Ritualists</p>
            <h2 className="text-4xl font-light text-[#7f5539] tracking-tight">What our autumn clientele is saying</h2>
            <p className="text-sm text-[#9c6644] mt-4">
              4.9 average across 1,200+ Aura diffuser owners. Exchanges honored within 14 days.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-y-6 left-10 right-10 border border-[#ddb892]/80 rounded-[32px] pointer-events-none" />

            {/* Left Arrow */}
            {canScrollReviewsLeft && (
              <button
                type="button"
                onClick={() => scrollReviews('left')}
                className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-[#7f5539] text-[#ede0d4] shadow-lg hover:bg-[#9c6644] transition-all"
                aria-label="Scroll reviews left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Right Arrow */}
            {canScrollReviewsRight && (
              <button
                type="button"
                onClick={() => scrollReviews('right')}
                className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-[#7f5539] text-[#ede0d4] shadow-lg hover:bg-[#9c6644] transition-all"
                aria-label="Scroll reviews right"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <div
              ref={reviewsScrollRef}
              onScroll={updateReviewsScrollButtons}
              className="relative overflow-x-auto pb-6 pl-4 snap-x snap-mandatory flex gap-6 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#e6ccb2] to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#e6ccb2] to-transparent" />
              {reviewEntries.map((review, index) => (
                <article
                  key={`${review.name}-${index}`}
                  className="relative shrink-0 w-[320px] h-[360px] bg-[#ede0d4]/95 border border-[#ddb892] rounded-[28px] p-6 shadow-[0_25px_60px_rgba(127,85,57,0.12)] snap-center flex flex-col justify-between"
                  style={{ transform: `translateX(-${index * 40}px)` }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-[#b08968]">Aura Diffuser Owner</p>
                        <p className="text-lg text-[#7f5539] font-light">{review.name} · {review.location}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[#7f5539]">
                        <div className="flex text-[#b08968]">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <svg key={starIndex} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-[#9c6644]">5.0</span>
                      </div>
                    </div>
                    <div className="mb-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#9c6644]">
                      <span>Complimentary scent</span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#b08968' }} />
                      <span>{review.scent}</span>
                    </div>
                    <h3 className="text-xl font-light text-[#7f5539] mb-3 leading-tight">{review.title}</h3>
                    <p className="text-sm text-[#9c6644] leading-relaxed">{review.body}</p>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.35em] text-[#b08968]">
                    Verified purchase · {index + 1}/10
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Meet the Founder */}
      <section id="support" className="bg-gradient-to-b from-[#e6ccb2] to-[#ede0d4] py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-0">
          <div className={`${cardShellClass} px-8 py-10 bg-[#ede0d4]/90`}>
            <div className="text-left space-y-5">
              <p className={`${metaLabelClass} text-[#b08968]`}>Meet the founder</p>
              <h3 className="text-3xl lg:text-4xl font-light text-[#7f5539] leading-tight">Intentional scent, minus the fuss.</h3>
              <ul className="space-y-3 text-sm text-[#4A4540]">
                {[
                  'Built for quiet, all-night use.',
                  'Simple to clean and refill.',
                  'Looks like decor, not a plastic appliance.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#C47A3B]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[#4A4540]">30-day returns · Free scent swap if you don&apos;t love the first one.</p>
              <p className="text-sm text-[#6B6762]">
                Questions? Call <a href={`tel:${supportPhoneNumber}`} className="text-[#C47A3B] underline">{supportPhoneNumber}</a> or email <a href={`mailto:${supportEmailAddress}`} className="text-[#C47A3B] underline">{supportEmailAddress}</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Quiz */}
      <section id="quiz" className="py-20 bg-gradient-to-b from-[#ede0d4] to-[#e6ccb2] border-t border-[#ddb892]">
        <div className="max-w-4xl mx-auto px-6 lg:px-0 text-center space-y-4">
          <h2 className="text-3xl lg:text-4xl font-light text-[#7f5539]">Need help choosing a scent?</h2>
          <p className="text-base text-[#4A4540]">Answer 3 quick questions and we&apos;ll suggest a match.</p>
          {showQuiz && (
            <p className="text-xs uppercase tracking-[0.3em] text-[#9B9792]">
              {answeredCount}/{quizQuestions.length} answered
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowQuiz((prev) => !prev)}
            className={getButtonClass('secondary', { extra: 'px-8 py-2 mx-auto mt-2' })}
          >
            {showQuiz ? 'Hide quiz' : 'Take 1-minute quiz'}
          </button>
        </div>
        {showQuiz && (
          <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
            <div className="space-y-6">
              {quizQuestions.map((question, questionIndex) => (
                <div key={question.id} className="bg-[#ede0d4] border border-[#ddb892] rounded-3xl p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-[#b08968] mb-2">
                    Step {questionIndex + 1} of {quizQuestions.length} · {question.selectionLimit > 1 ? `Choose up to ${question.selectionLimit}` : 'Choose one'}
                  </p>
                  <h3 className="text-2xl font-light text-[#7f5539] mb-4">{question.title}</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {question.options.map((option) => {
                      const isSelected = quizResponses[question.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleQuizSelect(question.id, option.value)}
                          className={`text-left border rounded-2xl px-4 py-3 transition-all ${
                            isSelected ? 'border-[#7f5539] bg-[#e6ccb2] shadow-lg' : 'border-transparent bg-[#e6ccb2]/60'
                          }`}
                        >
                          <p className="font-medium text-[#7f5539]">{option.label}</p>
                          <p className="text-sm text-[#9c6644]">{option.helper}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#7f5539] text-white rounded-3xl p-8 flex flex-col justify-between">
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
                      try {
                        localStorage.setItem('selectedFreeScent', recommendedScent.id);
                      } catch {
                        /* ignore */
                      }
                      document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-center text-sm text-white font-semibold underline underline-offset-4"
                >
                  Apply {recommendedScent?.name ?? recommendedBrand.name} to my order
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-center text-sm text-white/70 underline underline-offset-4"
                >
                  Back to checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#7f5539] text-[#ede0d4] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-light text-2xl mb-4 tracking-[0.15em]">AURADROPLET</h3>
              <p className="text-sm text-[#e6ccb2] leading-relaxed font-light mt-3">
                Questions? Call <a href={`tel:${supportPhoneNumber}`} className="underline underline-offset-4 text-white">{supportPhoneNumber}</a> or email <a href={`mailto:${supportEmailAddress}`} className="underline underline-offset-4 text-white">{supportEmailAddress}</a>.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-[#ede0d4]">Shop</h4>
              <ul className="space-y-3 text-sm text-[#e6ccb2] font-light">
                <li><a href="#" className="hover:text-[#ede0d4] transition-colors">Diffusers</a></li>
                <li><a href="#" className="hover:text-[#ede0d4] transition-colors">Starter Kits</a></li>
                <li><a href="#" className="hover:text-[#ede0d4] transition-colors">Brands</a></li>
                <li><a href="#" className="hover:text-[#ede0d4] transition-colors">Essences</a></li>
                <li><a href="#" className="hover:text-[#ede0d4] transition-colors">Refills</a></li>
                <li><a href="#" className="hover:text-[#ede0d4] transition-colors">Gifts</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-[#ede0d4]">Support</h4>
              <ul className="space-y-3 text-sm text-[#e6ccb2] font-light">
                <li><a href="#" className="hover:text-[#ede0d4] transition-colors">Scent Quiz</a></li>
                <li><a href="#" className="hover:text-[#ede0d4] transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-[#ede0d4] transition-colors">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-[#ede0d4] transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-[#ede0d4] transition-colors">Care Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-[#ede0d4]">Newsletter</h4>
              <p className="text-sm text-[#e6ccb2] mb-4 font-light">1–2 emails/month. Unsubscribe anytime.</p>
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
                  className="flex-1 px-4 py-2.5 bg-[#9c6644] text-white placeholder-[#ddb892] border border-[#b08968] focus:border-[#ddb892] focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className={getButtonClass('primary', { extra: 'px-6 py-2.5' })}
                >
                  Join
                </button>
              </form>
              {newsletterStatus === 'success' && (
                <p className="mt-2 text-sm text-[#e6ccb2] flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#ddb892]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  You&apos;re in! Watch for rituals soon.
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#9c6644] pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#ddb892]">
            <p className="font-light">&copy; 2024 AuraDroplet. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-[#ede0d4] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#ede0d4] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#ede0d4] transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>


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
                onClick={handlePrimaryCta}
                disabled={needsVariantUpdate}
                className={`px-8 py-3 rounded-full text-sm font-semibold tracking-wide uppercase ${
                  needsVariantUpdate ? 'bg-[#D8D3CC] text-[#8B877F] cursor-not-allowed' : 'bg-[#1F1914] text-white hover:bg-[#8B7355]'
                }`}
              >
                {needsVariantUpdate ? 'Set variant' : primaryCtaLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
