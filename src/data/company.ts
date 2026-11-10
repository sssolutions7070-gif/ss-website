import type { CompanyInfo } from "@/types";

/**
 * Single source of truth for company information.
 * Edit this file to update contact details across the whole site.
 * NOTE: Values marked "PLACEHOLDER" are editable stand-ins — replace when real data is available.
 */
export const company: CompanyInfo = {
  // Mon–Sat, 10:00–20:00 IST (0 = Sunday). Edit to match your real hours.
  hours: { days: [1, 2, 3, 4, 5, 6], start: 10, end: 20 },
  name: "SS Solutions",
  shortName: "SS",
  tagline: "We build digital products that move businesses forward.",
  description:
    "SS Solutions builds custom websites, mobile apps, software, digital products, automation systems and growth-focused digital solutions.",
  email: "sssolutions7070@gmail.com",
  location: "Pune, Maharashtra, India",
  people: [
    {
      name: "Satej Rajeshirke",
      role: "Co-Founder",
      phone: "+91 9156994716",
      phoneHref: "+919156994716",
      // photo: "/team/satej.jpg",
    },
    {
      name: "Sahil Bodke",
      role: "Co-Founder",
      phone: "+91 9226902344",
      phoneHref: "+919226902344",
      // photo: "/team/sahil.jpg",
    },
  ],
  socials: [
    // Add the real profile URLs here; links left as "#" are hidden on the site.
    { label: "LinkedIn", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "GitHub", href: "#" },
  ],
};

/** Public site URL — used for metadata, sitemap and structured data. Override with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://sssolutions.dev";
