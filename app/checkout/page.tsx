'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const asset = (path: string) => (path.startsWith('http') ? path : `https:${path}`);

const palette = {
  cream: '#ede0d4',
  sand: '#e6ccb2',
  amber: '#ddb892',
  clay: '#b08968',
  espresso: '#7f5539',
  chestnut: '#9c6644',
} as const;

const variantId =
  process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_ID ?? 'gid://shopify/ProductVariant/REPLACE_ME';
const needsVariantUpdate = variantId.includes('REPLACE_ME');

const heroPricing = {
  current: 40,
  compareAt: 60,
};

const colorways = [
  {
    id: 'blue-salt',
    title: 'Tranquil Nights',
    scent: 'Lavender',
    tagline: 'Diffuser + lavender veil essence for slow-evening wind downs.',
    image: '/DiffuserLavender2.jpg',
    alt: 'Aura diffuser with lavender essence on a bedside.',
    swatch: palette.sand,
    background: [palette.cream, palette.sand],
  },
  {
    id: 'spice',
    title: 'Romance Ritual',
    scent: 'Rose',
    tagline: 'Rose petal essence for intimate, cozy lighting.',
    image: '/DiffuserRose2.jpg',
    alt: 'Aura diffuser styled with rose petals.',
    swatch: palette.amber,
    background: [palette.sand, palette.amber],
  },
  {
    id: 'steam',
    title: 'Sharp Start',
    scent: 'Mint',
    tagline: 'Minty uplift for bright, focused mornings.',
    image: '/DiffuserMint2.jpg',
    alt: 'Aura diffuser next to mint leaves.',
    swatch: palette.clay,
    background: [palette.cream, palette.amber],
  },
  {
    id: 'char',
    title: 'Coastal Escape',
    scent: 'Ocean',
    tagline: 'Ocean breeze accord for calm, airy afternoons.',
    image: '/DiffuserOcean2.jpg',
    alt: 'Aura diffuser with ocean-inspired styling.',
    swatch: palette.chestnut,
    background: [palette.chestnut, palette.espresso],
  },
] as const;

const bundleOptions = [
  {
    id: 'single',
    label: 'Starter Kit',
    pieces: '2 piece',
    description: 'Includes 1 diffuser base, 1 essence vial, and quick-start guide.',
    price: 40,
    compareAt: 60
  },
  {
    id: 'cornucopia',
    label: 'Cornucopia Special',
    pieces: '4 piece',
    description: '2 diffusers + 2 scents - perfect for gifting or multiple rooms.',
    price: 70,
    compareAt: 100
  },
  {
    id: 'triple',
    label: 'Family Bundle',
    pieces: '6 piece',
    description: '3 diffusers + 3 scents - whole home aromatherapy experience.',
    price: 100,
    compareAt: 140
  },
] as const;

const kitFeatures = [
  'Soft-glow ceramic diffuser with two mist modes.',
  'Complimentary 15ml essence vial in your chosen scent.',
  'Automatic shut-off plus ambient halo light.',
  'Free shipping and 3-year limited warranty.',
] as const;

const testimonials = [
  {
    title: 'Absolutely Love My Investment',
    description:
      "Truly understand the hype and aesthetic it can bring to any kitchen. I got the exclusive color of Azul and couldn't be happier!",
    rating: 5,
  },
  {
    title: 'Nothing Sticks!',
    description:
      'I absolutely love my cookware set! It’s super cute and chic. Nothing sticks and burns like my old pans and cleanup is effortless.',
    rating: 5,
  },
  {
    title: 'Cleanup is a Breeze!',
    description:
      'Great heat distribution and cleanup is a breeze. It works so well we bought a second set for our daughter.',
    rating: 4.5,
  },
] as const;

const quickCheckoutUrl = (color?: string) => {
  const params = new URLSearchParams({
    variant: variantId,
    qty: '1',
  });
  if (color) {
    params.append('color', color);
  }
  return `/api/quick-checkout?${params.toString()}`;
};

const heroBadge = '$20 set savings';
const reviewMeta = { average: 4.9, count: 10842 };

