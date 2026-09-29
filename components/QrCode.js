"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrCode({ value, size = 168 }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!value) return;
    let cancel = false;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: "#111111", light: "#ffffff" },
    }).then((url) => {
      if (!cancel) setSrc(url);
    });
    return () => {
      cancel = true;
    };
  }, [value, size]);

  if (!src) return <div className="qr-img" style={{ width: size, height: size }} aria-hidden="true" />;
  return <img className="qr-img" src={src} width={size} height={size} alt={`QR code ${value}`} />;
}
