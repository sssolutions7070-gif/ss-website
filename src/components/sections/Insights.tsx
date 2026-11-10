import { ArrowUpRight, Clock } from "lucide-react";
import { posts, type Post } from "@/data/blog";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TransitionLink } from "@/components/providers/PageTransition";
import { TextLink } from "@/components/ui/TextLink";

/** Article card with a generated cover (no stock photos needed). */
export function PostCard({ post }: { post: Post }) {
  return (
    <TransitionLink
      magnetic
      href={`/blog/${post.slug}`}
      label={post.title}
      accent={post.color}
      className="glass-card group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-surface shadow-[var(--card-shadow)] transition-transform duration-500 ease-[var(--ease)] hover:-translate-y-1"
    >
      {/* generated cover */}
      <div
        className="relative h-44 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${post.color}, color-mix(in oklab, ${post.color} 45%, #0b0920))` }}
      >
        <span aria-hidden className="absolute -right-10 -top-10 h-44 w-44 rounded-full border-[18px] border-white/15 transition-transform duration-700 group-hover:scale-110" />
        <span aria-hidden className="absolute bottom-6 left-6 h-16 w-16 rotate-12 rounded-2xl bg-white/15 transition-transform duration-700 group-hover:rotate-45" />
        <span aria-hidden className="absolute right-16 bottom-8 h-6 w-24 rounded-full bg-white/20" />
        <span className="absolute left-5 top-5 rounded-full bg-black/25 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-white">
          {post.tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-[1.2rem] font-semibold leading-snug text-foreground">{post.title}</h3>
        <p className="mt-2 flex-1 text-[0.9rem] leading-relaxed text-muted">{post.excerpt}</p>
        <div className="mt-5 flex items-center justify-between text-[0.8rem] text-faint">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {post.readMins} min read
          </span>
          <ArrowUpRight className="h-4 w-4 text-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </TransitionLink>
  );
}

/** Home-page teaser for the blog. */
export function Insights() {
  return (
    <section id="insights" className="section">
      <div className="container-page">
        <SectionHeading
          eyebrow="Insights"
          title={"Plan smarter\nbefore you build."}
          lead="Short guides on costs, timelines and choosing between a website and an app."
          action={<TextLink href="/blog">All articles</TextLink>}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
