import type { Metadata } from "next";
import Image from "next/image";
import { TransitionLink } from "@/components/providers/PageTransition";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MessageCircle } from "lucide-react";
import { projects } from "@/data/projects";
import { company } from "@/data/company";
import { waLink } from "@/lib/whatsapp";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { PhoneShowcase } from "@/components/ui/PhoneShowcase";
import type { Project, ProjectFilter, ProjectImage } from "@/types";

const PLATFORM: Record<ProjectFilter, string> = {
  web: "Web",
  mobile: "Android / Mobile",
  ai: "AI & ML",
  games: "Game",
};

function imagesOf(p: Project): ProjectImage[] {
  return p.gallery && p.gallery.length > 0 ? p.gallery : [{ src: p.image, alt: p.title }];
}

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.id === slug);
  if (!p) return {};
  return {
    title: `${p.title} — Case study`,
    description: p.summary,
    alternates: { canonical: `/work/${p.id}` },
    openGraph: {
      title: `${p.title} | ${company.name}`,
      description: p.summary,
    },
  };
}

function Phone({ img, priority }: { img: ProjectImage; priority?: boolean }) {
  return (
    <div className="relative aspect-[9/19.5] w-full overflow-hidden rounded-[22px] border-[5px] border-[#16161c] bg-black shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)]">
      <Image src={img.src} alt={img.alt} fill priority={priority} sizes="(max-width: 640px) 45vw, 260px" className="img-focus object-cover object-top" />
    </div>
  );
}

