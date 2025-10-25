'use client';

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

const variantId = process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_ID ?? "gid://shopify/ProductVariant/REPLACE_ME";
const checkoutUrl = `/api/quick-checkout?variant=${encodeURIComponent(variantId)}&qty=1`;
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

const starterKits = [
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
  },
];


export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

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
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Starter Kits</a>
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
              <button className="luxury-btn-primary px-10 py-4 bg-white text-[#3A3834] hover:bg-[#F5F3F0] transition-all duration-300 font-medium tracking-wide">
                Build Your Ritual
              </button>
              <button className="luxury-btn-secondary px-10 py-4 bg-transparent text-white border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300 font-medium tracking-wide">
                Shop Diffuser
              </button>
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

      {/* Starter Kits Carousel */}
      <section className="py-24 bg-[#FAF9F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light mb-4 text-[#3A3834] tracking-tight">Best-Selling Starter Kits</h2>
            <p className="text-lg text-[#6B6762] font-light">Complete rituals, curated for you. Save 15% as a kit.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {starterKits.map((kit, index) => (
              <div
                key={index}
                className="group cursor-pointer bg-white rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-500"
                style={{
                  transform: `translateY(${scrollY * 0.02 * (index % 2 === 0 ? 1 : -1)}px)`
                }}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={kit.image}
                    alt={kit.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {kit.badge && (
                    <div className="absolute top-4 right-4 bg-[#8B7355] text-white text-xs font-medium px-3 py-1 rounded-full">
                      {kit.badge}
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#3A3834] text-xs font-medium px-3 py-1.5 rounded-full">
                    {kit.savings}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-xs tracking-wider text-[#8B7355] mb-2 uppercase font-medium">{kit.brand}</p>
                  <h3 className="text-xl font-medium mb-3 text-[#3A3834] group-hover:text-[#8B7355] transition-colors">{kit.name}</h3>
                  <p className="text-sm text-[#6B6762] mb-4 leading-relaxed font-light">{kit.essences}</p>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-medium text-[#3A3834]">{kit.price}</span>
                    <span className="text-sm text-[#9B9792] line-through">{kit.originalPrice}</span>
                  </div>

                  {/* CTA */}
                  <button className="w-full py-3 bg-[#3A3834] text-white font-medium tracking-wide hover:bg-[#8B7355] transition-all duration-300 group-hover:shadow-lg">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All CTA */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[#3A3834] text-[#3A3834] hover:bg-[#3A3834] hover:text-white font-medium tracking-wide transition-all duration-300">
              View All Starter Kits
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
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
    </main>
  );
}
