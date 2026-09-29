import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Carte de visite NFC",
  description: "Cartes de visite digitales NFC",
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#111111" };

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
