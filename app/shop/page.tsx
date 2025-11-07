'use client';

import Image from "next/image";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { products } from "../data/products";
import Link from "next/link";
import CartDrawer from "../components/CartDrawer";

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest';

export default function Shop() {
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState<string>('');
  const { addToCart, setIsCartOpen } = useCart();

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(product);
    setToastProduct(product.name);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0);
      default:
        return 0;
    }
  });

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#FAF9F7]/98 backdrop-blur-md border-b border-[#E8E6E3]">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/">
              <h1 className="text-2xl font-light tracking-[0.15em] text-[#3A3834] hover:text-[#8B7355] transition-colors cursor-pointer">
                AURA
              </h1>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm tracking-wider text-[#6B6762] hover:text-[#3A3834] transition-colors">
                HOME
              </Link>
              <Link href="/shop" className="text-sm tracking-wider text-[#3A3834] font-medium">
                SHOP
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-sm tracking-wider text-[#6B6762] hover:text-[#3A3834] transition-colors"
              >
                CART
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-8 lg:pb-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-6xl font-light mb-2 lg:mb-4 text-[#3A3834] tracking-tight">
            Shop Aura
          </h1>
          <p className="text-sm lg:text-lg text-[#6B6762] font-light">
            Diffusers & essential oils for your ritual
          </p>
        </div>

        {/* Sort Bar */}
        <div className="flex justify-end mb-6 lg:mb-12">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-white border-2 border-[#E8E6E3] px-6 py-3 pr-12 text-sm tracking-wider text-[#3A3834] font-medium cursor-pointer hover:border-[#C4A27F] transition-colors"
            >
              <option value="featured">FEATURED</option>
              <option value="price-low">PRICE: LOW TO HIGH</option>
              <option value="price-high">PRICE: HIGH TO LOW</option>
              <option value="newest">NEWEST</option>
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A3834] pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {sortedProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white border-2 border-[#E8E6E3] hover:border-[#C4A27F] transition-all duration-500 hover:shadow-2xl"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-[#FAF9F7]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 20vw, 45vw"
                  className="object-contain group-hover:scale-105 transition-transform duration-700"
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 lg:top-4 lg:left-4 flex flex-col gap-1 lg:gap-2">
                  {product.discount && (
                    <div className="bg-[#3A3834] text-white text-[10px] lg:text-xs font-medium px-2 py-1 lg:px-3 lg:py-1.5 tracking-wider">
                      {product.discount}% OFF
                    </div>
                  )}
                  {product.badge === 'bestseller' && (
                    <div className="bg-[#3A3834] text-white text-[10px] lg:text-xs font-medium px-2 py-1 lg:px-3 lg:py-1.5 tracking-wider">
                      BEST-SELLER
                    </div>
                  )}
                  {product.badge === 'new' && (
                    <div className="bg-[#3A3834] text-white text-[10px] lg:text-xs font-medium px-2 py-1 lg:px-3 lg:py-1.5 tracking-wider">
                      NEW
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 lg:p-6">
                <h3 className="text-base lg:text-xl font-light mb-2 lg:mb-3 text-[#3A3834] tracking-tight">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-1 lg:gap-2 mb-3 lg:mb-4">
                  {product.originalPrice && (
                    <span className="text-xs lg:text-sm text-[#9B9792] line-through font-light">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className={`text-lg lg:text-xl font-medium ${product.originalPrice ? 'text-[#C4723F]' : 'text-[#3A3834]'}`}>
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {/* Add to Bag Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full h-10 lg:h-12 bg-[#3A3834] text-white font-medium tracking-wider text-xs lg:text-sm hover:bg-[#8B7355] transition-all duration-300 border-2 border-[#3A3834] hover:border-[#8B7355]"
                >
                  ADD TO BAG
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-8 z-50 animate-fade-in-up">
          <div className="bg-[#C4A27F] text-white px-6 py-4 rounded-sm shadow-2xl flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium tracking-wide">{toastProduct} added to cart</p>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer />
    </main>
  );
}
