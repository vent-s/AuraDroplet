// Extracts a tracking number from a scanned shipping-label barcode. Label
// barcodes carry more than the tracking number: USPS IMpb barcodes prefix a
// "420" routing application identifier plus the destination ZIP (5 or 9
// digits) ahead of the 20-26 digit tracking number, and GS1 separators can
// appear as non-alphanumeric noise.

import type { CarrierId } from "./orders";

export interface ScannedTracking {
  number: string;
  carrier: CarrierId;
}

export function extractTrackingFromScan(raw: string): ScannedTracking | null {
  const cleaned = raw.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  if (!cleaned) return null;

  const ups = /1Z[0-9A-Z]{16}/.exec(cleaned);
  if (ups) {
    return { number: ups[0], carrier: "ups" };
  }

  // Strip the IMpb routing prefix before matching the USPS tracking number.
  const withoutRouting = cleaned.replace(/^420\d{9}(?=9\d{19,})/, "").replace(
    /^420\d{5}(?=9\d{19,})/,
    "",
  );
  const usps = /9\d{19,25}$/.exec(withoutRouting);
  if (usps) {
    return { number: usps[0], carrier: "usps" };
  }

  // FedEx-style 12/15-digit numbers or anything else recognizable.
  const digits = /\d{10,}$/.exec(withoutRouting);
  if (digits) {
    return { number: digits[0], carrier: "other" };
  }

  return null;
}
