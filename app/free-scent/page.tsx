'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

const scents = [
  {
    id: "rose-petal",
    name: "Rose Petal",
    notes: "Rose · Geranium · Musk",
    image: "/auradroplet-hero.jpg",
    rating: 5.8,
    reviews: 243,
    description: "Timeless florals with warm undertones"
  },
  {
    id: "lavender",
    name: "Lavender",
    notes: "Lavender · Bergamot · Chamomile",
    image: "/auradroplet-hero.jpg",
    rating: 5.8,
    reviews: 312,
    description: "Calming fields with citrus lift"
  },
  {
    id: "jasmine",
    name: "Jasmine",
    notes: "White Florals · Citrus Peel",
    image: "/auradroplet-hero.jpg",
    rating: 5.8,
    reviews: 189,
    description: "Intoxicating blooms, bright finish"
  },
  {
    id: "mint-leaf",
    name: "Mint Leaf",
    notes: "Peppermint · Basil · Green Tea",
    image: "/auradroplet-hero.jpg",
    rating: 5.3,
    reviews: 156,
    description: "Crisp herbal awakening"
  },
  {
    id: "sandalwood",
    name: "Sandalwood",
    notes: "Amber · Cedar · Vanilla",
    image: "/auradroplet-hero.jpg",
    rating: 5.8,
    reviews: 287,
    description: "Warm woods with creamy depth"
  },
  {
    id: "ocean-mist",
    name: "Ocean Mist",
    notes: "Sea Salt · Driftwood · Marine",
    image: "/auradroplet-hero.jpg",
    rating: 5.6,
    reviews: 201,
    description: "Coastal breeze captured"
  },
];

