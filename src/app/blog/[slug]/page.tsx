import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { posts } from "@/data/blog";
import { SITE_URL, company } from "@/data/company";
import { TransitionLink } from "@/components/providers/PageTransition";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { PostCard } from "@/components/sections/Insights";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.excerpt, publishedTime: p.date },
  };
}

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((x) => x.slug === slug);
  if (!post) notFound();
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: company.name },
    publisher: { "@type": "Organization", name: company.name },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  // group consecutive "- " lines into one list
  const blocks: ({ type: "p" | "h"; text: string } | { type: "ul"; items: string[] })[] = [];
  for (const line of post.body) {
    if (line.startsWith("- ")) {
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ul") last.items.push(line.slice(2));
      else blocks.push({ type: "ul", items: [line.slice(2)] });
    } else if (line.startsWith("## ")) blocks.push({ type: "h", text: line.slice(3) });
    else blocks.push({ type: "p", text: line });
  }

  return (
    <article className="pb-10 pt-32 md:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[30rem]" style={{ background: `radial-gradient(50% 60% at 80% 20%, ${post.color}2e, transparent 70%)` }} />
        <div className="container-page max-w-3xl">
          <TransitionLink href="/blog" label="Insights" className="group inline-flex items-center gap-2 text-[0.85rem] text-muted transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            All insights
          </TransitionLink>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-[0.82rem] text-muted">
            <span className="rounded-full px-3 py-1 font-medium text-white" style={{ background: post.color }}>
              {post.tag}
            </span>
            <span>{fmt(post.date)}</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {post.readMins} min read
            </span>
          </div>
          <h1 className="mt-6 font-display text-[clamp(2.1rem,1.4rem+3vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-foreground">
            {post.title}
          </h1>
          <p className="t-lead mt-5">{post.excerpt}</p>
        </div>
      </header>

      <div className="container-page mt-12 max-w-3xl">
        <div className="space-y-5 text-[1.05rem] leading-[1.8] text-muted-strong">
          {blocks.map((b, i) =>
            b.type === "h" ? (
              <h2 key={i} className="pt-6 font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-foreground">
                {b.text}
              </h2>
            ) : b.type === "ul" ? (
              <ul key={i} className="space-y-2 pl-1">
                {b.items.map((it) => (
                  <li key={it} className="flex gap-3">
                    <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: post.color }} />
                    {it}
                  </li>
                ))}
              </ul>
            ) : (
              <p key={i}>{b.text}</p>
            ),
          )}
        </div>

        <div className="mt-14 rounded-[28px] border border-border bg-surface p-8 shadow-[var(--card-shadow)]">
          <p className="font-display text-[1.4rem] font-semibold text-foreground">Planning something similar?</p>
          <p className="mt-2 text-[0.95rem] text-muted">Book a free 30-minute call — we&apos;ll help you scope it and give you a clear quote.</p>
          <div className="mt-6">
            <MagneticButton href="/#book">Book a free call</MagneticButton>
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <div className="container-page mt-20">
          <p className="t-label">Keep reading</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {others.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
