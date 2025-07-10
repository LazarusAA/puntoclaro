import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: true, // Preload the primary font
});

export const metadata: Metadata = {
  title: "Umbral - Diagnóstico PAA Gratis | Prepárate para la Universidad",
  description: "Descubre gratis en 90 segundos cuáles son las 3 áreas que de verdad necesitas mejorar para asegurar tu futuro con la PAA. Diagnóstico personalizado para TEC y UCR.",
  keywords: [
    "PAA",
    "examen admisión",
    "TEC",
    "UCR", 
    "diagnóstico gratis",
    "preparación universitaria",
    "Costa Rica",
    "estudio personalizado"
  ],
  authors: [{ name: "Umbral" }],
  creator: "Umbral",
  publisher: "Umbral",
  metadataBase: new URL("https://umbral.cr"), // Replace with your domain
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CR",
    url: "https://umbral.cr", // Replace with your domain
    title: "Umbral - Diagnóstico PAA Gratis | Prepárate para la Universidad",
    description: "Descubre gratis en 90 segundos cuáles son las 3 áreas que de verdad necesitas mejorar para asegurar tu futuro con la PAA.",
    siteName: "Umbral",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Umbral - Diagnóstico PAA Gratis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Umbral - Diagnóstico PAA Gratis | Prepárate para la Universidad",
    description: "Descubre gratis en 90 segundos cuáles son las 3 áreas que de verdad necesitas mejorar para asegurar tu futuro con la PAA.",
    images: ["/og-image.png"], // You'll need to create this
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code", // Add when you set up Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
