import type { LucideIcon } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
}

export interface Service {
  /** Stable id, used for anchors and keys */
  id: string;
  title: string;
  /** Short one-line summary shown collapsed */
  summary: string;
  /** Longer paragraph shown on expand */
  description: string;
  capabilities: string[];
  icon: LucideIcon;
  cta: {
    label: string;
    href: string;
  };
}

export type ProjectStatus =
  | "LIVE"
  | "ON GOOGLE PLAY"
  | "CLOSED TESTING"
  | "CLIENT PROJECT"
  | "AI PROJECT"
  | "RESEARCH PROJECT";

export type ProjectFilter = "web" | "mobile" | "ai" | "games";

export interface Project {
  id: string;
  /** Which filter tabs this project appears under */
  filters: ProjectFilter[];
  /** Shown large at the top of the grid */
  featured?: boolean;
  title: string;
  /** Category label, e.g. "SAAS", "MOBILE APP" */
  category: string;
  status: ProjectStatus;
  summary: string;
  /** Bullet outcomes / scope — editable placeholders */
  highlights: string[];
  /** Path under /public — replace with real imagery later */
  image: string;
  /** Optional accent for the card glow */
  accent?: string;
  /** Key technologies, shown as small chips */
  stack?: string[];
  /** Extra screenshots/photos, browsable as thumbnails on the card */
  gallery?: ProjectImage[];
  /** Headline numbers for the case study — real, verifiable facts only */
  results?: { value: string; label: string }[];
}

export interface ProjectImage {
  src: string;
  alt: string;
  /** Tall images (phone screenshots, portrait photos) are letterboxed, not cropped */
  portrait?: boolean;
}

export interface TechItem {
  name: string;
  /** SVG path + brand hex from simple-icons (omit for a text-only badge) */
  icon?: { path: string; hex: string };
}

export interface TechCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  items: TechItem[];
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  outputs: string[];
}

export interface Differentiator {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface FlowNode {
  label: string;
  caption: string;
}

export interface ContactPerson {
  name: string;
  role: string;
  phone: string;
  /** E.164-ish for tel: links */
  phoneHref: string;
  /** Optional photo under /public/team (e.g. "/team/satej.jpg") — initials are shown until set */
  photo?: string;
}

export interface CompanyInfo {
  /** Working hours in IST, used by the "online now" badge */
  hours?: { days: number[]; start: number; end: number };
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  email: string;
  location: string;
  people: ContactPerson[];
  socials: { label: string; href: string }[];
}

export type ProjectType =
  | "Website"
  | "Web Application"
  | "Mobile App"
  | "Custom Software"
  | "Digital Marketing"
  | "Automation"
  | "Consultancy"
  | "Other";

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  projectType: ProjectType | "";
  budget: string;
  message: string;
}
