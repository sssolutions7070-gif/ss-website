import type { ProcessStep, Differentiator, FlowNode } from "@/types";
import {
  Target,
  Layers,
  ShieldCheck,
  Gauge,
  Sparkles,
  LifeBuoy,
} from "lucide-react";

/** SECTION 7 — Process timeline */
export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Discover",
    description:
      "We dig into the business goal, the users and the constraints before a line of code. Clear problem, clear success metric.",
    outputs: ["Goals & KPIs", "User & stakeholder map", "Scope boundaries"],
  },
  {
    number: "02",
    title: "Strategize",
    description:
      "Technology, architecture and a delivery plan. We choose the smallest version that proves value, then sequence the rest.",
    outputs: ["Solution architecture", "Tech stack decision", "Delivery roadmap"],
  },
  {
    number: "03",
    title: "Design",
    description:
      "Flows, wireframes and a polished, accessible interface — delivered as a design system, not a pile of screens.",
    outputs: ["User flows", "UI design system", "Interactive prototype"],
  },
  {
    number: "04",
    title: "Build",
    description:
      "Iterative delivery in short cycles with automated tests and CI. You see working software every sprint, not at the end.",
    outputs: ["Production code you own", "Automated test suite", "CI/CD pipeline"],
  },
  {
    number: "05",
    title: "Grow",
    description:
      "Launch, instrument and improve. Analytics, marketing and a support agreement keep the product moving after release.",
    outputs: ["Analytics & dashboards", "Growth / SEO plan", "Support & SLAs"],
  },
];

/** SECTION 8 — Why SS Solutions */
export const differentiators: Differentiator[] = [
  {
    title: "Business-first thinking",
    description:
      "Every decision is tied to a business outcome. We ask what moves the metric before we ask what looks good.",
    icon: Target,
  },
  {
    title: "Custom, not templated",
    description:
      "Solutions shaped around how your business actually works — no forcing your process into someone else's product.",
    icon: Layers,
  },
  {
    title: "Modern technology",
    description:
      "Current, well-supported frameworks and tooling — so the product is fast today and maintainable in three years.",
    icon: Sparkles,
  },
  {
    title: "Scalable architecture",
    description:
      "Built to handle growth in users, data and features without a rewrite the moment it succeeds.",
    icon: Gauge,
  },
  {
    title: "Conversion-focused design",
    description:
      "Interfaces designed to be understood in seconds and to guide people toward the action that matters.",
    icon: ShieldCheck,
  },
  {
    title: "Long-term support",
    description:
      "We stay after launch — monitoring, iterating and supporting the product as a partner, not a vendor.",
    icon: LifeBuoy,
  },
];

/** SECTION 5 — Digital marketing growth flow */
export const marketingFlow: FlowNode[] = [
  { label: "Idea", caption: "What are we really selling, and to whom?" },
  { label: "Brand", caption: "Positioning, message and identity." },
  { label: "Website", caption: "A fast site built to convert." },
  { label: "Traffic", caption: "SEO, content and performance media." },
  { label: "Conversion", caption: "Testing and CRO on the journey." },
  { label: "Growth", caption: "Compounding, measured, repeatable." },
];

/** SECTION 6 — Consultancy blueprint layers */
export const consultancyLayers: { label: string; detail: string }[] = [
  { label: "Product strategy", detail: "Problem, audience, value proposition, success metrics." },
  { label: "Technology selection", detail: "The right stack for the team, budget and timeline." },
  { label: "MVP planning", detail: "The smallest version that proves the idea works." },
  { label: "Architecture planning", detail: "Data, services and scale mapped before build." },
  { label: "Digital transformation", detail: "Moving legacy processes to modern systems." },
  { label: "Automation strategy", detail: "Where automation pays back, and where it doesn't." },
  { label: "UI/UX strategy", detail: "Experience principles and a design system direction." },
  { label: "Growth strategy", detail: "Acquisition, activation and retention planning." },
];
