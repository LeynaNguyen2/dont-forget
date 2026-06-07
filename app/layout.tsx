import type { Metadata, Viewport } from "next";
import { getServerSession } from "next-auth";

import AuthProvider from "@/components/AuthProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { authOptions } from "@/lib/auth";
import "./globals.css";

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
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Don't Forget",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider session={session}>{children}</AuthProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
