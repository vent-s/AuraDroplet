import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURADroplet",
  description: "Minimal Shopify quick-checkout landing page for AURADroplet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
