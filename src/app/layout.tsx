import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const serifFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Krishna Invitations • Luxury Digital Invitations for Every Celebration",
  description:
    "Design and share bespoke digital invitations for Weddings, Gruh Vastu, Engagements, Baby Showers, Birthdays, and cultural festivities with instant WhatsApp RSVPs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${serifFont.variable}`}>
      <body className="min-h-screen font-sans antialiased text-stone-900 bg-[#FAF8F5]">
        {children}
      </body>
    </html>
  );
}
