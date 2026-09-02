import React from 'react';
import { Globe, Search, BarChart3, Wrench } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: Globe,
      title: 'Enter your website',
      desc: 'Paste any public website URL. Our SSRF-safe engine validates the address and initializes crawl parameters.',
    },
    {
      num: '02',
      icon: Search,
      title: 'SEO AUTOPILOT scans pages',
      desc: 'Our crawler traverses internal links, inspects robots.txt & sitemaps, and extracts deep HTML metadata.',
    },
    {
      num: '03',
      icon: BarChart3,
      title: 'Review score & findings',
      desc: 'Get an objective 0–100 SEO Health Score alongside categorized Technical, On-Page, Content, and Links breakdowns.',
    },
    {
      num: '04',
      icon: Wrench,
      title: 'Fix highest-impact issues first',
      desc: 'Follow your AI-generated action plan with step-by-step code guidance, difficulty tags, and quick wins.',
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How SEO AUTOPILOT Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            From raw URL to prioritized execution roadmap in less than 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-mono font-black text-slate-300">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
