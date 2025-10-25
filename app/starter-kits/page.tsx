'use client';

import Image from "next/image";
import Link from "next/link";
import { starterKits } from "../data/starterKits";

const variantId = process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_ID ?? "gid://shopify/ProductVariant/REPLACE_ME";
const checkoutUrl = `/api/quick-checkout?variant=${encodeURIComponent(variantId)}&qty=1`;
const needsVariantUpdate = variantId.includes("REPLACE_ME");

export default function StarterKitsPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F7] text-[#3A3834]">
      <header className="fixed top-0 w-full z-40 bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#E8E6E3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="text-lg tracking-[0.35em] font-light">AURADROPLET</Link>
          <nav className="hidden sm:flex items-center gap-8 text-xs tracking-[0.3em] uppercase text-[#6B6762]">
            <Link href="/" className="hover:text-[#3A3834]">Home</Link>
            <Link href="/starter-kits" className="text-[#3A3834]">Starter Kits</Link>
            <Link href="/shop" className="hover:text-[#3A3834]">Shop All</Link>
          </nav>
          <Link
            href={checkoutUrl}
            className={`text-xs tracking-[0.3em] uppercase border px-4 py-2 ${needsVariantUpdate ? 'opacity-60 pointer-events-none' : ''}`}
          >
            Quick Checkout
          </Link>
        </div>
      </header>

      <section className="pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#8B7355] mb-4">Complete Ritual Bundles</p>
          <h1 className="text-4xl lg:text-6xl font-light mb-6">Best-Selling Starter Kits</h1>
          <p className="text-base lg:text-lg text-[#6B6762] font-light">
            Choose your mood story and save 15% when you pair the Aura diffuser with a curated trio of essences.
          </p>
        </div>
      </section>

      <section className="pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {starterKits.map((kit) => (
            <article key={kit.name} className="bg-white rounded-3xl overflow-hidden border border-[#E8E6E3] flex flex-col">
              <div className="relative aspect-square">
                <Image src={kit.image} alt={kit.name} fill className="object-cover" />
                {kit.badge && (
                  <span className="absolute top-4 right-4 bg-[#3A3834] text-white text-[10px] tracking-[0.3em] px-3 py-1 uppercase">{kit.badge}</span>
                )}
                <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 text-xs tracking-wider rounded-full">{kit.savings}</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs tracking-[0.3em] text-[#8B7355] uppercase mb-2">{kit.brand}</p>
                <h2 className="text-xl font-medium mb-3">{kit.name}</h2>
                <p className="text-sm text-[#6B6762] mb-6 flex-1">{kit.essences}</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-medium">{kit.price}</span>
                  <span className="text-sm text-[#9B9792] line-through">{kit.originalPrice}</span>
                </div>
                <Link
                  href={needsVariantUpdate ? '#variant' : checkoutUrl}
                  className={`w-full text-center py-3 rounded-full text-sm tracking-[0.2em] uppercase ${needsVariantUpdate ? 'bg-[#CFCBC5] text-[#8B877F]' : 'bg-[#3A3834] text-white hover:bg-[#8B7355]'}`}
                >
                  Add to cart
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-32 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-[#6B6762]">Need help picking? Text our scent concierge after checkout—we&apos;ll confirm your complimentary vial before shipping.</p>
        </div>
      </section>
    </main>
  );
}
