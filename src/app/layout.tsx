import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "BIDME — Bid Smart. Own More. | Sri Lanka's Modern Online Auction Marketplace",
  description:
    "Sri Lanka's premier technology-driven online auction marketplace. Certified luxury watches, supercars, electronics, ceylon gemstones, and collectibles with anti-sniping protection, PayHere escrow, and Google Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#F5F7FB] dark:bg-[#0B0F17] text-[#172033] dark:text-[#F8FAFC] antialiased selection:bg-[#2457E6] selection:text-white transition-colors duration-200">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
