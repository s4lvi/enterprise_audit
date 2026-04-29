import type { Metadata } from "next";
import "./globals.css";

import { BackgroundSash } from "@/components/background-sash";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Enterprise DB",
  description: "Track and audit business-development chapters' enterprises and ventures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen">
        <BackgroundSash />
        <div className="relative" style={{ zIndex: 1 }}>
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
