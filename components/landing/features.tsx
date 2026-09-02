import React from 'react';
import { Server, FileText, Layers, Sparkles, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function Features() {
  const featureList = [
    {
      category: '30% Weight',
      icon: Server,
      title: 'Technical SEO Audit',
      description: 'Verify server health, HTTPS enforcement, robots.txt directives, sitemap.xml discovery, canonical tags, and mobile responsive viewport settings.',
      checks: [
        'SSL & HTTPS protocol validation',
        'robots.txt crawl accessibility & sitemaps',
        'Canonical tag integrity',
        'Mobile viewport optimization',
      ],
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      category: '30% Weight',
      icon: FileText,
      title: 'On-Page SEO Analysis',
      description: 'Audit critical metadata, detect missing or duplicate title tags and meta descriptions, check heading hierarchy, and identify missing image alt text.',
      checks: [
        'Title length & duplicate detection',
        'Meta description snippet optimization',
        'Single H1 and structured H2 headings',
        'Image alt tag accessibility',
      ],
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      category: '25% Weight',
      icon: Layers,
      title: 'Content Depth Analysis',
      description: 'Identify thin content, analyze text density, assess text-to-link distribution, and verify keyword alignment between titles and body paragraphs.',
      checks: [
        'Thin content & word count evaluation',
        'Text-to-link ratio approximation',
        'Title-to-body topic relevance',
        'Scannability and section depth',
      ],
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      category: '15% Weight + AI',
      icon: Sparkles,
      title: 'AI Action Plan Engine',
      description: 'Transform complex audit findings into a sequenced, high-impact action roadmap labeled by impact, technical difficulty, and specific code fixes.',
      checks: [
        'Prioritized action items (Priority 1..N)',
        'Clear What, Why, and How breakdown',
        'Instant high-impact quick wins list',
        'Exact HTML snippets & evidence',
      ],
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 text-xs font-semibold mb-3">
            Comprehensive Analysis
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Four Core Pillars of Search Health
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Our audit engine performs multi-factor inspections across every page, combining deterministic rule checks with strategic AI prioritization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featureList.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200">
                      <Icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${feat.badgeColor}`}>
                      {feat.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    {feat.description}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    {feat.checks.map((check, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
