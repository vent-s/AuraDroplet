'use client';

import Image from 'next/image';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen, cartCount, initiateCheckout, isCheckingOut } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50 animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FAF9F7] z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E6E3]">
          <h2 className="text-2xl font-light text-[#3A3834] tracking-tight">
            Your Bag ({cartCount})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-[#6B6762] hover:text-[#3A3834] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                className="w-16 h-16 text-[#E8E6E3] mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <p className="text-lg text-[#6B6762] font-light mb-2">Your bag is empty</p>
              <p className="text-sm text-[#9B9792] font-light">Add some items to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white p-4 border border-[#E8E6E3]">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-base font-light text-[#3A3834] mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-[#9B9792] font-light mb-2">
                      ${item.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-auto">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-[#E8E6E3] text-[#6B6762] hover:border-[#C4A27F] hover:text-[#C4A27F] transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-[#3A3834] w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-[#E8E6E3] text-[#6B6762] hover:border-[#C4A27F] hover:text-[#C4A27F] transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-xs text-[#9B9792] hover:text-[#C4723F] transition-colors underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-[#E8E6E3] p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg">
              <span className="font-light text-[#6B6762]">Subtotal</span>
              <span className="font-medium text-[#3A3834]">${cartTotal.toFixed(2)}</span>
            </div>

            <p className="text-xs text-[#9B9792] font-light">
              Shipping calculated at checkout
            </p>

            {/* Checkout Button */}
            <button
              onClick={initiateCheckout}
              disabled={isCheckingOut}
              className="w-full h-14 bg-[#C4A27F] text-white font-medium tracking-wider text-sm hover:bg-[#8B7355] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCheckingOut ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  PROCESSING...
                </>
              ) : (
                'CHECKOUT'
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full h-12 border-2 border-[#E8E6E3] text-[#6B6762] font-medium tracking-wider text-sm hover:border-[#C4A27F] hover:text-[#3A3834] transition-all duration-300"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </div>
    </>
  );
}
