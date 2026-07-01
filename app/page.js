import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  GitMerge,
  LayoutGrid,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Footer } from "@geiger/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@geiger/ui";
import { Header } from "@/components/header";
import LandingWorkspaceShowcase from "@/components/landing/workspace_showcase";

export const metadata = {
  title: "Flow - Geiger Studio",
  description:
    "Plan work, ship faster, and keep your team in sync. Geiger Flow is your team's project and issue tracker built for clarity, speed, and modern workflows.",
};

const featureCards = [
  {
    title: "Project Tracking",
    description: "Organize work across milestones and deliverables with full visibility into what's moving and what's blocked.",
    icon: LayoutGrid,
  },
  {
    title: "Issue Management",
    description: "Log, assign, and resolve issues with full context — status, priority, assignee, and history all in one place.",
    icon: GitMerge,
  },
  {
    title: "Team Workflows",
    description: "Customize statuses and flows to match how your team actually works, not how a tool thinks you should.",
    icon: Zap,
  },
  {
    title: "Real-Time Updates",
    description: "Everyone stays in sync as work moves forward — no more chasing status in chat or stale spreadsheets.",
    icon: MessageSquare,
  },
  {
    title: "Reporting & Insights",
    description: "Understand velocity, blockers, and team load at a glance with built-in reporting that surfaces what matters.",
    icon: BarChart2,
  },
  {
    title: "Suite-Wide Integration",
    description: "Connected to Notes, Assets, Events, and the rest of Geiger — one workspace, everything in context.",
    icon: ShieldCheck,
  },
];

const faqs = [
  {
    value: "item-1",
    question: "What is Geiger Flow?",
    answer:
      "Geiger Flow is a project and issue tracker built for modern teams. It gives you projects, issues, kanban boards, and reporting in a clean workspace designed for clarity and speed.",
  },
  {
    value: "item-2",
    question: "How does Flow connect to the rest of the Geiger suite?",
    answer:
      "Flow is part of Geiger Studios — the same suite that includes Notes, Assets, Events, and more. Your team can move between products without losing context, and shared data like users and projects stays in sync across the suite.",
  },
  {
    value: "item-3",
    question: "Is Flow suitable for small teams?",
    answer:
      "Yes. Flow works just as well for a two-person team as a fifty-person organization. You can start simple and grow into more advanced workflows like custom roles, reporting, and integrations when you need them.",
  },
  {
    value: "item-4",
    question: "Can I self-host Geiger Flow?",
    answer:
      "Geiger Flow is open source and designed to be self-hostable. You can deploy it on your own infrastructure and connect it to your own Supabase project for full data ownership.",
  },
];

export default function FlowLandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground selection:bg-indigo-500/30 font-sans">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808030_1px,transparent_1px),linear-gradient(to_bottom,#80808030_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <Header />

      <main className="relative z-10 flex flex-1 flex-col pt-16 sm:pt-20">
        {/* Hero */}
        <section className="mx-auto mb-10 mt-10 flex w-full max-w-6xl items-start justify-start px-4 sm:mt-16 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-2xl font-semibold text-foreground sm:text-3xl">
              Plan work, ship faster, and keep your team in sync.
            </h1>
            <p className="mb-6 max-w-xl text-sm text-muted-foreground sm:text-base">
              Geiger Flow is your team&apos;s project and issue tracker — built for clarity,
              speed, and the way modern teams actually work.
            </p>
            <Link
              href="/workspace"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 sm:text-base"
            >
              Open Flow
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Workspace showcase */}
        <div className="mx-auto my-10 w-[94%] sm:my-20 md:w-[80%]">
          <LandingWorkspaceShowcase />
        </div>

        {/* Feature cards */}
        <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-3">
          {featureCards.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-sm border border-border bg-card p-5"
            >
              <Icon className="mb-3 h-5 w-5 text-foreground" />
              <h2 className="font-medium text-foreground">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </article>
          ))}
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-10 flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 md:mt-16 md:flex-row">
          <div className="md:w-[35%]">
            <h2 className="text-3xl font-semibold text-foreground">Questions &amp; Answers</h2>
          </div>
          <div className="md:w-[65%]">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.value}
                  value={faq.value}
                  className="border-border"
                >
                  <AccordionTrigger className="text-foreground hover:text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative z-20 overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
            <h3 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase sm:text-sm">
              Open source from day one
            </h3>
            <h2 className="mb-8 bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-3xl font-black tracking-tighter text-transparent drop-shadow-lg sm:mb-10 sm:text-5xl lg:text-6xl">
              TRY GEIGER NOW
            </h2>
            <div className="flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/workspace"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 sm:w-auto"
              >
                Open Flow
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover sm:w-auto"
              >
                Contact Sales
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
