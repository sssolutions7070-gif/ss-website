import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { SITE_URL, company } from "@/data/company";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { Cursor } from "@/components/ui/Cursor";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { EXTENSION_ATTR_SCRIPT, THEME_INIT_SCRIPT } from "@/hooks/useTheme";
import { IntroLoader, INTRO_SCRIPT } from "@/components/layout/IntroLoader";
import { ScrollTint } from "@/components/ui/ScrollTint";
import { Spotlight } from "@/components/graphics/Spotlight";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { PageTransitionProvider } from "@/components/providers/PageTransition";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { CommandMenu } from "@/components/ui/CommandMenu";
import { SoundEffects } from "@/components/ui/SoundToggle";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { GlobalFx } from "@/components/fx/GlobalFx";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Self-hosted variable fonts (no network needed at build or dev time).
const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});
const display = localFont({
  src: "./fonts/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-display",
  weight: "300 700",
  display: "swap",
});
const mono = localFont({
  src: "./fonts/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-mono",
  weight: "100 800",
  display: "swap",
});

// Hindi / Marathi — only downloaded when Devanagari text is on screen (unicode-range).
const deva = localFont({
  src: "./fonts/noto-sans-devanagari-devanagari-wght-normal.woff2",
  variable: "--font-deva",
  weight: "100 900",
  display: "swap",
  preload: false,
  declarations: [{ prop: "unicode-range", value: "U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FF" }],
});

const title = "SS Solutions | Digital Products, Software & Technology Solutions";
const description =
  "SS Solutions builds custom websites, mobile apps, software, digital products, automation systems and growth-focused digital solutions.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s | SS Solutions",
  },
  description,
  applicationName: company.name,
  keywords: [
    "custom software development",
    "website development",
    "mobile app development",
    "digital solutions",
    "software company",
    "digital marketing",
    "business automation",
    "technology consultancy",
    "web application development",
  ],
  authors: [{ name: company.name }],
  creator: company.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: company.name,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#08080b" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: company.name,
  description,
  url: SITE_URL,
  email: company.email,
  areaServed: "IN",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
  founder: company.people.map((p) => ({ "@type": "Person", name: p.name })),
  serviceType: [
    "Custom software development",
    "Website development",
    "Mobile application development",
    "Digital marketing",
    "Business automation",
    "UI/UX design",
    "Product development",
    "Digital transformation",
    "Technology consultancy",
  ],
  contactPoint: company.people.map((p) => ({
    "@type": "ContactPoint",
    name: p.name,
    telephone: p.phoneHref,
    contactType: "sales",
  })),
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${display.variable} ${mono.variable} ${deva.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: EXTENSION_ATTR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body className="min-h-dvh text-foreground" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-purple focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <IntroLoader />
        <LanguageProvider>
        <SmoothScrollProvider>
          <PageTransitionProvider>
          <ScrollProgress />
          <ScrollTint />
          <Spotlight />
          <Cursor />
          <Navbar />
          <main id="main" className="relative">{children}</main>
          <Footer />
          <MobileCtaBar />
          <WhatsAppButton />
          <CommandMenu />
          <SoundEffects />
          <GlobalFx />
          </PageTransitionProvider>
        </SmoothScrollProvider>
        </LanguageProvider>
        {/* Visitor analytics: Vercel Analytics works automatically once deployed on Vercel;
            Google Analytics is added only when NEXT_PUBLIC_GA_ID is set. */}
        {process.env.VERCEL && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
