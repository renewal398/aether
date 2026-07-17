import "@/app/globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Aether Cloud EHR | Enterprise Health Records Platform",
  description: "Next-generation, secure, and compliant cloud-native electronic medical records framework for hospital systems, clinical networks, and pharmacies.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <script src="/sw-register.js" defer />
      </head>
      <body>{children}</body>
    </html>
  );
}
