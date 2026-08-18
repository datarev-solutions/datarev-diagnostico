import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppProvider } from "@/components/AppProvider";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diagnóstico de Madurez en Datos e IA · DataRev",
  description:
    "Evalúa la madurez en Datos e Inteligencia Artificial de tu organización en 8 dimensiones y recibe un roadmap de acciones priorizadas. Sin costo. Español / English.",
  metadataBase: new URL("https://datarev.solutions"),
  icons: { icon: "/brand/favicon.png", apple: "/brand/favicon.png" },
  openGraph: {
    title: "Diagnóstico de Madurez en Datos e IA · DataRev",
    description:
      "8 dimensiones, 5 niveles y un roadmap priorizado. Hazlo solo o en una sesión de una hora sin costo con un consultor de DataRev.",
    siteName: "DataRev — Data Revolution",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <SessionProvider>
          <AppProvider>{children}</AppProvider>
        </SessionProvider>
        {/* Page-level traffic, from the platform this already deploys to.
            Outside the providers on purpose: it renders null, subscribes to
            nothing in this tree, and must not sit between the providers and
            the page they serve. Product events — who started the assessment,
            who hit the paywall — go to `events` via lib/analytics.ts; this
            only answers "how many people arrived, and on what". */}
        <Analytics />
      </body>
    </html>
  );
}
