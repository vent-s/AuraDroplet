'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type StarterKit = {
  id: string;
  name: string;
  badge: string;
  stamp: string;
  image: string;
  imageAlt: string;
  limitedCopy: string;
  oldPrice: string;
  price: string;
  discount: string;
  rating: number;
  reviews: number;
  meta: string;
  subcopy: string;
};

const starterKits: StarterKit[] = [
  {
    id: 'fall-ritual',
    name: 'Fall Ritual Starter Kit',
    badge: 'Best seller',
    stamp: 'Fall ritual kit',
    image: '/AutumnOffer.jpg',
    imageAlt: 'Fall ritual starter kit with diffuser and fall oils',
    limitedCopy: '✨ LIMITED-TIME OFFER',
    oldPrice: '$78',
    price: '$54',
    discount: '31% off',
    rating: 4.8,
    reviews: 182,
    meta: '30-day returns · Ships in 24h',
    subcopy: 'Includes diffuser + 4 fall oils',
  },
  {
    id: 'nightstand-pair',
    name: 'Nightstand Pairing Kit',
    badge: 'Calm nights',
    stamp: 'Bedside duo',
    image: '/DiffuserLavender.jpg',
    imageAlt: 'Nightstand kit featuring diffuser with lavender oil',
    limitedCopy: '✨ SLEEP BUNDLE',
    oldPrice: '$86',
    price: '$62',
    discount: '28% off',
    rating: 4.7,
    reviews: 143,
    meta: 'Linen-safe oils · Ships in 24h',
    subcopy: 'Includes diffuser + 2 sleep oils',
  },
  {
    id: 'gift-ready',
    name: 'Gift-ready Kit',
    badge: 'Limited run',
    stamp: 'Gifting fav',
    image: '/AutumnOffer.jpg',
    imageAlt: 'Gift-ready starter kit boxed with diffuser and oils',
    limitedCopy: '✨ READY TO GIFT',
    oldPrice: '$92',
    price: '$68',
    discount: '26% off',
    rating: 4.9,
    reviews: 204,
    meta: 'Wrapped + handwritten note',
    subcopy: 'Includes diffuser + bow-wrapped oils',
  },
];

export function StarterKitStrip() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardStride, setCardStride] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const updateStride = () => {
      const firstCard = cardRefs.current[0];
      if (!firstCard) {
        return;
      }
      const cardWidth = firstCard.getBoundingClientRect().width;
      const styles = window.getComputedStyle(firstCard);
      const marginRight = parseFloat(styles.marginRight || '0');
      setCardStride(cardWidth + marginRight);
    };

    updateStride();
    window.addEventListener('resize', updateStride);
    return () => window.removeEventListener('resize', updateStride);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(starterKits.length - 1, prev + 1));
  };

  const translateX = -(activeIndex * cardStride);

  return (
    <section className="bg-[#F5EEE6] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-[#2F2B26]">Starter kits to make it easy</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Previous starter kit"
              className={`h-10 w-10 rounded-full border border-[#D0C4B5] shadow-[0_4px_12px_rgba(47,35,25,0.12)] text-[#2F2B26] text-lg transition-opacity ${
                activeIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'opacity-100'
              }`}
            >
              ◀
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex === starterKits.length - 1}
              aria-label="Next starter kit"
              className={`h-10 w-10 rounded-full border border-[#2F2B26] shadow-[0_4px_18px_rgba(47,35,25,0.18)] text-[#2F2B26] text-lg transition-opacity ${
                activeIndex === starterKits.length - 1 ? 'opacity-40 cursor-not-allowed' : 'opacity-100'
              }`}
            >
              ▶
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex"
            style={{
              transform: `translateX(${translateX}px)`,
              transition: 'transform 380ms cubic-bezier(0.22, 0.61, 0.36, 1)',
            }}
          >
            {starterKits.map((kit, index) => (
              <article
                key={kit.id}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className="flex-none w-[85vw] sm:w-[320px] max-w-[360px] mr-3 last:mr-0 rounded-[20px] bg-white shadow-[0_15px_45px_rgba(0,0,0,0.1)] p-4 sm:p-5 text-[#2F2B26]"
              >
                <div className="relative rounded-[18px] overflow-hidden mb-3 bg-[#F8F4EE]">
                  <Image
                    src={kit.image}
                    alt={kit.imageAlt}
                    width={400}
                    height={400}
                    className="h-auto w-full object-cover"
                    priority={index === 0}
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-[#2F2319] text-white text-[11px] uppercase tracking-[0.15em] px-3 py-1">
                    {kit.badge}
                  </span>
                  <span className="absolute top-3 right-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-black/50 text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
                    {kit.stamp}
                  </span>
                </div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#2F6B3A] mb-2">{kit.limitedCopy}</p>

                <h3 className="text-xl font-semibold leading-snug mb-2">{kit.name}</h3>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-[#A39A8F] line-through">{kit.oldPrice}</span>
                  <span className="text-lg font-semibold">{kit.price}</span>
                  <span className="inline-flex items-center rounded-full bg-[#E1F5E4] px-2 py-1 text-[11px] font-semibold text-[#2F6B3A]">
                    {kit.discount}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[13px] text-[#4A4540] mb-1">
                  <span className="text-[#F5A623]" aria-hidden="true">
                    ★★★★☆
                  </span>
                  <span className="font-semibold">{kit.rating.toFixed(1)}</span>
                  <button type="button" className="text-[#6B6762] underline underline-offset-4">
                    ({kit.reviews} reviews)
                  </button>
                </div>

                <p className="text-xs text-[#7B7268] mb-4">{kit.meta}</p>

                <button
                  type="button"
                  className="w-full rounded-full bg-[#2F2319] py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(47,35,25,0.35)]"
                >
                  Add kit to bag
                </button>
                <p className="mt-2 text-[11px] text-[#7B7268]">{kit.subcopy}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StarterKitStrip;