export default function CheckoutPage() {
  const [selectedColor, setSelectedColor] = useState(colorways[0]);
  const [selectedBundle, setSelectedBundle] = useState(bundleOptions[0]);
  const savings = selectedBundle.compareAt - selectedBundle.price;

  const handleCheckout = () => {
    if (needsVariantUpdate) {
      alert('Please configure NEXT_PUBLIC_SHOPIFY_VARIANT_ID to enable checkout.');
      return;
    }
    const url = quickCheckoutUrl(selectedColor.id);
    window.location.href = url;
  };

  return (
    <main className="bg-[#ede0d4] text-[#7f5539] min-h-screen">
      <header className="border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm uppercase tracking-[0.3em] text-[#9c6644]">
          <button className="font-semibold">Menu</button>
          <Link href="/" className="text-xl font-semibold tracking-[0.4em]">
            Our Place
          </Link>
          <div className="flex items-center gap-4 text-base">
            <span>Help</span>
            <span>Cart</span>
          </div>
        </div>
      </header>

      <section className="bg-[#ede0d4] px-6 py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_35px_80px_rgba(127,85,57,0.12)]">
            <div className="relative bg-[#f3e5d8]">
              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#b08968]">
                {heroBadge}
              </div>
              <Image
                src={selectedColor.image}
                alt={selectedColor.alt}
                width={1000}
                height={900}
                priority
                className="w-full object-cover"
              />
            </div>
            <div className="flex justify-center gap-2 py-4">
              {colorways.map((color) => (
                <button
                  key={`hero-swatch-${color.id}`}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`View ${color.title}`}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    selectedColor.id === color.id ? 'bg-[#7f5539]' : 'bg-[#d7c2aa]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-[0_20px_60px_rgba(127,85,57,0.08)] space-y-6">
            <div className="flex items-center gap-3 text-sm text-[#b08968]">
              <span className="text-xl" aria-hidden>
                ★★★★★
              </span>
              <span className="font-semibold">{reviewMeta.average.toFixed(1)} average</span>
              <span>({reviewMeta.count.toLocaleString()} reviews)</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[#b08968]">Aura Diffuser Kit</p>
              <h1 className="text-4xl font-light text-[#7f5539]">
                {selectedColor.title} ({selectedColor.scent})
              </h1>
              <p className="mt-2 text-base text-[#9c6644]">{selectedColor.tagline}</p>
            </div>
            <div className="flex flex-wrap items-end gap-4 border-t border-[#ead5c4] pt-4">
              <div>
                <p className="text-4xl font-semibold text-[#7f5539]">
                  {formatCurrency(selectedBundle.price)}
                </p>
                <p className="text-sm text-[#b08968]">
                  ({formatCurrency(selectedBundle.compareAt)} value)
                </p>
              </div>
              <span className="rounded-full bg-[#ddb892] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#7f5539]">
                Save {formatCurrency(savings)}
              </span>
              <p className="text-sm text-[#9c6644]">
                {Math.round((savings / selectedBundle.compareAt) * 100)}% off
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.4em] text-[#b08968]">Bundle</p>
              <div className="grid grid-cols-1 gap-3">
                {bundleOptions.map((bundle) => (
                  <button
                    key={bundle.id}
                    onClick={() => setSelectedBundle(bundle)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      selectedBundle.id === bundle.id
                        ? 'border-[#7f5539] bg-[#7f5539] text-white'
                        : 'border-[#d0b79c] text-[#7f5539]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{bundle.label}</span>
                      <span className="text-sm">
                        {formatCurrency(bundle.price)}
                        <span className={`ml-2 line-through ${selectedBundle.id === bundle.id ? 'text-white/60' : 'text-[#b08968]'}`}>
                          {formatCurrency(bundle.compareAt)}
                        </span>
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${selectedBundle.id === bundle.id ? 'text-white/80' : 'text-[#9c6644]'}`}>
                      {bundle.pieces} - {bundle.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border-2 border-[#7f5539] bg-white p-6 shadow-[0_25px_65px_rgba(127,85,57,0.1)]">
            <p className="text-sm uppercase tracking-[0.4em] text-[#b08968]">
              Your Selection
            </p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="text-lg font-semibold text-[#7f5539]">{selectedBundle.label} ({selectedBundle.pieces})</p>
                <p className="text-sm text-[#9c6644]">
                  {selectedBundle.description}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-2xl font-semibold text-[#7f5539]">
                  {formatCurrency(selectedBundle.price)}
                </p>
                <p className="text-sm text-[#b08968]">
                  ({formatCurrency(selectedBundle.compareAt)} value)
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-[140px,1fr]">
              <div className="rounded-2xl bg-[#ede0d4] p-2">
                <Image
                  src={selectedColor.image}
                  alt={selectedColor.alt}
                  width={180}
                  height={180}
                  className="w-full rounded-2xl object-cover"
                />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-[#b08968]">
                  Color: {selectedColor.title}
                </p>
                <p className="text-base text-[#7f5539]">{selectedColor.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {colorways.map((color) => (
                    <button
                      key={`card-swatch-${color.id}`}
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 w-10 rounded-full border-2 transition ${
                        selectedColor.id === color.id ? 'border-[#7f5539]' : 'border-transparent'
                      }`}
                      style={{ background: color.swatch }}
                      aria-label={`Select ${color.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-[#7f5539]">
              {kitFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={needsVariantUpdate}
              className="mt-6 w-full rounded-full bg-[#7f5539] py-4 text-base font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[#9c6644] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {needsVariantUpdate ? 'Finish store setup to checkout' : 'Add to Bag — $40'}
            </button>
            <p className="mt-2 text-xs text-[#b08968]">
              Ships free in the contiguous U.S. Taxes calculated at checkout.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#ede0d4] py-16">
        <div className="mx-auto max-w-6xl space-y-10 px-6">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-[#b08968]">Customer Love</p>
            <h2 className="text-3xl font-light text-[#7f5539]">
              The Aura Diffuser Kit has over {reviewMeta.count.toLocaleString()} glowing reviews
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((review) => (
              <div
                key={review.title}
                className="h-full rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_25px_60px_rgba(127,85,57,0.06)]"
              >
                <p className="text-lg font-semibold text-[#7f5539]">{review.title}</p>
                <p className="mt-1 text-sm text-[#b08968]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index}>{index < Math.round(review.rating) ? '★' : '☆'}</span>
                  ))}
                </p>
                <p className="mt-3 text-sm text-[#7f5539]">{review.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
