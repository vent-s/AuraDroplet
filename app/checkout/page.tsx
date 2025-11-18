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
  ember: '#C65D3B',
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

const heroBadge = 'SAVE $20.00';
const reviewMeta = { average: 4.9, count: 10842 };

export default function CheckoutPage() {
  const [selectedColor, setSelectedColor] = useState(colorways[0]);
  const [selectedBundle, setSelectedBundle] = useState(bundleOptions[0]);
  const savings = selectedBundle.compareAt - selectedBundle.price;
  const percentOff = Math.round((savings / selectedBundle.compareAt) * 100);

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

            <section className="bg-[#ede0d4] px-4 py-8 pb-28 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6 lg:space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-[#ddb892] bg-white shadow-[0_30px_70px_rgba(127,85,57,0.12)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-[28px] sm:aspect-[5/4]">
                <div className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#7f5539]">
                  {heroBadge}
                </div>
                <Image
                  src={selectedColor.image}
                  alt={selectedColor.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="flex justify-center gap-2 border-t border-[#ede0d4] px-4 py-3">
                {colorways.map((color) => (
                  <button
                    key={`hero-swatch-${color.id}`}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`View ${color.title}`}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      selectedColor.id === color.id ? 'bg-[#7f5539]' : 'bg-[#b08968]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#ddb892] bg-white p-5 sm:p-6 shadow-[0_20px_60px_rgba(127,85,57,0.08)] space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#b08968]">
                <span>★★★★★</span>
                <span className="normal-case tracking-normal text-sm font-medium text-[#7f5539]">
                  {reviewMeta.average.toFixed(1)} average ({reviewMeta.count.toLocaleString()} reviews)
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#9c6644]">Aura Diffuser Kit</p>
                <h1 className="text-3xl font-semibold text-[#7f5539] sm:text-4xl">
                  {selectedColor.title} ({selectedColor.scent})
                </h1>
                <p className="mt-1 text-sm text-[#9c6644]">{selectedColor.tagline}</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#ede0d4] px-4 py-3">
                <div>
                  <p className="text-3xl font-semibold text-[#7f5539]">
                    {formatCurrency(selectedBundle.price)}
                  </p>
                  <p className="text-xs text-[#9c6644]">
                    ({formatCurrency(selectedBundle.compareAt)} value)
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-[#ddb892] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#7f5539]">
                    Save {formatCurrency(savings)}
                  </span>
                  <p className="text-xs text-[#9c6644]">{percentOff}% off</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.4em] text-[#9c6644]">Bundle</p>
                <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
                  {bundleOptions.map((bundle) => (
                    <button
                      key={bundle.id}
                      onClick={() => setSelectedBundle(bundle)}
                      className={`min-w-[210px] rounded-2xl border px-4 py-3 text-left text-sm transition sm:min-w-0 ${
                        selectedBundle.id === bundle.id
                          ? 'border-[#7f5539] bg-[#7f5539] text-white'
                          : 'border-[#ddb892] bg-[#f7ede2] text-[#7f5539]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{bundle.label}</span>
                        <span>
                          {formatCurrency(bundle.price)}
                          <span
                            className={`ml-2 text-xs ${
                              selectedBundle.id === bundle.id ? 'text-white/60' : 'text-[#b08968]'
                            }`}
                          >
                            {formatCurrency(bundle.compareAt)}
                          </span>
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-xs ${
                          selectedBundle.id === bundle.id ? 'text-white/80' : 'text-[#9c6644]'
                        }`}
                      >
                        {bundle.pieces} · {bundle.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border-2 border-[#7f5539] bg-white p-6 shadow-[0_25px_65px_rgba(127,85,57,0.1)] grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[#9c6644]">Your Selection</p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-[#7f5539]">
                    {selectedBundle.label} ({selectedBundle.pieces})
                  </p>
                  <p className="text-sm text-[#9c6644]">{selectedBundle.description}</p>
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
              <p className="mt-6 text-sm uppercase tracking-[0.4em] text-[#b08968]">
                Color: {selectedColor.title}
              </p>
              <p className="text-base text-[#7f5539]">{selectedColor.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {colorways.map((color) => (
                  <button
                    key={`card-swatch-${color.id}`}
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 w-10 rounded-full border-2 transition ${
                      selectedColor.id === color.id ? 'border-[#7f5539]' : 'border-[#b08968]'
                    }`}
                    style={{ background: color.swatch }}
                    aria-label={`Select ${color.title}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={needsVariantUpdate}
                className="mt-6 hidden w-full rounded-full bg-[#C65D3B] py-4 text-base font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[#9c6644] disabled:cursor-not-allowed disabled:opacity-40 md:inline-block"
              >
                {needsVariantUpdate
                  ? 'Finish store setup to checkout'
                  : `Add to Bag — ${formatCurrency(selectedBundle.price)}`}
              </button>
              <p className="mt-2 text-xs text-[#b08968]">
                Ships free in the contiguous U.S. Taxes calculated at checkout.
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#ddb892] p-2">
                <Image
                  src={selectedColor.image}
                  alt={selectedColor.alt}
                  width={180}
                  height={180}
                  className="w-full rounded-2xl object-cover"
                />
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm text-[#7f5539]">
                {kitFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>


      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] md:hidden">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={needsVariantUpdate}
          className="w-full rounded-full bg-[#C65D3B] py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-[#9c6644] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {needsVariantUpdate ? 'Finish store setup' : `Checkout — ${formatCurrency(selectedBundle.price)}`}
        </button>
      </div>

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
