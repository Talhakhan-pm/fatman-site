import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono, IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { GarageProvider } from "@/components/garage-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { CartProvider } from "@/components/cart-provider";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import NextTopLoader from "nextjs-toploader";
import Script from "next/script";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Category v2 display stack — Archivo for display, Manrope for body, Plex Mono
// for spec-sheet labels. Declared here so every route can opt in via CSS vars.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// viewport-fit=cover is required for env(safe-area-inset-*) to resolve to
// non-zero values on notch/home-indicator iPhones; without it the bottom-nav,
// cart-toast, and PDP buy-bar safe-area offsets are inert.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
  verification: {
    google: "Ip7j7Iu1pnDoL_-il68ROJrjBaYUUmKBr9Q-g7J929I",
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
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-XY67JLB385";
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en">
      <body data-theme="dark" className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${manrope.variable} ${plexMono.variable} antialiased`}>
        {gtmId && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {/* hidden on phones: the bottom-nav view transitions are the load
            feedback there, and the top bar flashing over them reads as jitter */}
        <div className="hidden md:block">
          <NextTopLoader color="#ea580c" showSpinner={false} />
        </div>
        <ThemeProvider>
          <GarageProvider>
            <CartProvider>
              <SiteHeader />
              {children}
              <SiteFooter />
              <ThemeToggleButton />
              <MobileBottomNav />
            </CartProvider>
          </GarageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
