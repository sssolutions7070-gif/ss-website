import { posts } from "@/data/blog";
import { ogCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "SS Solutions insights";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  return ogCard({
    kicker: p ? `Insights · ${p.tag}` : "Insights",
    title: p?.title ?? "SS Solutions",
    subtitle: p?.excerpt,
    accent: p?.color,
  });
}
