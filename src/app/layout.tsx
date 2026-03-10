import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GarageProvider } from "@/components/garage-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fatman Parts",
  description: "OEM parts with verified fitment and fast U.S. shipping.",
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
            <SiteHeader />
            {children}
            <SiteFooter />
          </GarageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
