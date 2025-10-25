# Shopify Checkout Integration - Setup Guide

## ✅ What's Been Implemented

Your AuraDroplet site now has full Shopify checkout integration with:
- 🛒 Shopping cart with add/remove/update functionality
- 💾 Cart persistence (saved in browser localStorage)
- 🔄 Real-time cart updates
- ✨ Checkout button that redirects to Shopify hosted checkout
- 📱 Responsive cart drawer
- 🎨 Beautiful loading states

## 🔧 Setup Steps

### Step 1: Get Your Shopify Credentials

1. **Log into your Shopify Admin** at `your-store.myshopify.com/admin`

2. **Create a Custom App**:
   - Go to **Settings** → **Apps and sales channels**
   - Click **Develop apps**
   - Click **Create an app**
   - Name it "AuraDroplet Website" or similar
   - Click **Create app**

3. **Configure API Access**:
   - Go to **Configuration** tab
   - Under **Storefront API**, click **Configure**
   - Select these permissions:
     - ✅ `unauthenticated_read_product_listings`
     - ✅ `unauthenticated_write_checkouts`
     - ✅ `unauthenticated_read_checkouts`
   - Click **Save**

4. **Get Your Access Token**:
   - Go to **API credentials** tab
   - Under **Storefront API access token**, click **Install app**
   - Copy the Storefront API access token (starts with `shpat_`)
   - ⚠️ **Important**: Save this token immediately - it's only shown once!

### Step 2: Update .env.local File

Open `.env.local` in your project and update these values:

```bash
# Your store domain (example: auradroplet.myshopify.com)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com

# The Storefront API token you just copied
SHOPIFY_STOREFRONT_TOKEN=shpat_your_actual_token_here
```

### Step 3: Get Product Variant IDs

You need to get the Shopify variant IDs for each product:

#### Method 1: Using Shopify Admin API (Recommended)

1. In Shopify Admin, go to **Products**
2. Click on a product
3. Look at the URL: `admin/products/1234567890`
4. The number is your Product ID

To get the Variant ID, you can use the GraphQL Admin API:
```graphql
{
  product(id: "gid://shopify/Product/YOUR_PRODUCT_ID") {
    variants(first: 10) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
}
```

#### Method 2: Using Product Handle

Update `app/data/products.ts` - replace each `REPLACE_WITH_YOUR_VARIANT_ID_X` with the actual Shopify variant IDs.

Example:
```typescript
{
  id: 'stone-diffuser',
  name: 'Stone Diffuser',
  price: 97.49,
  // Change this:
  variantId: 'gid://shopify/ProductVariant/REPLACE_WITH_YOUR_VARIANT_ID_1'
  // To this:
  variantId: 'gid://shopify/ProductVariant/48123456789012'
},
```

### Step 4: Match Products to Shopify

Ensure each product in `app/data/products.ts` has a corresponding product in your Shopify store with the correct:
- Name
- Price
- Image
- Variant ID

### Step 5: Restart Your Dev Server

```bash
npm run dev
```

## 🧪 Testing the Integration

1. **Visit your shop page**: http://localhost:3000/shop
2. **Add items to cart**: Click "ADD TO BAG" on any product
3. **Open cart drawer**: Click the CART button or view the cart count
4. **Adjust quantities**: Use +/- buttons to update quantities
5. **Proceed to checkout**: Click the "CHECKOUT" button
6. **Complete purchase**: You'll be redirected to Shopify's hosted checkout page

## 🚀 How It Works

### Cart Flow:
1. User clicks "Add to Cart" → Product added to local cart state
2. Cart saved to localStorage → Persists between page reloads
3. User clicks "Checkout" → API call to `/api/cart/create`
4. Server creates Shopify cart → Returns checkout URL
5. User redirected to Shopify → Completes purchase on Shopify's secure checkout

### Files Modified:
- ✅ `app/context/CartContext.tsx` - Cart state management + localStorage
- ✅ `app/components/CartDrawer.tsx` - Updated with checkout button
- ✅ `app/api/cart/create/route.ts` - New API endpoint for checkout
- ✅ `app/data/products.ts` - Added variantId fields
- ✅ `.env.local` - Environment variables (you need to fill this)
- ✅ `.gitignore` - Added .env.local to prevent committing secrets

## 🔒 Security Notes

- ✅ Storefront API tokens are **PUBLIC** tokens - safe for client-side use
- ✅ `.env.local` is gitignored - won't be committed to GitHub
- ✅ All checkout processing happens on Shopify's secure servers
- ✅ No payment information is stored on your server

## 🎯 Next Steps (Optional)

### Add Embedded Checkout (Requires Shopify Plus)
If you have Shopify Plus, you can embed checkout directly on your site:
1. Enable Shopify Checkout Extensibility
2. Install `@shopify/app-bridge-react`
3. Implement embedded checkout component

### Add Analytics
Track cart events:
```javascript
// In CartContext.tsx addToCart function
gtag('event', 'add_to_cart', {
  items: [{ id: product.id, name: product.name, price: product.price }]
});
```

### Add Discount Codes
Modify the checkout API to include discount codes:
```typescript
const { data } = await shopifyFetch(GQL.cartCreate, {
  lines,
  discountCodes: ['SUMMER20']
});
```

## 🐛 Troubleshooting

### "Missing Shopify configuration" error
- Check `.env.local` file exists
- Verify `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN` are set
- Restart dev server after changing .env.local

### "Unable to create checkout" error
- Verify variant IDs are correct in `products.ts`
- Check products exist in your Shopify store
- Ensure products are set to "Active" in Shopify

### Cart is empty after page reload
- Check browser console for localStorage errors
- Ensure cookies/localStorage are enabled

### Checkout button does nothing
- Open browser console to see error messages
- Verify API route exists at `/api/cart/create/route.ts`
- Check network tab for failed API calls

## 📞 Support

For Shopify API questions: https://shopify.dev/docs
For this integration: Check browser console and network tab for errors

---

**Your shopping cart is now fully integrated with Shopify! 🎉**
