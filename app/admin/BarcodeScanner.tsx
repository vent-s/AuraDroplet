"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

export default function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (rawText: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Shipping labels use 1D Code 128 (USPS IMpb, UPS 1Z) barcodes; QR and
    // DataMatrix are included for labels that carry one alongside.
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
    ]);
    const reader = new BrowserMultiFormatReader(hints);
    let stopped = false;
    let controls: { stop: () => void } | undefined;

    async function start() {
      if (!videoRef.current) return;
      try {
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current,
          (result) => {
            if (result && !stopped) {
              stopped = true;
              controls?.stop();
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate(100);
              }
              onDetected(result.getText());
            }
          },
        );
      } catch (err) {
        console.error("Camera start failed.", err);
        setError(
          "Could not open the camera. Allow camera access for this site, or type the tracking number manually.",
        );
      }
    }

    void start();
    return () => {
      stopped = true;
      controls?.stop();
    };
    // The scanner mounts once per open; callbacks are stable for its lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-nova-navyDeep/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(8,37,84,0.5)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-nova-navy">
            Scan the shipping label
          </p>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm font-semibold text-nova-inkSoft transition hover:text-nova-navy"
          >
            Close
          </button>
        </div>
        {error ? (
          <p className="px-5 pb-6 text-sm leading-relaxed text-red-700">
            {error}
          </p>
        ) : (
          <>
            <div className="relative bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} className="h-72 w-full object-cover" />
              <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 rounded bg-nova-gold shadow-[0_0_12px_rgba(212,167,44,0.9)]" />
            </div>
            <p className="px-5 py-4 text-xs leading-relaxed text-nova-inkSoft">
              Point the camera at the barcode on the label. The tracking number
              fills in automatically when it&apos;s read.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
