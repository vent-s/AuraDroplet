import { Product } from '../context/CartContext';

export const products: Product[] = [
  {
    id: 'stone-diffuser',
    name: 'Stone Diffuser',
    price: 40.00,
    originalPrice: 129.99,
    discount: 25,
    image: '/DiffProductShot.png',
    category: 'Diffusers',
    badge: 'bestseller',
    description: 'Timeless design meets aromatherapy. The Stone Diffuser features a sleek ceramic finish and ultrasonic technology for whisper-quiet misting.',
    variantId: 'gid://shopify/ProductVariant/50647405822230'
  },
  {
    id: 'rose-petal-oil',
    name: 'Rose Petal Essential Oil',
    price: 9.99,
    image: '/RoseProduct.jpg',
    category: 'Essential Oils',
    description: 'Luxurious rose essence with geranium and musk notes. 15ml of pure botanical bliss.',
    variantId: 'gid://shopify/ProductVariant/50647404806422'
  },
  {
    id: 'lavender-oil',
    name: 'Lavender Essential Oil',
    price: 9.99,
    image: '/Lavender.jpg',
    category: 'Essential Oils',
    badge: 'bestseller',
    description: 'Calming lavender with bergamot and chamomile. Perfect for relaxation and restful sleep. 15ml.',
    variantId: 'gid://shopify/ProductVariant/50647396581654'
  },
  {
    id: 'jasmine-oil',
    name: 'Jasmine Essential Oil',
    price: 9.99,
    image: '/Jasmine.jpg',
    category: 'Essential Oils',
    description: 'Exotic white florals with bright citrus peel. Intoxicating and uplifting. 15ml.',
    variantId: 'gid://shopify/ProductVariant/50647401922838'
  },
  {
    id: 'mint-oil',
    name: 'Mint Leaf Essential Oil',
    price: 9.99,
    image: '/Mint.jpg',
    category: 'Essential Oils',
    description: 'Crisp peppermint with basil and green tea. Refreshing and invigorating. 15ml.',
    variantId: 'gid://shopify/ProductVariant/50647402479894'
  },
  {
    id: 'vanilla-oil',
    name: 'Vanilla Essential Oil',
    price: 9.99,
    image: '/Vanilla.jpg',
    category: 'Essential Oils',
    badge: 'new',
    description: 'Rich vanilla bean with warm amber and sandalwood. Comforting and grounding. 15ml.',
    variantId: 'gid://shopify/ProductVariant/50647401234710'
  },
  {
    id: 'ocean-mist-oil',
    name: 'Ocean Mist Essential Oil',
    price: 9.99,
    image: '/Ocean.jpg',
    category: 'Essential Oils',
    description: 'Coastal breeze captured in a bottle. Sea salt, driftwood, and marine notes. 15ml.',
    variantId: 'gid://shopify/ProductVariant/50647404413206'
  },
];
