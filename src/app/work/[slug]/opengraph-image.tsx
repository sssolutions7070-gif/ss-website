import { projects } from "@/data/projects";
import { ogCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "SS Solutions case study";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find((x) => x.id === slug);
  return ogCard({
    kicker: p ? `Case study · ${p.category}` : "Case study",
    title: p?.title ?? "SS Solutions",
    subtitle: p ? (p.summary.length > 150 ? `${p.summary.slice(0, 147)}…` : p.summary) : undefined,
    accent: p?.accent,
  });
}