function Browser({ img, priority }: { img: ProjectImage; priority?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_40px_90px_-50px_rgba(var(--ink-rgb),0.55)]">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="relative aspect-[16/10] w-full bg-background-elevated">
        <Image src={img.src} alt={img.alt} fill priority={priority} sizes="(max-width: 1024px) 100vw, 1100px" className="img-focus object-cover object-top" />
      </div>
    </div>
  );
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.id === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const images = imagesOf(project);
  const screens = images.filter((i) => !i.portrait);
  const phones = images.filter((i) => i.portrait);
  const accent = project.accent ?? "#6a46ff";
  const coverIsPhone = images[0].portrait;

  const facts = [
    { k: "Category", v: project.category },
    { k: "Status", v: project.status },
    { k: "Platforms", v: project.filters.map((f) => PLATFORM[f]).join(" · ") },
    { k: "Built with", v: project.stack?.join(", ") ?? "—" },
  ];

  return (
    <article>
      {/* Header */}
      <header className="relative overflow-hidden pb-14 pt-32 md:pb-20 md:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: `radial-gradient(60% 70% at 85% 10%, ${accent}26, transparent 70%)` }}
        />
        <div className="container-page">
          <TransitionLink href="/#work" label="All projects" className="group inline-flex items-center gap-2 text-[0.85rem] text-muted transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            All projects
          </TransitionLink>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="t-label">{project.category}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border-strong px-3 py-1 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
              {project.status}
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.3rem,1.4rem+4.2vw,5rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-foreground">
            {project.title}
          </h1>
          <p className="t-lead mt-6 max-w-3xl">{project.summary}</p>

          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-border bg-border lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.k} className="bg-surface p-5">
                <dt className="t-label">{f.k}</dt>
                <dd className="mt-2 text-[0.92rem] font-medium text-foreground">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Cover */}
      <section className="container-page">
        <ScrollReveal>
          {coverIsPhone ? (
            <div
              className="grid grid-cols-3 items-end gap-4 rounded-[28px] border border-border px-[6%] pt-12 sm:gap-8"
              style={{ background: `radial-gradient(90% 80% at 50% 0%, ${accent}30, transparent 70%)` }}
            >
              {phones.slice(0, 3).map((img, i) => (
                <div key={img.src} className={i === 1 ? "-mb-2" : "mb-[-12%]"}>
                  <Phone img={img} priority={i === 0} />
                </div>
              ))}
            </div>
          ) : (
            <Browser img={images[0]} priority />
          )}
        </ScrollReveal>
      </section>

      {/* Results */}
      {project.results && project.results.length > 0 && (
        <section className="container-page mt-16">
          <div className="grid gap-px overflow-hidden rounded-[24px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {project.results.map((r) => (
              <div key={r.label} className="relative bg-surface p-6 sm:p-7">
                <span aria-hidden className="absolute left-0 top-6 h-8 w-[3px] rounded-r-full" style={{ background: accent }} />
                <div className="font-display text-[clamp(1.8rem,1.3rem+1.6vw,2.6rem)] font-semibold leading-none tracking-[-0.03em] text-foreground">
                  {r.value}
                </div>
                <div className="mt-2 text-[0.85rem] text-muted">{r.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* What we built */}
      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow">
              <span className="h-px w-7" style={{ background: accent }} />
              What we built
            </p>
            <h2 className="t-h2 mt-5 text-foreground">The scope, end to end.</h2>
            <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-muted">
              Designed, engineered and shipped by {company.name} — from first screens to production.
            </p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {project.highlights.map((h, i) => (
              <ScrollReveal key={h} delay={(i % 2) * 0.06} as="li" className="rounded-[20px] border border-border bg-surface p-6 shadow-[var(--card-shadow)]">
                <span className="font-[family-name:var(--font-mono)] text-[0.75rem]" style={{ color: accent }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-strong">{h}</p>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 3D phone (apps with 2+ phone screens) */}
      {phones.length >= 2 && <PhoneShowcase screens={phones} accent={accent} title={project.title} />}

      {/* Screens */}
      {(screens.length > (coverIsPhone ? 0 : 1) || phones.length > (coverIsPhone ? 3 : 0)) && (
        <section className="section pt-0">
          <div className="container-page">
            <p className="eyebrow">
              <span className="h-px w-7" style={{ background: accent }} />
              Screens
            </p>
            {screens.length > (coverIsPhone ? 0 : 1) && (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {screens.slice(coverIsPhone ? 0 : 1).map((img) => (
                  <ScrollReveal key={img.src}>
                    <Browser img={img} />
                    <p className="mt-3 text-[0.82rem] text-muted">{img.alt}</p>
                  </ScrollReveal>
                ))}
              </div>
            )}
            {phones.length > 0 && !(coverIsPhone && phones.length <= 3) && (
              <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {phones.map((img, i) => (
                  <ScrollReveal key={img.src} delay={(i % 4) * 0.05}>
                    <Phone img={img} />
                    <p className="mt-3 text-[0.8rem] text-muted">{img.alt}</p>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Next project */}
      <section className="container-page pb-6">
        <TransitionLink
          href={`/work/${next.id}`}
          label={next.title}
          accent={next.accent}
          image={next.image}
          className="group grid overflow-hidden rounded-[28px] border border-border bg-surface shadow-[var(--card-shadow)] transition-colors hover:border-border-strong md:grid-cols-[1fr_1.1fr]"
        >
          <div className="flex flex-col justify-center p-8 md:p-12">
            <span className="t-label">Next project</span>
            <span className="mt-4 font-display text-[clamp(1.6rem,1.2rem+1.8vw,2.6rem)] font-semibold leading-tight text-foreground">
              {next.title}
            </span>
            <span className="mt-3 line-clamp-2 max-w-md text-[0.92rem] text-muted">{next.summary}</span>
            <span className="mt-6 inline-flex items-center gap-2 text-[0.9rem] font-medium text-foreground">
              View case study
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
          <div data-pt-from className="relative min-h-[220px] overflow-hidden bg-background-elevated md:min-h-[320px]">
            <Image
              src={next.image}
              alt={next.title}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover object-top transition-transform duration-[1.2s] ease-[var(--ease)] group-hover:scale-[1.04]"
            />
          </div>
        </TransitionLink>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-page text-center">
          <h2 className="t-h2 mx-auto max-w-2xl text-foreground">Want something like this for your business?</h2>
          <p className="mx-auto mt-5 max-w-lg text-[1rem] leading-relaxed text-muted">
            Tell us what you&apos;re building — we&apos;ll reply with a plan, a timeline and a rough estimate.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <MagneticButton href="/#contact" size="lg">
              Start a project
            </MagneticButton>
            <a
              href={waLink(company.people[0].phoneHref, `Hi SS Solutions! I saw ${project.title} and want something similar.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong px-7 py-4 text-[0.95rem] font-medium text-foreground transition-colors hover:bg-[rgba(var(--ink-rgb),0.05)]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}
