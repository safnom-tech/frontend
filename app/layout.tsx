import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import { BrandThemeScript } from "@/components/BrandThemeScript";
import { ThemeScript } from "@/components/ThemeScript";
import { brandLogo } from "@/config/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const brandWord = Plus_Jakarta_Sans({
  variable: "--font-brand-word",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "SafNom — Build your business website without code",
  description:
    "Affordable all-in-one platform for small businesses, local vendors, and entrepreneurs. Professional websites, hosting, and AI tools in one place.",
  icons: {
    icon: [{ url: brandLogo.iconSrc, type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} ${brandWord.variable} h-full antialiased`}
    >
      <head>
        <BrandThemeScript />
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
