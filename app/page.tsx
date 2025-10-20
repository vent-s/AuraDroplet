'use client';

import Image from "next/image";
import { useState } from "react";

const variantId = process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_ID ?? "gid://shopify/ProductVariant/REPLACE_ME";
const checkoutUrl = `/api/quick-checkout?variant=${encodeURIComponent(variantId)}&qty=1`;
const needsVariantUpdate = variantId.includes("REPLACE_ME");

const heroSlides = [
  {
    tag: "WELLNESS REDEFINED",
    title: "Calm, on command.",
    subtitle: "Ultrasonic mist meets premium design. AuraDroplet brings instant tranquility to any space.",
    cta: "Shop AuraDroplet — $68",
    bgColor: "hero-premium-dark",
  },
  {
    tag: "TRAVEL EDITION",
    title: "Serenity that travels with you",
    subtitle: "Compact. Powerful. Designed for life in motion.",
    cta: "Shop Travel — $45",
    bgColor: "hero-premium-purple",
  },
  {
    tag: "HOME COLLECTION",
    title: "Elevate every moment",
    subtitle: "Transform rooms into sanctuaries with precision aromatherapy.",
    cta: "View Collection",
    bgColor: "hero-premium-teal",
  },
];

const categories = ["WOMEN", "MEN", "SHOES", "BAGS", "ACCESSORIES"];

const newArrivals = [
  {
    category: "AURA",
    name: "AuraDroplet Pro Elite",
    price: "$68.99",
    rating: 5,
    image: "/auradroplet-hero.jpg",
  },
  {
    category: "AURA",
    name: "Portable Mini Diffuser",
    price: "$45.99",
    rating: 4,
    image: "/auradroplet-hero.jpg",
  },
  {
    category: "AURA",
    name: "Travel Essential Kit",
    price: "$89.99",
    rating: 5,
    image: "/auradroplet-hero.jpg",
  },
  {
    category: "AURA",
    name: "Classic White Edition",
    price: "$58.99",
    rating: 4,
    image: "/auradroplet-hero.jpg",
  },
  {
    category: "AURA",
    name: "Essential Oil Bundle",
    price: "$34.99",
    rating: 5,
    image: "/auradroplet-hero.jpg",
  },
  {
    category: "AURA",
    name: "Premium Ceramic Core",
    price: "$78.99",
    rating: 5,
    image: "/auradroplet-hero.jpg",
  },
  {
    category: "AURA",
    name: "Aromatherapy Starter Pack",
    price: "$52.99",
    rating: 4,
    image: "/auradroplet-hero.jpg",
  },
  {
    category: "AURA",
    name: "USB-C Power Station",
    price: "$39.99",
    rating: 5,
    image: "/auradroplet-hero.jpg",
  },
];

const promotionalBanners = [
  {
    tag: "ETHEREAL ELEGANCE",
    title: "Where Dreams Meet Couture",
    cta: "Shop Now",
    image: "/auradroplet-hero.jpg",
    bgColor: "bg-gray-100",
  },
  {
    tag: "RADIANT REVERIE",
    title: "Enchanting Styles for Every Woman",
    cta: "Shop Now",
    image: "/auradroplet-hero.jpg",
    bgColor: "bg-blue-50",
  },
  {
    tag: "URBAN IMPRESSIONS",
    title: "Chic Footwear for City Living",
    cta: "Shop Now",
    image: "/auradroplet-hero.jpg",
    bgColor: "bg-gray-50",
  },
];


