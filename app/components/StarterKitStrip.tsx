'use client';

import Image from 'next/image';
import { useMemo } from 'react';

type KitCard = {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  image: string;
  hoverImage: string;
  accent: string;
  ribbon: string;
  price: string;
  oldPrice: string;
  rating: number;
  reviews: number;
  blurb: string;
  meta: string;
};

const starterKits: KitCard[] = [
  {
    id: 'tranquil-nights',
    name: 'Tranquil Nights',
    badge: 'BEST SELLER',
    badgeColor: '#39444F',
    image: '/DiffuserLavender2.jpg',
    hoverImage: '/DiffuserLavender.jpg',
    accent: '#ECE7E0',
    ribbon: 'Lavender veil ritual',
    price: '$40',
    oldPrice: '$55',
    rating: 4.9,
    reviews: 212,
    blurb: 'Aura diffuser + lavender essence for slow-evening wind downs.',
    meta: 'Ships in 24h · Includes free scent',
  },
  {
    id: 'romance-ritual',
    name: 'Romance Ritual',
    badge: "OPRAH'S FAVORITE",
    badgeColor: '#4D2B2B',
    image: '/DiffuserRose2.jpg',
    hoverImage: '/DiffuserRose.jpg',
    accent: '#F5E8EC',
    ribbon: 'Rose petal evenings',
    price: '$40',
    oldPrice: '$54',
    rating: 4.8,
    reviews: 167,
    blurb: 'Diffuser + rose essence pairing designed for intimate lighting.',
    meta: 'Gift-ready wrap · Free scent swap',
  },
  {
    id: 'coastal-escape',
    name: 'Coastal Escape',
    badge: 'CALM AIR',
    badgeColor: '#1D4A5C',
    image: '/DiffuserOcean2.jpg',
    hoverImage: '/DiffuserOcean.jpg',
    accent: '#E3EFF4',
    ribbon: 'Ocean mist mornings',
    price: '$40',
    oldPrice: '$52',
    rating: 4.7,
    reviews: 138,
    blurb: 'Sea-salt diffusion that keeps open windows feeling freshly aired.',
    meta: 'Salt-safe mist · Runs silent overnight',
  },
  {
    id: 'sharp-start',
    name: 'Sharp Start',
    badge: 'New Arrival',
    badgeColor: '#214737',
    image: '/DiffuserMint2.jpg',
    hoverImage: '/DiffuserMint.jpg',
    accent: '#E6F0EA',
    ribbon: 'Minted daylight focus',
    price: '$40',
    oldPrice: '$52',
    rating: 4.8,
    reviews: 149,
    blurb: 'Peppermint-forward kit to energize work-from-home mornings.',
    meta: 'Cordless-ready · Free scent swap',
  },
];

export default function StarterKitStrip() {
  const cards = useMemo(() => starterKits, []);

  return (
    <section
      className="bg-gradient-to-b from-[#ede0d4] to-[#e6ccb2] py-14 px-6 sm:px-8"
      style={{ fontFamily: "'BrandonText', 'Inter', sans-serif" }}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-[32px] sm:text-[40px] font-bold text-[#7f5539] tracking-tight leading-tight" style={{ fontFamily: "'Toledo', Georgia, serif" }}>Our best Selling kits</h2>
            <p className="text-[25px] sm:text-[31px] text-[#9c6644] leading-snug" style={{ fontFamily: "'BrandonText', 'Inter', sans-serif" }}>Try our favorites. Free scent included.</p>
          </div>
          <p className="hidden sm:block text-xs text-[#b08968]">Swipe through kits</p>
        </div>

        <div className="relative -mx-6 sm:mx-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#e6ccb2] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#e6ccb2] to-transparent z-10" />

          <div className="smooth-scroll-slow flex gap-8 overflow-x-auto pb-6 px-6 sm:px-0">
            {cards.map((kit) => (
              <article
                key={kit.id}
                className="group snap-start flex-none w-[80vw] sm:w-[340px]"
              >
                <div
                  className="relative aspect-square rounded-[32px] overflow-hidden mb-4 shadow-[0_25px_60px_rgba(15,23,38,0.08)]"
                  style={{ backgroundColor: kit.accent }}
                >
                  <span
                    className="absolute top-4 left-4 z-10 text-[11px] font-semibold uppercase tracking-[0.35em] px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: kit.badgeColor }}
                  >
                    {kit.badge}
                  </span>
                  <Image
                    src={kit.image}
                    alt={kit.name}
                    fill
                    sizes="(max-width: 640px) 80vw, 340px"
                    className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                    priority={kit.id === 'tranquil-nights'}
                  />
                  <Image
                    src={kit.hoverImage}
                    alt={`${kit.name} alternate view`}
                    fill
                    sizes="(max-width: 640px) 80vw, 340px"
                    className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                </div>

                <div className="space-y-1 text-[#7f5539]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#b08968]">
                    ✨ {kit.ribbon}
                  </p>
                  <h3 className="text-xl font-semibold leading-tight">{kit.name}</h3>
                </div>

                <div className="flex items-center gap-2 mt-3 text-sm text-[#9c6644]">
                  <span className="text-xs text-[#b08968] uppercase tracking-[0.3em]">From:</span>
                  <span className="text-sm text-[#b08968] line-through">{kit.oldPrice}</span>
                  <span className="text-lg font-semibold text-[#7f5539]">{kit.price}</span>
                  <span className="inline-flex items-center rounded-full bg-[#ddb892] px-2 py-1 text-[11px] font-semibold text-[#7f5539]">
                    {Math.round(((parseFloat(kit.oldPrice.replace('$', '')) - parseFloat(kit.price.replace('$', ''))) / parseFloat(kit.oldPrice.replace('$', ''))) * 100)}% off
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#9c6644] mt-2">
                  <span className="text-[#b08968]" aria-hidden="true">★★★★★</span>
                  <span className="font-semibold text-[#7f5539]">{kit.rating.toFixed(1)}</span>
                  <a href="#reviews" className="text-[#9c6644] underline underline-offset-4">
                    ({kit.reviews.toLocaleString()})
                  </a>
                </div>

                <p className="text-sm text-[#9c6644] mt-3">{kit.blurb}</p>

                <div className="flex items-center gap-2 text-xs text-[#9c6644] mt-2">
                  <span>{kit.meta}</span>
                  <span className="w-1 h-1 rounded-full bg-[#b08968]" />
                  <button
                    type="button"
                    onClick={() => document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="font-semibold text-[#7f5539] underline underline-offset-4"
                  >
                    View kit →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
