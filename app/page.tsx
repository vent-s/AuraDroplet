'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const variantId = process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_ID ?? "gid://shopify/ProductVariant/REPLACE_ME";
const baseCheckoutUrl = `/api/quick-checkout?variant=${encodeURIComponent(variantId)}`;
const quickCheckoutUrl = (quantity = 1) => `${baseCheckoutUrl}&qty=${quantity}`;
const needsVariantUpdate = variantId.includes("REPLACE_ME");

const brands = [
  {
    name: "Heritage Florals",
    description: "Timeless botanical essences",
    color: "#C4A27F",
    image: "/auradroplet-hero.jpg"
  },
  {
    name: "Modern Woods",
    description: "Contemporary forest notes",
    color: "#6B8E7F",
    image: "/auradroplet-hero.jpg"
  },
  {
    name: "Citrus Luxe",
    description: "Bright Mediterranean spirits",
    color: "#E8B85D",
    image: "/auradroplet-hero.jpg"
  },
  {
    name: "Ocean Mist",
    description: "Coastal serenity captured",
    color: "#7BA3B0",
    image: "/auradroplet-hero.jpg"
  },
  {
    name: "Spice & Earth",
    description: "Warm exotic undertones",
    color: "#A67B5B",
    image: "/auradroplet-hero.jpg"
  },
  {
    name: "Zen Garden",
    description: "Pure meditative calm",
    color: "#9CAF88",
    image: "/auradroplet-hero.jpg"
  },
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
    name: "Noah G.",
    location: "Austin, TX",
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

const ritualShop = [
  {
    name: "Aura Diffuser",
    subtitle: "Matte Sandstone",
    price: "$189",
    value: "Ships with free scent",
    image: "/auradroplet-hero.jpg",
    badge: "Ready to ship",
    qty: 1
  },
  {
    name: "Starter Pairing",
    subtitle: "Diffuser + 2 additional vials",
    price: "$229",
    value: "Save $27 as a bundle",
    image: "/bedshot.jpg",
    badge: "Most selected",
    qty: 1
  },
  {
    name: "Seasonal Reserve",
    subtitle: "Diffuser + 4 essences",
    price: "$289",
    value: "Includes concierge swap",
    image: "/AutumnOffer.jpg",
    badge: "Limited October run",
    qty: 1
  }
];

type FreeScentOption = {
  id: string;
  name: string;
  mood: string;
  notes: string;
  image: string;
  accent: string;
  fit?: 'cover' | 'contain';
};

const freeScentOptions: FreeScentOption[] = [
  {
    id: "rose",
    name: "Rose Petal",
    mood: "Velvet florals",
    notes: "Rose · Geranium · Musk",
    image: "/RoseProduct.jpg",
    accent: "#C4A27F"
  },
  {
    id: "lavender",
    name: "Lavender Veil",
    mood: "Serene botanical",
    notes: "Lavender · Bergamot · Chamomile",
    image: "/Lavender.jpg",
    accent: "#B8A4C5",
    fit: 'contain'
  },
  {
    id: "jasmine",
    name: "Jasmine No. 02",
    mood: "Evening bloom",
    notes: "White Florals · Citrus Peel",
    image: "/Jasmine.jpg",
    accent: "#E6C8A0"
  },
  {
    id: "mint",
    name: "Mint Leaf",
    mood: "Cool tonic",
    notes: "Peppermint · Basil · Green Tea",
    image: "/Mint.jpg",
    accent: "#95C1AF",
    fit: 'contain'
  },
  {
    id: "vanilla",
    name: "Vanilla Ember",
    mood: "Warm gourmand",
    notes: "Vanilla · Amber · Sandalwood",
    image: "/vanilla.jpg",
    accent: "#D1A88E",
    fit: 'contain'
  },
  {
    id: "ocean",
    name: "Ocean Mist",
    mood: "Coastal calm",
    notes: "Sea Salt · Driftwood · Marine",
    image: "/Ocean.jpg",
    accent: "#8FB7C6"
  }
];


export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [selectedScent, setSelectedScent] = useState<string | null>(null);
  const selectedScentDetails = freeScentOptions.find((scent) => scent.id === selectedScent);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log('Auto-play prevented:', e));
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-[#FAF9F7]/98 backdrop-blur-md z-50 border-b border-[#E8E6E3]">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Diffusers</a>
              <span className="text-[#C4C0BA]">·</span>
              <a href="/starter-kits" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Starter Kits</a>
              <span className="text-[#C4C0BA]">·</span>
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Brands</a>
              <span className="text-[#C4C0BA]">·</span>
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Essences</a>
              <span className="text-[#C4C0BA]">·</span>
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Refills</a>
              <span className="text-[#C4C0BA]">·</span>
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Gifts</a>
            </div>

            {/* Logo */}
            <h1 className="text-2xl lg:absolute lg:left-1/2 lg:-translate-x-1/2 font-light tracking-[0.15em] text-[#3A3834]">AURADROPLET</h1>

            {/* Right Icons */}
            <div className="flex items-center space-x-6">
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
      <section className="relative h-screen mt-20 overflow-hidden bg-[#2A2520]">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center px-6 lg:px-8">
          <div
            className="max-w-4xl text-center z-10"
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
              opacity: Math.max(0, 1 - scrollY * 0.002)
            }}
          >
            <span className="inline-block text-xs font-medium tracking-[0.3em] mb-6 text-white/70 uppercase animate-fade-in">
              Fragrance, Considered
            </span>
            <h1 className="text-5xl lg:text-7xl xl:text-8xl font-light mb-8 leading-[1.05] tracking-tight text-white animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Start with the<br />Aura Diffuser
            </h1>
            <p className="text-lg lg:text-xl mb-12 text-white/90 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Transform your space into a sanctuary. Choose your finish, discover your brand, curate your ritual.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <a
                href={needsVariantUpdate ? '#set-variant' : quickCheckoutUrl(1)}
                className={`luxury-btn-primary px-10 py-4 text-center bg-white text-[#3A3834] transition-all duration-300 font-medium tracking-wide ${needsVariantUpdate ? 'opacity-60 pointer-events-none' : 'hover:bg-[#F5F3F0]'}`}
              >
                Build Your Ritual
              </a>
              <a
                href="#conversion-shop"
                className="luxury-btn-secondary px-10 py-4 text-center bg-transparent text-white border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300 font-medium tracking-wide"
              >
                Shop Diffuser
              </a>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4 text-[11px] uppercase tracking-[0.35em] text-white/70">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white" /> Ships in 48h</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/70" /> Shop Pay + Apple Pay</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/50" /> 14-day scent swap</span>
            </div>

            {/* Trust bar */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-white/60 font-light">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                30-night trial
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                </svg>
                Free returns
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                2-year warranty
              </span>
            </div>
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
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 mb-14">
            <div className="space-y-10">
              <div className="relative">
                <div className="absolute -inset-5 border border-[#D78752]/50 rounded-[42px]" />
                <div className="absolute inset-5 border border-[#E6B078]/40 rounded-[38px]" />
                <div className="relative h-[430px] rounded-[36px] overflow-hidden shadow-[0_35px_70px_rgba(33,24,17,0.22)]">
                  <Image
                    src="/AutumnOffer.jpg"
                    alt="Autumn Atelier Offer"
                    fill
                    className="object-cover"
                    priority
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

              <div>
                <p className="text-xs tracking-[0.35em] uppercase text-[#D28755] mb-4 font-medium">Autumn ritual incentive</p>
                <h3 className="text-4xl lg:text-5xl font-light text-[#2F2B26] tracking-tight mb-6">
                  We’d like to help you discover a scent for autumn.
                </h3>
                <p className="text-lg text-[#4A4540] font-light leading-relaxed mb-6">
                  Select one essence to experience, complimentary. All six scents available{' '}<span aria-hidden="true">·</span>{' '}Through October 31st.
                </p>
                <p className="text-base text-[#5F5B56] font-light mb-4">Take your time choosing below.</p>
                <p className="text-sm text-[#6B6762] font-light">
                  If it’s not quite right, exchange it within 14 days—we’re here to help you find your perfect match.
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg border border-[#E5E1DB] p-6 rounded-2xl shadow-[0_20px_60px_rgba(58,56,52,0.07)]">
              <p className="text-sm text-[#8B7355] uppercase tracking-[0.3em] mb-4">Your selection</p>
              {selectedScentDetails ? (
                <div>
                  <h3 className="text-2xl font-light text-[#2F2B26] mb-2">{selectedScentDetails.name}</h3>
                  <p className="text-[#5F5B56] text-sm font-light mb-6">{selectedScentDetails.notes}</p>
                  <div className="flex items-center gap-3 text-xs text-[#6B6762]">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1ECE4] text-[#8B7355]">
                      <span className="block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedScentDetails.accent }} />
                      complimentary
                    </span>
                    <span>Added to cart at checkout</span>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-light text-[#2F2B26] mb-2">Choose one aroma</h3>
                  <p className="text-[#5F5B56] text-sm font-light mb-6">
                    Tap a scent below to reserve it. You can always swap before checking out.
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#6B6762]">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-dashed border-[#C4A27F]/50 text-[#8B7355]">
                      <span className="block w-1.5 h-1.5 rounded-full bg-[#C4A27F]" />
                      1/1 available
                    </span>
                    <span>Complimentary with diffuser</span>
                  </div>
                </div>
              )}

              <button
                className="mt-8 w-full py-4 bg-[#2F2B26] text-white tracking-[0.2em] text-xs font-semibold uppercase hover:bg-[#8B7355] transition-colors"
              >
                Build my ritual
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeScentOptions.map((scent) => {
              const isSelected = selectedScent === scent.id;
              return (
                <button
                  type="button"
                  key={scent.id}
                  onClick={() => setSelectedScent(scent.id)}
                  className={`group relative text-left bg-white/80 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(42,37,32,0.12)] ${
                    isSelected ? 'border-[#2F2B26]' : 'border-transparent'
                  }`}
                >
                  <div
                    className="absolute inset-x-6 top-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${scent.accent}, transparent)` }}
                  />
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className={`relative w-full lg:w-40 aspect-[2/3] rounded-xl overflow-hidden ${scent.fit === 'contain' ? 'bg-[#F7F3ED]' : ''}`}>
                      <Image
                        src={scent.image}
                        alt={scent.name}
                        fill
                        className={`transition-transform duration-500 group-hover:scale-105 ${scent.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                      />
                      <div className="absolute inset-0 ring-1 ring-black/5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-[#8B7355]">15 ml</p>
                        <span className="text-[11px] font-medium tracking-[0.25em] text-[#7A756F]">Complimentary</span>
                      </div>
                      <h3 className="text-xl font-light text-[#2F2B26] mb-1">{scent.name}</h3>
                      <p className="text-sm text-[#6B6762] mb-4 font-light">{scent.mood}</p>
                      <p className="text-sm text-[#4A4743] font-medium tracking-wide mb-6">{scent.notes}</p>
                      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em]">
                        <span className="inline-flex items-center gap-2 text-[#5F5B56]">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: scent.accent }} />
                          Botanical grade
                        </span>
                        <span className={isSelected ? 'text-[#2F2B26]' : 'text-[#8B7355]'}>
                          {isSelected ? 'Selected' : 'Select scent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
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

      {/* Conversion Shop Strip */}
      <section className="py-24 bg-[#201C18] text-white border-t border-[#362F27]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#F0C9A9] mb-4">Secure your ritual</p>
              <h2 className="text-4xl lg:text-5xl font-light leading-tight">High-converting sets, ready for checkout</h2>
              <p className="text-base text-white/70 mt-4 max-w-2xl">
                Every option below includes the complimentary autumn scent plus 2-day processing, 14-day scent exchanges, and our concierge follow-up. Tap to lock your choice and jump straight to checkout.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 text-[11px] uppercase tracking-[0.35em] text-white/70">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ED9F72]" />Ships in 24h</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#D28755]" />Free exchanges</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#B07454]" />Pay in 4</span>
            </div>
          </div>

          <div id="conversion-shop" className="grid md:grid-cols-3 gap-6">
            {ritualShop.map((item, index) => (
              <article
                key={item.name}
                className="group relative bg-[#281F1A] border border-white/10 rounded-[28px] overflow-hidden flex flex-col"
              >
                <div className="relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={800}
                    height={600}
                    className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-700"
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
                      <a
                        href={needsVariantUpdate ? '#set-variant' : quickCheckoutUrl(item.qty ?? 1)}
                        className={`flex-1 py-3 rounded-full text-center font-medium tracking-wide ${needsVariantUpdate ? 'bg-white/40 text-[#201C18]/60 pointer-events-none' : 'bg-white text-[#201C18] hover:bg-[#F7E9DE] transition-colors'}`}
                      >
                        Quick add
                      </a>
                      <button className="px-6 py-3 rounded-full border border-white/30 text-white text-sm tracking-wide hover:bg-white/10">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
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

      {/* How It Works */}
      <section className="py-24 bg-[#FAF9F7]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light mb-4 text-[#3A3834] tracking-tight">How It Works</h2>
            <p className="text-lg text-[#6B6762] font-light">Three simple steps to your perfect ritual</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="mb-6 relative">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#8B7355]/10 flex items-center justify-center text-[#8B7355] font-light text-2xl group-hover:bg-[#8B7355] group-hover:text-white transition-all duration-300">
                  1
                </div>
              </div>
              <h3 className="text-xl font-medium mb-3 text-[#3A3834]">Choose Your Diffuser</h3>
              <p className="text-[#6B6762] leading-relaxed font-light">
                Select from our curated finishes. Sleek ceramic, warm wood, or modern matte—designed to elevate any space.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="mb-6 relative">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#8B7355]/10 flex items-center justify-center text-[#8B7355] font-light text-2xl group-hover:bg-[#8B7355] group-hover:text-white transition-all duration-300">
                  2
                </div>
              </div>
              <h3 className="text-xl font-medium mb-3 text-[#3A3834]">Pick Your Brand</h3>
              <p className="text-[#6B6762] leading-relaxed font-light">
                Discover heritage florals, modern woods, or coastal mist. Each brand tells a story through scent.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="mb-6 relative">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#8B7355]/10 flex items-center justify-center text-[#8B7355] font-light text-2xl group-hover:bg-[#8B7355] group-hover:text-white transition-all duration-300">
                  3
                </div>
              </div>
              <h3 className="text-xl font-medium mb-3 text-[#3A3834]">Add Your Essences</h3>
              <p className="text-[#6B6762] leading-relaxed font-light">
                Curate 2-3 signature scents. Save 15% when you build a complete starter kit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Showcase */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light mb-4 text-[#3A3834] tracking-tight">Explore Brands</h2>
            <p className="text-lg text-[#6B6762] font-light">Each with its own palette, philosophy, and presence</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {brands.map((brand, index) => (
              <div
                key={index}
                className="group cursor-pointer relative overflow-hidden rounded-lg aspect-square"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40" style={{ backgroundColor: `${brand.color}20` }} />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="transform group-hover:-translate-y-2 transition-transform duration-300">
                    <h3 className="text-2xl font-medium mb-2 text-[#3A3834]">{brand.name}</h3>
                    <p className="text-sm text-[#6B6762] font-light mb-4">{brand.description}</p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: brand.color }}>
                      Discover
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0" style={{ backgroundColor: brand.color, opacity: 0.1 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Starter Kits Teaser */}
      <section className="py-24 bg-[#FAF9F7]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#8B7355] mb-4">Starter Kits</p>
          <h2 className="text-4xl lg:text-5xl font-light mb-4 text-[#3A3834] tracking-tight">Complete rituals, curated for you</h2>
          <p className="text-lg text-[#6B6762] font-light mb-8">Save 15% when you bundle the diffuser with your first trio of essences.</p>
          <Link
            href="/starter-kits"
            className="inline-flex items-center gap-2 px-10 py-4 border-2 border-[#3A3834] text-[#3A3834] hover:bg-[#3A3834] hover:text-white font-medium tracking-wide transition-all duration-300"
          >
            Explore starter kits
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
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

      {/* Sticky mobile checkout CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50">
        <div className="mx-4 mb-4 rounded-2xl border border-black/10 bg-white/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.2)] px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#2F2B26]">Claim diffuser + free scent</p>
            <p className="text-xs text-[#6B6762]">Ships in 48h · Shop Pay & Apple Pay</p>
          </div>
          <a
            href={needsVariantUpdate ? '#set-variant' : quickCheckoutUrl(1)}
            className={`px-4 py-2 rounded-full text-sm font-semibold tracking-wide ${needsVariantUpdate ? 'bg-[#CFCBC5] text-[#8B877F] pointer-events-none' : 'bg-[#2F2B26] text-white hover:bg-[#8B7355]'}`}
          >
            Checkout
          </a>
        </div>
      </div>
    </main>
  );
}
