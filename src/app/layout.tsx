import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GarageProvider } from "@/components/garage-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { CartProvider } from "@/components/cart-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fatmanparts.com"),
  title: {
    default: "Fatman Parts",
    template: "%s | Fatman Parts",
  },
  description: "OEM parts with verified fitment, clear pricing, and fast U.S. shipping.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Fatman Parts",
    description: "OEM parts with verified fitment, clear pricing, and fast U.S. shipping.",
    url: "https://fatmanparts.com",
    siteName: "Fatman Parts",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/brand/fatman-primary-horizontal.png",
        width: 1200,
        height: 630,
        alt: "Fatman Parts logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fatman Parts",
    description: "OEM parts with verified fitment, clear pricing, and fast U.S. shipping.",
    images: ["/brand/fatman-primary-horizontal.png"],
  },
  icons: {
    icon: [
      { url: "/brand/fatman-fp-shield.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/fatman-fp-shield.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/brand/fatman-fp-shield.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/brand/fatman-fp-shield.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body data-theme="dark" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <GarageProvider>
            <CartProvider>
              <SiteHeader />
              {children}
              <SiteFooter />
              <ThemeToggleButton />
            </CartProvider>
          </GarageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
