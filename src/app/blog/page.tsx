import type { Metadata } from "next";
import { posts } from "@/data/blog";
import { PostCard } from "@/components/sections/Insights";

export const metadata: Metadata = {
  title: "Insights — guides for planning your website or app",
  description: "Plain-English guides from SS Solutions on costs, timelines and choosing between a website and an app.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <section className="section pt-36 md:pt-44">
      <div className="container-page">
        <p className="eyebrow">
          <span className="h-px w-7 bg-border-strong" />
          Insights
        </p>
        <h1 className="t-display mt-5 max-w-4xl text-foreground">
          Guides for planning your <span className="text-gradient-anim">next product.</span>
        </h1>
        <p className="t-lead mt-6 max-w-2xl">
          Short, practical articles on costs, timelines and how to choose what to build — written by the people who build it.
        </p>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