export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("WOMEN");

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Menu */}
            <div className="flex items-center space-x-8">
              <button className="text-gray-700 hover:text-blue-600">Home</button>
              <button className="text-gray-700 hover:text-blue-600">Shop</button>
              <button className="text-gray-700 hover:text-blue-600">Pages</button>
              <button className="text-gray-700 hover:text-blue-600">Blog</button>
            </div>

            {/* Logo */}
            <h1 className="text-2xl font-bold tracking-tight">AuraDroplet</h1>

            {/* Right Icons */}
            <div className="flex items-center space-x-6">
              <button className="text-gray-700 hover:text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button className="text-gray-700 hover:text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="text-gray-700 hover:text-blue-600 relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Slider */}
      <section className="relative h-screen mt-16 overflow-hidden bg-[#0E1116]">
        <div className="absolute inset-0 flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {heroSlides.map((slide, index) => (
            <div key={index} className={`min-w-full h-full relative hero-slide ${slide.bgColor}`}>
              {/* 60/40 Layout Container */}
              <div className="absolute inset-0 flex">
                {/* Left Panel - 60% with content */}
                <div className="w-full lg:w-[58%] relative flex items-center px-8 lg:px-16 xl:px-24">
                  <div className="max-w-2xl z-20 text-white hero-content">
                    <span className="text-xs font-semibold tracking-[0.2em] mb-6 block text-white/70 uppercase">
                      {slide.tag}
                    </span>
                    <h2 className="text-5xl lg:text-7xl font-bold mb-8 leading-[1.05] tracking-[-0.01em]">
                      {slide.title}
                    </h2>
                    <p className="text-lg lg:text-xl mb-10 text-white/80 max-w-[52ch] leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <button className="hero-cta bg-[#0E1116] text-white px-10 py-4 rounded-sm font-semibold hover:bg-black transition-all duration-300 shadow-none border border-white/10 hover:border-white/20">
                      {slide.cta}
                    </button>
                  </div>
                </div>

                {/* Right Panel - 40% Image with overlap */}
                <div className="absolute right-0 top-0 w-full lg:w-[50%] h-full hidden lg:block">
                  {/* Warm gradient overlay for harmonization */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1B2333] via-transparent to-transparent z-10 pointer-events-none" />
                  <Image
                    src="/auradroplet-hero.jpg"
                    alt="AuraDroplet product"
                    fill
                    className="object-cover object-[65%_center]"
                    priority={index === 0}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Navigation - Refined */}
        <button
          onClick={prevSlide}
          className="hero-nav-btn absolute left-14 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-30 transition-all duration-300 p-2"
          aria-label="Previous slide"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="hero-nav-btn absolute right-14 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-30 transition-all duration-300 p-2"
          aria-label="Next slide"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-[2px] transition-all duration-300 ${
                index === currentSlide ? "w-12 bg-white" : "w-8 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">New Arrivals</h2>

          {/* Category Filter */}
          <div className="flex justify-center gap-8 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((product, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                <h3 className="font-medium text-sm mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{product.price}</span>
                  {product.rating && (
                    <div className="flex text-yellow-400">
                      {[...Array(product.rating)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banners Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {promotionalBanners.slice(0, 2).map((banner, index) => (
              <div key={index} className={`${banner.bgColor} rounded-lg p-12 relative overflow-hidden min-h-[400px] flex items-center`}>
                <div className="z-10 max-w-md">
                  <span className="text-xs font-semibold tracking-widest mb-3 block text-gray-600">{banner.tag}</span>
                  <h3 className="text-3xl font-bold mb-6 text-gray-900">{banner.title}</h3>
                  <button className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors">
                    {banner.cta}
                  </button>
                </div>
                <div className="absolute right-0 top-0 w-1/2 h-full">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover opacity-40"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Urban Impressions Banner */}
            <div className="bg-gray-50 rounded-lg p-12 relative overflow-hidden min-h-[400px] flex items-center">
              <div className="z-10 max-w-md">
                <span className="text-xs font-semibold tracking-widest mb-3 block text-gray-600">
                  {promotionalBanners[2].tag}
                </span>
                <h3 className="text-3xl font-bold mb-6 text-gray-900">{promotionalBanners[2].title}</h3>
                <button className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors">
                  {promotionalBanners[2].cta}
                </button>
              </div>
              <div className="absolute right-0 top-0 w-1/2 h-full">
                <Image
                  src={promotionalBanners[2].image}
                  alt={promotionalBanners[2].title}
                  fill
                  className="object-cover opacity-40"
                />
              </div>
            </div>

            {/* Discount Banner */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-lg p-12 text-white flex flex-col justify-center items-center text-center min-h-[400px]">
              <h3 className="text-lg font-semibold mb-2 tracking-wide">Trendsetting Bags for Her</h3>
              <p className="text-7xl font-bold mb-6">50%</p>
              <button className="bg-white text-gray-900 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-xl mb-4">AuraDroplet</h3>
              <p className="text-gray-400 text-sm">Transform your space with premium wellness technology.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">New Arrivals</a></li>
                <li><a href="#" className="hover:text-white">Best Sellers</a></li>
                <li><a href="#" className="hover:text-white">Collections</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Shipping</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-4">Subscribe for exclusive offers</p>
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 rounded-md text-gray-900 mb-2"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors">
                Subscribe
              </button>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 AuraDroplet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
