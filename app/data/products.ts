import { Product } from '../context/CartContext';

export const products: Product[] = [
  {
    id: 'stone-diffuser',
    name: 'Stone Diffuser',
    price: 97.49,
    originalPrice: 129.99,
    discount: 25,
    image: '/auradroplet-hero.jpg',
    category: 'Diffusers',
    badge: 'bestseller',
    description: 'Timeless design meets aromatherapy. The Stone Diffuser features a sleek ceramic finish and ultrasonic technology for whisper-quiet misting.'
  },
  {
    id: 'cloud-humidifier',
    name: 'Cloud Humidifier',
    price: 208.99,
    originalPrice: 244.99,
    discount: 15,
    image: '/auradroplet-hero.jpg',
    category: 'Humidifiers',
    badge: 'bestseller',
    description: 'Transform your space with the Cloud Humidifier. Dual functionality combines essential oil diffusion with powerful humidification for ultimate comfort.'
  },
  {
    id: 'air-cordless-diffuser',
    name: 'Air Cordless Diffuser',
    price: 164.99,
    image: '/auradroplet-hero.jpg',
    category: 'Diffusers',
    badge: 'new',
    description: 'Freedom redefined. The Air Cordless Diffuser offers portable aromatherapy with up to 8 hours of battery life and USB-C charging.'
  },
  {
    id: 'air-waterless-diffuser',
    name: 'Air Waterless Diffuser',
    price: 149.99,
    image: '/auradroplet-hero.jpg',
    category: 'Diffusers',
    badge: 'bestseller',
    description: 'Pure essential oils, no water needed. Our waterless nebulizing technology delivers the most potent aromatherapy experience.'
  },
  {
    id: 'rose-petal-oil',
    name: 'Rose Petal Essential Oil',
    price: 24.99,
    image: '/RoseProduct.jpg',
    category: 'Essential Oils',
    description: 'Luxurious rose essence with geranium and musk notes. 15ml of pure botanical bliss.'
  },
  {
    id: 'lavender-oil',
    name: 'Lavender Essential Oil',
    price: 22.99,
    image: '/Lavender.jpg',
    category: 'Essential Oils',
    badge: 'bestseller',
    description: 'Calming lavender with bergamot and chamomile. Perfect for relaxation and restful sleep. 15ml.'
  },
  {
    id: 'jasmine-oil',
    name: 'Jasmine Essential Oil',
    price: 26.99,
    image: '/Jasmine.jpg',
    category: 'Essential Oils',
    description: 'Exotic white florals with bright citrus peel. Intoxicating and uplifting. 15ml.'
  },
  {
    id: 'mint-oil',
    name: 'Mint Leaf Essential Oil',
    price: 21.99,
    image: '/Mint.jpg',
    category: 'Essential Oils',
    description: 'Crisp peppermint with basil and green tea. Refreshing and invigorating. 15ml.'
  },
  {
    id: 'vanilla-oil',
    name: 'Vanilla Essential Oil',
    price: 28.99,
    image: '/vanilla.jpg',
    category: 'Essential Oils',
    badge: 'new',
    description: 'Rich vanilla bean with warm amber and sandalwood. Comforting and grounding. 15ml.'
  },
  {
    id: 'ocean-mist-oil',
    name: 'Ocean Mist Essential Oil',
    price: 23.99,
    image: '/Ocean.jpg',
    category: 'Essential Oils',
    description: 'Coastal breeze captured in a bottle. Sea salt, driftwood, and marine notes. 15ml.'
  },
];
