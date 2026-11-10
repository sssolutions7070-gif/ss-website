export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  readMins: number;
  tag: string;
  color: string;
  /** Simple rich text: paragraphs, "## " headings and "- " bullet lines */
  body: string[];
}

export const posts: Post[] = [
  {
    slug: "what-decides-the-cost-of-a-website-or-app",
    title: "What decides the cost of a website or app?",
    excerpt: "Two projects that look similar can be priced very differently. Here are the six things that actually move the number.",
    date: "2026-10-20",
    readMins: 5,
    tag: "Pricing",
    color: "#6a46ff",
    body: [
      "The most common question we hear is “how much will it cost?”. The honest answer is: it depends — but on a small, predictable list of things. Knowing them helps you plan a budget and compare quotes fairly.",
      "## 1. Number of screens and pages",
      "Every unique screen has to be designed, built and tested. A five-page business website is a very different job from a 40-screen app, even if both “look simple”.",
      "## 2. Who uses it",
      "One type of user (your customers) is simpler than three (customers, vendors and delivery riders). Each user type usually needs its own screens, permissions and sometimes its own app.",
      "## 3. Logins, payments and notifications",
      "- User accounts and login",
      "- Online payments (UPI, cards, wallets)",
      "- Push notifications, SMS or WhatsApp messages",
      "Each of these adds real work and testing — and they are usually where most of the value is.",
      "## 4. Integrations",
      "Connecting to other systems — maps, accounting software, a CRM, a payment gateway or your existing database — adds time, especially when those systems are old or poorly documented.",
      "## 5. Admin panel",
      "Most businesses need a back office to manage orders, content or users. A good admin panel can be as big as the customer-facing product.",
      "## 6. Content, design and launch",
      "Custom design, copywriting, product photos, Play Store listings, hosting and domain setup are all part of a real launch. Ask whether a quote includes them.",
      "## How to get an accurate quote",
      "Write down who will use the product, the three most important things they must be able to do, and any systems it must connect to. With that, any good team can give you a clear range — and that is exactly what our free call is for.",
    ],
  },
  {
    slug: "website-or-app-what-should-you-build-first",
    title: "Website or app: what should your business build first?",
    excerpt: "Most businesses don't need an app on day one. A simple way to decide where to spend first.",
    date: "2026-10-06",
    readMins: 4,
    tag: "Strategy",
    color: "#3d63ff",
    body: [
      "“Should we build an app?” is often the wrong first question. The better question is: what do customers need to do, and how often?",
      "## Start with a website when…",
      "- People need to find you on Google and trust you before they call",
      "- Customers visit occasionally (once a month or less)",
      "- You want enquiries, bookings or orders without asking people to install anything",
      "A fast, mobile-friendly website works on every phone, can be found on Google, and is cheaper to build and maintain.",
      "## Build an app when…",
      "- Customers use your service often — daily or weekly",
      "- You need live location, the camera, offline use or reliable notifications",
      "- You run operations with staff or partners in the field (riders, vendors, agents)",
      "That is why a delivery business like Best Food Services runs separate apps for customers, vendors and riders — while a gaushala or a brand store does best with a great website.",
      "## The common path",
      "Many businesses start with a website, learn what customers actually ask for, and then build an app around the features people use most. It keeps the first investment small and the app focused.",
    ],
  },
  {
    slug: "how-we-run-a-project-from-first-call-to-launch",
    title: "How we run a project — from first call to launch",
    excerpt: "No black box: the five stages every SS Solutions project goes through, and what you get at each one.",
    date: "2026-09-22",
    readMins: 4,
    tag: "Process",
    color: "#c026d3",
    body: [
      "Software projects go wrong when nobody knows what is happening between kickoff and launch. We avoid that by working in five clear stages, each with something you can see and approve.",
      "## 1. Discover",
      "We understand the goal, the users and the constraints. You get agreed goals, a map of who uses the product and a clear scope.",
      "## 2. Strategize",
      "We choose the technology and plan the smallest version that proves value. You get the architecture, tech stack and a delivery roadmap.",
      "## 3. Design",
      "User flows, wireframes and a polished interface. You click through an interactive prototype before any code is written.",
      "## 4. Build",
      "We develop in short cycles and share working builds regularly, so you see progress along the way — not just at the end.",
      "## 5. Launch and grow",
      "We publish the website or app, set up analytics, and stay with you after launch for fixes and improvements.",
      "Want to see how this would work for your project? Book a free call and we will walk you through it.",
    ],
  },
];
