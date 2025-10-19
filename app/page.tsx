import Image from "next/image";

const variantId = process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_ID ?? "gid://shopify/ProductVariant/REPLACE_ME";
const checkoutUrl = `/api/quick-checkout?variant=${encodeURIComponent(variantId)}&qty=1`;
const needsVariantUpdate = variantId.includes("REPLACE_ME");

if (process.env.NODE_ENV !== "production" && needsVariantUpdate) {
  console.warn("NEXT_PUBLIC_SHOPIFY_VARIANT_ID is not configured. Hero CTA remains disabled until it is set.");
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://auradroplet.example";
const productUrl = process.env.NEXT_PUBLIC_PRODUCT_URL ?? siteUrl;

const heroSpecs = [
  { label: "USB-C", value: "Works with power banks" },
  { label: "Auto-shutoff", value: "Turns off when empty" },
  { label: "Leak-proof cap", value: "Travel safe" },
  { label: "Dimensions", value: "142 mm H × 48 mm Ø" },
];

const kitSummary = [
  "Premium capsule",
  "Ceramic mist core",
  "HEPA micro-filter",
  "USB-C charging",
  "Travel essentials",
];

const kitIncludes = [
  {
    icon: "case" as const,
    title: "Premium capsule",
    body: "Hand-finished aluminum body with a magnetic travel lid that feels at home on walnut or marble.",
  },
  {
    icon: "wave" as const,
    title: "Hospital-grade misting",
    lead: "Ultra-fine mist technology",
    body: "Ceramic 2.4 MHz core keeps the vapor velvety without soaking surfaces.",
    tooltip:
      "A 2.4 MHz ceramic transducer atomizes water into an ultra-fine mist faster than standard ultrasonic units.",
  },
  {
    icon: "filter" as const,
    title: "HEPA micro-filter",
    body: "Snap-in filter catches mineral build-up so the mist stays clean, even on the road.",
  },
  {
    icon: "plug" as const,
    title: "USB-C charging",
    body: "Pairs with any wall brick or power bank; the braided cable travels with the cap.",
  },
  {
    icon: "bag" as const,
    title: "Travel essentials",
    body: "Leak-proof cap, concentrate duo, and quickstart guide slip into the included pouch.",
  },
];

const kitBenefits = [
  {
    title: "Runs all night",
    description: "Up to 10 hours of mist with auto-shutoff—wake up to balanced humidity, not an empty reservoir.",
  },
  {
    title: "Quieter than a whisper",
    description: "22 dB output so you only hear yourself drift off, not a fan or white-noise machine.",
  },
  {
    title: "Carry-on ready",
    description: "210 g and leak-proof, it slides into your tote with the same cable that powers your phone.",
  },
];

const technicalSpecs = [
  { icon: "shield" as const, label: "Warranty", value: "2-year coverage with concierge replacements" },
  { icon: "clock" as const, label: "Runtime", value: "Up to 10 hrs on a single fill" },
  { icon: "sound" as const, label: "Noise", value: "22 dB (library quiet)" },
  { icon: "drop" as const, label: "Auto shutoff", value: "Turns off the moment the reservoir is empty" },
  { icon: "plug" as const, label: "Power", value: "USB-C, works with power banks" },
  { icon: "wave" as const, label: "Mist tech", value: "2.4 MHz ceramic transducer" },
];

const heroFaq = [
  {
    question: "Can I run it overnight?",
    answer: "Yes—AURADroplet mists for up to 10 hours and shuts off automatically when the tank empties.",
  },
  {
    question: "Is it carry-on friendly?",
    answer: "Pack it empty, breezes through security, then fill in the lounge or hotel sink before use.",
  },
  {
    question: "Can I add scent?",
    answer: "Use the water-based concentrates (or well-diluted oils) to keep the ceramic transducer happy.",
  },
];

const faqItems = [
  {
    question: "Where does AURADroplet work best?",
    answer: "Designed for ~12′ × 12′ bedrooms, hotel rooms, studios, and desks. Close doors for quickest results.",
  },
  {
    question: "Can I run it while I sleep?",
    answer: "Yes—mists up to 10 hours and powers down automatically when the reservoir is empty.",
  },
  {
    question: "Is it travel ready (planes + hotels)?",
    answer: "Pack it empty in carry-on, fill after security, and set it on the provided travel cap tray in your room.",
  },
  {
    question: "Does it add scent or purify air?",
    answer:
      "It’s a humidifier/diffuser: adds moisture and scent, but doesn’t remove pollutants. See Specs for filtration info.",
  },
  {
    question: "What water should I use?",
    answer: "Tap is fine; distilled keeps the mist ultra-fine and reduces mineral buildup inside the capsule.",
  },
  {
    question: "Can I use essential oils?",
    answer: "Stick to the water-based concentrates or dilute oils well—thick oils can clog the ceramic transducer.",
  },
  {
    question: "How quiet and powerful is it?",
    answer: "Outputs about 22 dB (library quiet) and covers up to ~400 sq ft when doors stay closed.",
  },
  {
    question: "How do I power and pack it?",
    answer:
      "USB-C from wall adapters, laptops, or power banks. The leak-proof cap seals the tank—still travel with it empty.",
  },
  {
    question: "How do I clean it + what’s the warranty?",
    answer:
      "Rinse weekly, descale monthly (1:1 vinegar + water, 5–10 min), swap the filter every ~6 months. Covered by a 2-year warranty + 30-day returns.",
  },
];

type IconName = "shield" | "clock" | "sound" | "drop" | "plug" | "case" | "wave" | "filter" | "bag";

function OutlineIcon({ type, className }: { type: IconName; className?: string }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (type) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3L5 5v6c0 5 3.6 9.3 7 10 3.4-.7 7-5 7-10V5l-7-2z" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 8v4l2.5 1.5" />
        </svg>
      );
    case "sound":
      return (
        <svg {...common}>
          <path d="M5 9v6h3l4 4V5l-4 4H5z" />
          <path d="M16 9.5c1 .75 1 .75 0 1.5m1.5-3c2 1.5 2 4.5 0 6" />
        </svg>
      );
    case "drop":
      return (
        <svg {...common}>
          <path d="M12 3s-5 6-5 9a5 5 0 0010 0c0-3-5-9-5-9z" />
        </svg>
      );
    case "plug":
      return (
        <svg {...common}>
          <path d="M9 3v4m6-4v4" />
          <path d="M7 9h10l-1 5a4 4 0 11-8 0L7 9z" />
        </svg>
      );
    case "case":
      return (
        <svg {...common}>
          <path d="M6 7a3 3 0 013-3h6a3 3 0 013 3v7a5 5 0 01-5 5h-2a5 5 0 01-5-5V7z" />
          <path d="M6 9h12" />
        </svg>
      );
    case "wave":
      return (
        <svg {...common}>
          <path d="M3.5 14c2.2-3.5 6.3-3.5 8.5 0s6.3 3.5 8.5 0" />
          <path d="M3.5 9c2.2-3.5 6.3-3.5 8.5 0s6.3 3.5 8.5 0" opacity="0.6" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <path d="M4 5h16l-6 7v4l-4 3v-7L4 5z" />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <path d="M7 9a5 5 0 0110 0" />
          <rect x="5" y="9" width="14" height="10" rx="3" />
        </svg>
      );
    default:
      return null;
  }
}

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "AURADroplet Portable Ultrasonic Humidifier",
  brand: {
    "@type": "Brand",
    name: "AURADroplet",
  },
  description:
    "Carry-on ultrasonic humidifier with USB-C power, auto-shutoff safety, and leak-proof travel cap.",
  image: [`${siteUrl}/auradroplet-hero.jpg`],
  sku: "AURADROPLET",
  offers: {
    "@type": "Offer",
    price: "68.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: productUrl,
    warranty: {
      "@type": "WarrantyPromise",
      durationOfWarranty: {
        "@type": "QuantitativeValue",
        value: 2,
        unitCode: "ANN",
      },
      warrantyScope: "Full coverage",
    },
  },
};

