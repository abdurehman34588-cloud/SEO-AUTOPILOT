# SEO AUTOPILOT 🚀

> **"Turn Your Website Into an SEO Action Plan."**

SEO AUTOPILOT is a full-stack SEO audit and AI recommendations platform designed for website owners, freelancers, and SEO engineers. It features real website crawling with SSRF safeguards, a 4-pillar modular audit engine, deterministic scoring, an AI layer with multi-provider and zero-API-key fallback support, interactive dashboards, and prioritized remediation plans.

---

## 🌟 Key Features

- **Real Server-Side Web Crawler**: Discovers internal pages (up to 10 pages, max depth 2) with SSRF prevention, request timeouts, and memory-safe body caps.
- **4-Pillar SEO Health Audit Engine**:
  - **Technical SEO (30%)**: HTTPS protocol, `robots.txt`, `sitemap.xml`, canonical tags, mobile viewport, crawlability, HTTP status codes.
  - **On-Page SEO (30%)**: Title tag optimization, duplicate detection, meta descriptions, H1/H2 hierarchy, image alt text accessibility, clean URLs.
  - **Content Analysis (25%)**: Thin-content detection (< 300 words), text-to-link density ratio, title-to-body topical relevance.
  - **On-Site Link Analysis (15%)**: Internal/external distribution, broken internal links, orphan-like page identification.
- **0–100 SEO Health Score**: Weighted, transparent scoring with interactive circular SVG indicators.
- **AI Action Plan Engine**: Sequenced action roadmaps (`Priority 1..N`) with impact ratings, difficulty levels, and step-by-step technical remediation guides. Works out-of-the-box with **zero paid API keys** using deterministic heuristics, and supports **Google Gemini** or **OpenAI**.
- **Issue Transparency**: Every issue explains **WHAT IS WRONG**, **WHY IT MATTERS**, **HOW TO FIX IT**, and displays exact extracted HTML/URL evidence.
- **Realistic Demo Mode**: Instant one-click demo previewing `example.com` (Health Score: 78).
- **Export & Reporting**: One-click exports for Markdown reports, raw JSON, and print-ready PDF views.
- **History & Persistence**: Stores scans in SQLite / PostgreSQL with Prisma ORM and memory cache fallback.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **UI & Styling**: React 18, Tailwind CSS, Lucide Icons
- **HTML Parser & Crawler**: Cheerio
- **Validation**: Zod
- **ORM & Database**: Prisma ORM (SQLite for local zero-config, PostgreSQL compatible)
- **Testing**: Vitest

---

## 📋 Requirements

- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **npm**: v9+ or **pnpm** / **yarn**

---

## 🚀 Quick Start & Installation

### 1. Clone or Open the Repository
```bash
cd C:\Users\ST\.gemini\antigravity\scratch\seo-autopilot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
# Database Connection (SQLite default for local development, PostgreSQL compatible)
DATABASE_URL="file:./dev.db"

# AI Provider Configuration (Optional - falls back to deterministic rule-based AI)
# Options: "rules" (default, zero keys required), "gemini", "openai"
AI_PROVIDER="rules"
AI_API_KEY=""

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Prisma Database
Generate the Prisma Client and sync the SQLite schema:
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

Run the complete Vitest test suite covering URL validation, SSRF protection, scoring calculation, On-Page checks, and Technical checks:
```bash
npm run test
```

---

## 🏗️ Production Build

To compile and launch the optimized production build:
```bash
npm run build
npm run start
```

---

## 🤖 Configuring Optional AI Providers

SEO AUTOPILOT functions completely without external API keys. However, if you wish to use Google Gemini or OpenAI:

### Using Google Gemini
1. Get an API key from Google AI Studio: [https://aistudio.google.com](https://aistudio.google.com)
2. Update `.env`:
   ```env
   AI_PROVIDER="gemini"
   AI_API_KEY="your-gemini-api-key"
   ```

### Using OpenAI
1. Get an API key from OpenAI: [https://platform.openai.com](https://platform.openai.com)
2. Update `.env`:
   ```env
   AI_PROVIDER="openai"
   AI_API_KEY="your-openai-api-key"
   ```

---

## 🔒 Security & Safe Crawling Policies

- **SSRF Protection**: Prevents requests to `localhost`, `127.0.0.1`, RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), AWS/GCP cloud metadata IP (`169.254.169.254`), and non-HTTP protocols.
- **Crawling Safeguards**: Caps internal crawl depth to 2 and max pages to 10 by default to prevent server exhaustion.
- **Ethical Analysis**: Does not engage in spam generation, fake backlink creation, or search engine manipulation.

---

## 📁 Directory Structure

```
seo-autopilot/
├── app/
│   ├── layout.tsx                # Global layout with font, navbar & footer
│   ├── page.tsx                  # Landing page (Hero, Trust, Features, How It Works, CTA)
│   ├── audit/
│   │   ├── page.tsx              # Live audit execution & progress interface
│   │   └── [id]/
│   │       └── page.tsx          # Full audit report dashboard
│   ├── dashboard/page.tsx        # Overview dashboard with stats and scan launcher
│   ├── history/page.tsx          # Audit history list with filters and delete
│   ├── settings/page.tsx         # AI provider config and crawler settings
│   ├── api/
│   │   ├── audit/
│   │   │   ├── route.ts          # POST /api/audit (Run audit)
│   │   │   └── [id]/route.ts     # GET /api/audit/[id] (Fetch report)
│   │   └── history/route.ts      # GET /api/history & DELETE
│   ├── sitemap.ts                # Dynamic sitemap for SEO Autopilot
│   ├── robots.ts                 # Dynamic robots.txt
│   └── globals.css               # Clean SaaS styles and score dials
├── components/
│   ├── navbar.tsx                # Header navigation & brand logo
│   ├── footer.tsx                # Minimalist footer
│   ├── score-gauge.tsx           # Circular SVG SEO Health Score dial
│   ├── landing/                  # Hero, Trust, Features, How It Works, CTA
│   └── audit/                    # CategoryBreakdown, IssueCard, IssueFilter, AIActionPlan, PagesTable, ExportReport
├── lib/
│   ├── crawler/                  # Crawler, robots.txt & sitemap checkers
│   ├── seo/                      # Technical, On-Page, Content, Links check engines
│   ├── scoring/                  # Weighted scoring calculation
│   ├── ai/                       # AI provider abstraction & rule-based engine
│   ├── security/                 # URL validator & SSRF protection guard
│   ├── demo/                     # Pre-computed realistic demo data for example.com
│   └── db/                       # Prisma client singleton & unified storage
├── prisma/
│   └── schema.prisma             # Audit, Page, Issue, AIRecommendation models
├── tests/                        # Vitest unit and integration tests
├── .env.example
├── README.md
└── package.json
```

---

## 📄 License
MIT License. Built for website owners, freelancers, and SEO professionals.
