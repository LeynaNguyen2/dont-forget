import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";

import AuthProvider from "@/components/AuthProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { getSession } from "@/lib/session";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Don't Forget",
  description: "Your AI-powered morning briefing app",
  manifest: "/manifest.json",
  applicationName: "Don't Forget",
  appleWebApp: {
    capable: true,
    title: "Don't Forget",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  verification: {
    google: "jQzXNVVP90d5KTDlVb8xynZbU9ol40V7VaqmNaJJZV8",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Don't Forget",
  },
};

export const viewport: Viewport = {
  themeColor: "#3B6FE8",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider session={session}>{children}</AuthProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
