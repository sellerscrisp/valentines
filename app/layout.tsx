import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Great_Vibes } from "next/font/google";
import { Inter } from "next/font/google";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Breaking: Putin Launches First Missile Strike",
  description:
    "Russia Times Exclusive: In a stunning twist of events, President Putin has launched his first missile strike. Experts are baffled and the world watches in suspense. Read the full report for all the jaw-dropping details.",
  openGraph: {
    title: "Breaking: Putin Launches First Missile Strike",
    description:
      "Russia Times Exclusive: In an unprecedented move, President Putin has launched his first missile strike. Discover the shocking details and reactions from around the globe.",
    url: "https://abby.crisp.sh",
    siteName: "Russia Times",
    images: [
      {
        url: "https://www.ft.com/__origami/service/image/v2/images/raw/ftcms%3Af44a3ec4-c1e8-449b-a3b6-9704756ff41d?source=next-article&fit=scale-down&quality=highest&width=1440&dpr=1",
        width: 1200,
        height: 630,
        alt: "Putin Launching Missile Strike",
      },
    ],
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Breaking: Putin Launches First Missile Strike",
    description:
      `Russia Times Exclusive: Putin's first missile strike has rocked the world. Click to read the full, unbelievable story.}`,
    images: [
      "https://www.ft.com/__origami/service/image/v2/images/raw/ftcms%3Af44a3ec4-c1e8-449b-a3b6-9704756ff41d?source=next-article&fit=scale-down&quality=highest&width=1440&dpr=1",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.className} overflow-x-hidden bg-background`}>
        <main>
          <SessionProvider>
            {children}
          </SessionProvider>
          <Toaster />
          <div className={`${greatVibes.className}`}>
          </div>
        </main>
      </body>
    </html>
  );
}
