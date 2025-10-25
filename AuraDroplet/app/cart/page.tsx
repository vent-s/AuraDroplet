'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import FreeScentSelector from '@/app/components/FreeScentSelector';
import { Scent } from '@/lib/types';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getPromoTracker, addToCart } = useCart();
  const [isScentSelectorOpen, setIsScentSelectorOpen] = useState(false);
  const [scentForDiffuserId, setScentForDiffuserId] = useState<string | null>(null);

  const promoTracker = getPromoTracker();

  const handleOpenScentSelector = (diffuserId?: string) => {
    setScentForDiffuserId(diffuserId || null);
    setIsScentSelectorOpen(true);
  };

  const handleSelectScent = (scent: Scent | null) return null => {
    if (scent) {
      // Find first unclaimed diffuser if no specific one was targeted
      const targetDiffuser = scentForDiffuserId ||
        cart.items.find(item =>
          item.product.category === 'diffuser' &&
          !cart.items.some(i => i.linkedTo === item.product.id)
        )?.product.id;

      if (targetDiffuser) {
        addToCart(scent, 1, true, targetDiffuser);
      }
    }
  };

  if (cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-24 text-center">
          <h1 className="text-4xl font-light tracking-wide mb-4">Your cart is empty</h1>
          <p className="text-gray-600 font-light mb-8">Start your ritual with the Aura Diffuser</p>
          <Link
            href="/"
            className="inline-block bg-gray-900 text-white px-10 py-4 rounded-sm font-light tracking-wider hover:bg-gray-800 transition-all"
          >
            Build Your Ritual
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-8 lg:px-12 py-16">
        <h1 className="text-4xl lg:text-5xl font-light tracking-wide mb-12">Your Cart</h1>

        {/* Unclaimed Free Scent Banner */}
        {promoTracker.unclaimedDiffusers > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-light tracking-wide mb-1">
                  You have {promoTracker.unclaimedDiffusers} Free Scent{promoTracker.unclaimedDiffusers > 1 ? 's' : ''} to claim!
                </h3>
                <p className="text-sm text-gray-600 font-light">
                  Each diffuser includes a complimentary 15ml essence
                </p>
              </div>
              <button
                onClick={() => handleOpenScentSelector()}
                className="bg-gray-900 text-white px-6 py-3 rounded-sm font-light tracking-wider hover:bg-gray-800 transition-all whitespace-nowrap"
              >
                Pick Your Scent
              </button>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {promoTracker.diffusersInCart > 1 && (
          <div className="mb-6 text-sm text-gray-600 font-light">
            Free Scents claimed: {promoTracker.freeScentsClaimed}/{promoTracker.diffusersInCart}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <div
                key={item.product.id + (item.isFreePromo ? '-free' : '')}
                className="flex gap-6 p-6 bg-white border border-gray-200 rounded-sm"
              >
                {/* Image */}
                <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                  {item.isFreePromo && (
                    <div className="absolute top-2 right-2 bg-gray-900 text-white px-2 py-1 rounded-sm text-xs font-light">
                      FREE
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-light text-lg tracking-wide mb-1">
                        {item.product.name}
                      </h3>
                      {item.product.category === 'essence' && 'brand' in item.product && (
                        <p className="text-xs text-gray-500 font-light tracking-widest">
                          {item.product.brand}
                        </p>
                      )}
                      {item.isFreePromo && (
                        <p className="text-sm text-green-700 font-light mt-1">
                          Free with diffuser purchase
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center gap-3 border border-gray-200 rounded-sm">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        disabled={item.isFreePromo}
                      >
                        −
                      </button>
                      <span className="font-light">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        disabled={item.isFreePromo}
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {item.isFreePromo ? (
                        <div>
                          <p className="text-lg font-light">$0.00</p>
                          <p className="text-sm text-gray-400 line-through font-light">
                            ${item.product.price}
                          </p>
                        </div>
                      ) : (
                        <p className="text-lg font-light">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gray-50 rounded-sm p-8 space-y-6">
              <h2 className="text-2xl font-light tracking-wide">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-light">Subtotal</span>
                  <span className="font-light">${cart.subtotal.toFixed(2)}</span>
                </div>

                {cart.promoSavings > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span className="font-light">Promo savings</span>
                    <span className="font-light">-${cart.promoSavings.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="font-light">Shipping</span>
                  <span className="font-light">
                    {cart.subtotal >= 50 ? 'FREE' : '$5.00'}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg">
                  <span className="font-light">Total</span>
                  <span className="font-light">
                    ${(cart.total + (cart.subtotal >= 50 ? 0 : 5)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button className="w-full bg-gray-900 text-white py-4 rounded-sm font-light tracking-wider hover:bg-gray-800 transition-all">
                Continue to Checkout
              </button>

              <p className="text-xs text-center text-gray-500 font-light">
                {cart.subtotal >= 50
                  ? 'Free shipping applied'
                  : `Add $${(50 - cart.subtotal).toFixed(2)} more for free shipping`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Free Scent Selector Modal */}
      <FreeScentSelector
        selectedScent={null}
        onSelect={handleSelectScent}
        isOpen={isScentSelectorOpen}
        onClose={() => setIsScentSelectorOpen(false)}
      />
    </main>
  );
}
