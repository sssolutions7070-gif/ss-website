import {
  Code2,
  Smartphone,
  Boxes,
  PenTool,
  Megaphone,
  Workflow,
  Rocket,
  Compass,
} from "lucide-react";
import type { Service } from "@/types";

const cta = { label: "Discuss this", href: "#contact" };

/**
 * Services shown in Section 3. Order here is the order on the page.
 * Add / remove / reword freely — the UI adapts to the array length.
 */
export const services: Service[] = [
  {
    id: "web-development",
    title: "Web Development",
    summary:
      "Fast, accessible marketing sites and platforms engineered for conversion.",
    description:
      "Purpose-built websites that load fast, rank well and turn visitors into enquiries. Built on modern frameworks with clean, maintainable code you actually own.",
    capabilities: [
      "Marketing & corporate sites",
      "Headless CMS integration",
      "Landing pages & campaigns",
      "Core Web Vitals optimisation",
      "Analytics & A/B testing",
    ],
    icon: Code2,
    cta,
  },
  {
    id: "mobile-apps",
    title: "Mobile Apps",
    summary: "iOS and Android products from a single, well-architected codebase.",
    description:
      "Native-quality mobile applications with offline support, push notifications and secure APIs — shipped to the App Store and Play Store and maintained over time.",
    capabilities: [
      "React Native & cross-platform",
      "Offline-first architecture",
      "Push & real-time features",
      "App Store / Play Store release",
      "Crash & performance monitoring",
    ],
    icon: Smartphone,
    cta,
  },
  {
    id: "custom-software",
    title: "Custom Software",
    summary:
      "Purpose-built software designed around the way your business actually works.",
    description:
      "When off-the-shelf tools force you to change your process, we build the system that fits it. Internal platforms, customer portals and data-heavy applications.",
    capabilities: [
      "SaaS platforms",
      "Business systems & dashboards",
      "APIs & integrations",
      "Workflow automation",
      "Enterprise applications",
    ],
    icon: Boxes,
    cta,
  },
  {
    id: "ui-ux-design",
    title: "UI / UX Design",
    summary: "Interface design that is clear, considered and conversion-aware.",
    description:
      "Research, flows, wireframes and polished UI — delivered as a design system your team and ours can build from without guesswork.",
    capabilities: [
      "Product & app UI",
      "Design systems",
      "Prototyping & user testing",
      "Accessibility (WCAG) review",
      "Design-to-code handoff",
    ],
    icon: PenTool,
    cta,
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    summary: "Launch and grow the product after it ships — with measurable intent.",
    description:
      "SEO, performance marketing, content and analytics that connect spend to pipeline. We treat marketing as an engineering problem: instrument, test, iterate.",
    capabilities: [
      "SEO & technical SEO",
      "Performance / paid media",
      "Conversion rate optimisation",
      "Analytics & attribution setup",
      "Content & positioning",
    ],
    icon: Megaphone,
    cta,
  },
  {
    id: "business-automation",
    title: "Business Automation",
    summary: "Remove repetitive manual work with reliable, observable systems.",
    description:
      "We map the process, find the bottlenecks and automate them — integrations between the tools you already use, plus custom logic where it pays off.",
    capabilities: [
      "Workflow & process automation",
      "Tool & API integrations",
      "Document & data pipelines",
      "Internal admin tooling",
      "Reporting automation",
    ],
    icon: Workflow,
    cta,
  },
  {
    id: "product-development",
    title: "Product Development",
    summary: "From MVP to scale — build, measure and evolve a real product.",
    description:
      "End-to-end product delivery: scope the smallest valuable version, ship it, learn from usage and expand deliberately. Roadmap, delivery and iteration.",
    capabilities: [
      "MVP scoping & delivery",
      "Roadmap & iteration cycles",
      "Scalable architecture",
      "QA & release engineering",
      "Long-term maintenance",
    ],
    icon: Rocket,
    cta,
  },
  {
    id: "tech-consultancy",
    title: "Tech Consultancy",
    summary: "You bring the idea. We design the digital path to get there.",
    description:
      "Product strategy, technology selection, architecture planning and digital transformation guidance — practical direction from a team that also builds.",
    capabilities: [
      "Product & technology strategy",
      "Architecture & stack selection",
      "Digital transformation planning",
      "Automation strategy",
      "Team & delivery advisory",
    ],
    icon: Compass,
    cta,
  },
];