const steps = [
  {
    title: "Fill & seal",
    description: "Twist off the travel cap, add water or concentrate, and lock the leak-proof lid.",
  },
  {
    title: "Tap the halo",
    description: "Capacitive ring wakes the 2.4 MHz ceramic transducer for instant micro-mist.",
  },
  {
    title: "Dial your zone",
    description: "Choose 100 · 200 · 400 sq ft output modes; it powers down automatically when balanced.",
  },
];

const disabledCtaProps = needsVariantUpdate
  ? {
      "aria-disabled": true,
      tabIndex: -1,
      role: "link" as const,
    }
  : undefined;

export default function Home() {
  const primaryHref = needsVariantUpdate ? "#" : checkoutUrl;

  return (
    <main className="page">
      <header className="masthead">
        <span className="masthead__logo">AURADroplet</span>
        <a className="masthead__link" href="#faq">
          FAQs
        </a>
        <a className="button button--primary" href={primaryHref} {...disabledCtaProps}>
          Buy now — $68
        </a>
      </header>

      <section className="hero" id="top">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <div className="hero__inner">
          <div className="hero__copy">
            <span className="hero__tag">Real humidity. Instant calm.</span>
            <h1>Real humidity, anywhere.</h1>
            <p>
              A carry-on ultrasonic humidifier for hotel rooms and desks. Fills a 12 ft × 12 ft room in ~4 minutes†,
              runs for hours, and stays whisper-quiet.
            </p>

            <div className="hero__cta">
              <a className="button button--primary" href={primaryHref} {...disabledCtaProps}>
                Buy now — $68
              </a>
              <a className="hero__link" href="#details">
                See the kit →
              </a>
            </div>
            <p className="hero__policy">$68 • Free U.S. shipping • 30-day returns • 2-year warranty</p>

            <dl className="spec-rail">
              {heroSpecs.map((item) => (
                <div className="spec-rail__item" key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="hero__meta">
              <a className="hero__review" href="#reviews">
                <div className="hero__review-avatar" aria-hidden="true">MR</div>
                <div>
                  <div className="hero__review-rating" aria-label="Rated 4.8 out of 5 stars">
                    <span aria-hidden="true">★★★★★</span>
                    <span>4.8 (1,243 reviews)</span>
                  </div>
                  <blockquote>“Finally breathing again when I travel…”</blockquote>
                </div>
              </a>
              <p className="hero__availability">In stock • Ships in 24 hrs • Pay in 4 with Shop Pay</p>
            </div>

            <div className="hero-faq">
              {heroFaq.map((item, index) => (
                <details key={item.question} open={index === 0}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <figure className="hero__figure">
            <div className="hero__image-frame">
              <Image
                src="/auradroplet-hero.jpg"
                alt="AURADroplet diffuser releasing a column of mist on a wood nightstand beside a warm lamp."
                width={640}
                height={960}
                priority
              />
            </div>
            <figcaption>Photographed on location · Charleston Hotel Suite</figcaption>
          </figure>
        </div>
        <p className="hero__footnote">† Tested at 68°F / 45% RH with device centered at 30 in. height.</p>
      </section>

      <section className="section section--kit" id="details">
        <div className="kit">
          <div className="kit__intro">
            <h2>What’s in the kit</h2>
            <p className="kit__lede">Inside:</p>
            <ul className="kit__summary">
              {kitSummary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="kit__policies">Free shipping · 30-day trial · 2-year warranty</p>
          </div>

          <div className="kit__layout">
            <div className="kit__media">
              <figure className="kit__photo kit__photo--flat" aria-labelledby="kit-flatlay">
                <Image
                  src="/auradroplet-hero.jpg"
                  alt="AURADroplet capsule, filter, concentrate, and cable arranged on a walnut surface."
                  width={540}
                  height={360}
                />
                <figcaption id="kit-flatlay">Flatlay of the complete travel kit.</figcaption>
              </figure>
              <figure className="kit__photo kit__photo--lifestyle" aria-labelledby="kit-lifestyle">
                <Image
                  src="/auradroplet-hero.jpg"
                  alt="AURADroplet diffusing mist beside a warm bedside lamp."
                  width={540}
                  height={360}
                />
                <figcaption id="kit-lifestyle">Slip it onto a nightstand, hotel tray, or office desk.</figcaption>
              </figure>
              <button type="button" className="kit__video">
                <span>Watch mist in action · 0:10</span>
              </button>
            </div>

            <div className="kit__info">
              <div className="kit__includes">
                <h3>What’s included</h3>
                <ul>
                  {kitIncludes.map((item) => (
                    <li key={item.title}>
                      <OutlineIcon type={item.icon} className="kit__icon" />
                      <div>
                        <p className="kit__item-title">{item.title}</p>
                        <p className="kit__item-copy">
                          {item.lead ? (
                            <>
                              <span
                                className={item.tooltip ? "kit__tooltip" : undefined}
                                data-tooltip={item.tooltip}
                                tabIndex={item.tooltip ? 0 : undefined}
                              >
                                {item.lead}
                              </span>
                              {item.body ? <span> — {item.body}</span> : null}
                            </>
                          ) : (
                            item.body
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="kit__benefits">
                <h3>Why it matters</h3>
                <ul>
                  {kitBenefits.map((benefit) => (
                    <li key={benefit.title}>
                      <strong>{benefit.title}</strong>
                      <span>{benefit.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <details className="kit__specs">
                <summary>See specs +</summary>
                <ul className="kit__specs-list">
                  {technicalSpecs.map((spec) => (
                    <li key={spec.label}>
                      <OutlineIcon type={spec.icon} className="kit__icon" />
                      <div>
                        <span className="kit__spec-label">{spec.label}</span>
                        <span className="kit__spec-value">{spec.value}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className="strip strip--steps" aria-label="How AURADroplet works">
        <ol>
          {steps.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section section--faq" id="faq">
        <div className="faq">
          <div className="faq__intro">
            <h2>Common questions</h2>
            <p>
              Still unsure? Email <a href="mailto:hello@auradroplet.com">hello@auradroplet.com</a> or
              <a href="#contact" className="faq__chat"> chat with us →</a>
            </p>
          </div>
          <div className="faq__list">
            {faqItems.map((item, index) => (
              <details key={item.question} open={index < 2}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            }),
          }}
        />
      </section>

      <section className="section section--reviews" id="reviews">
        <div className="reviews">
          <h2>What travelers say</h2>
          <article className="review-card">
            <div className="review-card__avatar" aria-hidden="true">MR</div>
            <div>
              <p className="review-card__quote">
                “Hotel rooms used to wreck my voice. AURADroplet runs silent and packs with my charger.”
              </p>
              <p className="review-card__meta">Maya R. · Interior stylist · Verified buyer</p>
            </div>
          </article>
          <a className="reviews__link" href="#top">
            Read more stories
          </a>
        </div>
      </section>

      <section className="section section--cta">
        <div className="final-cta">
          <h2>Breathe again on your terms</h2>
          <p>Slide it in your carry-on, tap the halo, and let Shop Pay take care of the rest.</p>
          <div className="final-cta__actions">
            <a className="button button--primary" href={primaryHref} {...disabledCtaProps}>
              Buy now — $68
            </a>
            <a className="button button--ghost" href="#top">
              Back to top
            </a>
          </div>
        </div>
      </section>

      <nav className="sticky-cta" aria-label="Sticky checkout">
        <span className="sticky-cta__label">AURADroplet · $68</span>
        <a className="button button--primary" href={primaryHref} {...disabledCtaProps}>
          Buy now — $68
        </a>
      </nav>
    </main>
  );
}