export default function FreeScentPage() {
  const [selectedScent, setSelectedScent] = useState<string | null>(null);
  const [hasDiffuser, setHasDiffuser] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScentSelect = (scentId: string) => {
    if (!hasDiffuser) {
      setShowModal(true);
      // Store selection for later
      sessionStorage.setItem('pendingFreeScent', scentId);
    } else {
      setSelectedScent(scentId);
    }
  };

  const selectedCount = selectedScent ? 1 : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F5EFE7] via-[#FAF9F7] to-[#F0E8DB]">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-[#FAF9F7]/98 backdrop-blur-md z-50 border-b border-[#E8E6E3]">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="hidden lg:flex items-center space-x-1">
              <a href="/" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Home</a>
              <span className="text-[#C4C0BA]">·</span>
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Diffusers</a>
              <span className="text-[#C4C0BA]">·</span>
              <a href="#" className="nav-link px-4 py-2 text-[#3A3834] hover:text-[#8B7355] transition-colors">Essences</a>
            </div>

            <h1 className="text-2xl lg:absolute lg:left-1/2 lg:-translate-x-1/2 font-light tracking-[0.15em] text-[#3A3834]">AURADROPLET</h1>

            <div className="flex items-center space-x-6">
              <button className="text-[#3A3834] hover:text-[#8B7355] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button className="text-[#3A3834] hover:text-[#8B7355] transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex justify-end mb-8 animate-fade-in">
            <div className="text-sm font-light text-[#6B6762] tracking-wide">
              Free Scent: <span className="font-medium text-[#3A3834]">{selectedCount}/1 selected</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className="font-serif text-6xl lg:text-7xl font-light mb-6 text-[#3A3834] tracking-tight leading-[1.05]">
              Your Diffuser Comes<br />With a Free Scent
            </h1>

            <p className="text-sm tracking-[0.2em] uppercase text-[#8B7355] mb-8 font-medium">
              Any 15 ML · $18 Value · One Per Diffuser
            </p>

            <p className="text-xs tracking-widest uppercase text-[#9B9792] mb-12 font-light">
              Ends Sunday
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => window.location.href = '/'}
                className="px-10 py-4 bg-[#3A3834] text-white font-medium tracking-wide hover:bg-[#8B7355] transition-all duration-300 hover:shadow-lg"
              >
                Choose Diffuser
              </button>
              <button
                onClick={() => document.getElementById('scent-selector')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 bg-transparent text-[#3A3834] border border-[#3A3834] hover:bg-[#3A3834] hover:text-white font-medium tracking-wide transition-all duration-300"
              >
                Pick Free Scent
              </button>
            </div>

            <p className="text-sm text-[#6B6762] font-light mb-4">
              You save $18 today.
            </p>

            <div className="flex flex-wrap gap-6 text-xs text-[#9B9792] font-light pt-4 border-t border-[#E8E6E3]">
              <span>2-year warranty</span>
              <span>·</span>
              <span>Free shipping over $X</span>
              <span>·</span>
              <span>Scent Swap on paid essences</span>
            </div>
          </div>
        </div>
      </section>

      {/* Scent Selector */}
      <section id="scent-selector" className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scents.map((scent, index) => (
              <div
                key={scent.id}
                className={`group cursor-pointer bg-white/80 backdrop-blur-sm rounded-sm overflow-hidden hover:shadow-2xl transition-all duration-500 border ${
                  selectedScent === scent.id ? 'border-[#C4A27F] ring-2 ring-[#C4A27F]/30' : 'border-[#E8E6E3]'
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  transform: `translateY(${scrollY * 0.02 * (index % 2 === 0 ? 1 : -1)}px)`
                }}
                onClick={() => handleScentSelect(scent.id)}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={scent.image}
                    alt={scent.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Ribbon */}
                  <div className="absolute top-4 left-4 bg-[#C4A27F] text-white text-xs font-medium px-4 py-1.5 tracking-wider">
                    $0 with diffuser
                  </div>
                  {selectedScent === scent.id && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-[#C4A27F] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-light mb-2 text-[#3A3834] tracking-tight">{scent.name}</h3>
                  <p className="text-sm text-[#6B6762] mb-4 font-light">{scent.notes}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-[#C4A27F]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <span className="text-xs text-[#9B9792] font-light">{scent.rating}% ({scent.reviews})</span>
                  </div>

                  <div className="mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm text-[#3A3834] font-medium">
                      $0 <span className="text-xs text-[#9B9792] line-through font-light">(Reg. $18)</span>
                    </p>
                  </div>

                  <button className={`w-full py-3 font-medium tracking-wide transition-all duration-300 ${
                    selectedScent === scent.id
                      ? 'bg-[#C4A27F] text-white'
                      : 'bg-[#3A3834] text-white hover:bg-[#8B7355]'
                  }`}>
                    {selectedScent === scent.id ? 'Selected as Free Scent' : 'Select as Free Scent'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* See All Button */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 px-8 py-4 border border-[#3A3834] text-[#3A3834] hover:bg-[#3A3834] hover:text-white font-medium tracking-wide transition-all duration-300">
              See all scents
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 text-center">
            <p className="text-sm text-[#6B6762] font-light italic">
              &ldquo;Best diffuser set I&apos;ve owned.&rdquo; — Maya L.
            </p>
            <div className="flex justify-center gap-1 text-[#C4A27F] mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E6E3] p-4 shadow-2xl z-40">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm">
            <p className="font-medium text-[#3A3834]">Free Scent: {selectedCount}/1</p>
            <p className="text-xs text-[#6B6762] font-light">Save $18 today</p>
          </div>
          {!selectedScent ? (
            <button
              onClick={() => document.getElementById('scent-selector')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 bg-[#3A3834] text-white font-medium tracking-wide whitespace-nowrap"
            >
              Select One
            </button>
          ) : (
            <button className="px-6 py-3 bg-[#C4A27F] text-white font-medium tracking-wide whitespace-nowrap">
              Checkout
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="bg-white max-w-md w-full p-8 rounded-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-light mb-4 text-[#3A3834]">Add a diffuser to claim this Free Scent</h3>
            <p className="text-sm text-[#6B6762] mb-8 font-light leading-relaxed">
              Choose any Aura Diffuser and we&apos;ll include your selected scent at no charge.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 bg-[#3A3834] text-white font-medium tracking-wide hover:bg-[#8B7355] transition-all duration-300"
              >
                Choose Diffuser
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-6 py-3 border border-[#3A3834] text-[#3A3834] font-medium tracking-wide hover:bg-[#3A3834] hover:text-white transition-all duration-300"
              >
                Keep browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#3A3834] text-[#E8E6E3] py-16 mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-light text-2xl mb-4 tracking-[0.15em]">AURADROPLET</h3>
              <p className="text-sm text-[#C4C0BA] leading-relaxed font-light">
                Fragrance, considered.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-white">Policy</h4>
              <ul className="space-y-3 text-sm text-[#C4C0BA] font-light">
                <li>30-day returns on unused diffusers</li>
                <li>Essences are final sale</li>
                <li>2-year warranty included</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-white">Support</h4>
              <ul className="space-y-3 text-sm text-[#C4C0BA] font-light">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-white">Offer Details</h4>
              <p className="text-sm text-[#C4C0BA] font-light leading-relaxed">
                Buy any Aura Diffuser, get one 15ml essence free. One per diffuser. Any eligible scent.
              </p>
            </div>
          </div>
          <div className="border-t border-[#4A4844] pt-8 text-center text-sm text-[#9B9792]">
            <p className="font-light">&copy; 2024 AuraDroplet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
