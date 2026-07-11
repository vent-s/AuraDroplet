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
    // DataMatrix are included because USPS labels carry DataMatrix codes with
    // the same payload, which are much easier to read at an angle.
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints);
    let stopped = false;
    let controls: { stop: () => void } | undefined;

    async function start() {
      if (!videoRef.current) return;
      try {
        controls = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: "environment",
              // A dense 22-digit IMpb barcode needs resolution to resolve its
              // narrow bars; low-res defaults are the usual cause of no-reads.
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
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
            <div className="relative overflow-hidden bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} className="h-96 w-full object-cover" />
              {/* Target frame: fit the barcode inside the rectangle. The
                  surrounding box-shadow dims everything outside it. */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-nova-gold shadow-[0_0_0_9999px_rgba(8,37,84,0.55)]">
                <span className="absolute -left-0.5 -top-0.5 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-nova-gold" />
                <span className="absolute -right-0.5 -top-0.5 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-nova-gold" />
                <span className="absolute -bottom-0.5 -left-0.5 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-nova-gold" />
                <span className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-nova-gold" />
                <span className="absolute inset-x-3 top-1/2 h-0.5 -translate-y-1/2 animate-pulse rounded bg-nova-gold shadow-[0_0_12px_rgba(212,167,44,0.9)]" />
              </div>
              <p className="absolute inset-x-0 bottom-3 text-center text-xs font-semibold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
                Fit the barcode inside the frame
              </p>
            </div>
            <p className="px-5 py-4 text-xs leading-relaxed text-nova-inkSoft">
              Line the wide barcode under &quot;USPS TRACKING #&quot; (or the
              big UPS barcode) up inside the gold frame, 4&ndash;8 inches away,
              and hold still. The square codes on the label work too. It fills
              in automatically when read.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
