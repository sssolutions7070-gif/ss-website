import {
  MonitorSmartphone,
  Server,
  Smartphone,
  Cloud,
  Database,
  Cpu,
  Workflow,
  LineChart,
} from "lucide-react";
import {
  siAndroid,
  siAnthropic,
  siCloudflare,
  siDocker,
  siExpo,
  siExpress,
  siFastapi,
  siFlask,
  siGithubactions,
  siGoogleanalytics,
  siGoogletagmanager,
  siGreensock,
  siGraphql,
  siHuggingface,
  siKotlin,
  siLaravel,
  siLooker,
  siMake,
  siMongodb,
  siMysql,
  siN8n,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siOpencv,
  siPosthog,
  siPostgresql,
  siPrisma,
  siPython,
  siPytorch,
  siReact,
  siRedis,
  siSolidity,
  siSpringboot,
  siSwift,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVercel,
  siZapier,
  type SimpleIcon,
} from "simple-icons";
import type { TechCategory, TechItem } from "@/types";

const t = (name: string, icon?: SimpleIcon): TechItem =>
  icon ? { name, icon: { path: icon.path, hex: icon.hex } } : { name };

/**
 * Technology universe. ONLY list what SS Solutions actually uses — several
 * entries (Spring Boot, Flask, PyTorch, OpenCV, Solidity, Express…) come
 * straight from the delivered projects shown in the Projects section.
 * Logos: simple-icons (official brand marks). No icon → text badge.
 */
export const technologies: TechCategory[] = [
  {
    id: "frontend",
    label: "Frontend",
    icon: MonitorSmartphone,
    items: [
      t("React", siReact),
      t("Next.js", siNextdotjs),
      t("TypeScript", siTypescript),
      t("Tailwind CSS", siTailwindcss),
      t("Three.js", siThreedotjs),
      t("GSAP", siGreensock),
    ],
  },
  {
    id: "backend",
    label: "Backend",
    icon: Server,
    items: [
      t("Node.js", siNodedotjs),
      t("Express", siExpress),
      t("NestJS", siNestjs),
      t("Spring Boot", siSpringboot),
      t("Python", siPython),
      t("Flask", siFlask),
      t("FastAPI", siFastapi),
      t("Laravel", siLaravel),
      t("GraphQL", siGraphql),
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: Smartphone,
    items: [
      t("React Native", siReact),
      t("Expo", siExpo),
      t("Android", siAndroid),
      t("Kotlin", siKotlin),
      t("Swift", siSwift),
    ],
  },
  {
    id: "ai",
    label: "AI & Data",
    icon: Cpu,
    items: [
      t("Claude API", siAnthropic),
      t("OpenAI API"),
      t("PyTorch", siPytorch),
      t("Hugging Face", siHuggingface),
      t("OpenCV", siOpencv),
      t("RAG pipelines"),
    ],
  },
  {
    id: "database",
    label: "Database & Web3",
    icon: Database,
    items: [
      t("PostgreSQL", siPostgresql),
      t("MySQL", siMysql),
      t("MongoDB", siMongodb),
      t("Redis", siRedis),
      t("Prisma", siPrisma),
      t("Solidity", siSolidity),
    ],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    icon: Cloud,
    items: [
      t("AWS"),
      t("Vercel", siVercel),
      t("Docker", siDocker),
      t("GitHub Actions", siGithubactions),
      t("Cloudflare", siCloudflare),
    ],
  },
  {
    id: "automation",
    label: "Automation",
    icon: Workflow,
    items: [t("n8n", siN8n), t("Zapier", siZapier), t("Make", siMake), t("Webhooks & queues")],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: LineChart,
    items: [
      t("GA4", siGoogleanalytics),
      t("PostHog", siPosthog),
      t("Tag Manager", siGoogletagmanager),
      t("Looker Studio", siLooker),
    ],
  },
];
