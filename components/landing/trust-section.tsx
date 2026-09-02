import React from 'react';
import { Users, Briefcase, Code, ShieldCheck } from 'lucide-react';

export function TrustSection() {
  const audiences = [
    {
      icon: Users,
      title: 'Website Owners',
      desc: 'Understand technical and on-page problems in plain English without confusing jargon.',
    },
    {
      icon: Briefcase,
      title: 'Freelancers & Agencies',
      desc: 'Deliver comprehensive, prioritized SEO action roadmaps to clients in seconds.',
    },
    {
      icon: Code,
      title: 'Developers & Engineers',
      desc: 'Get exact code snippets, missing HTML tags, status codes, and remediation steps.',
    },
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            Targeted Insights
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">
            Built for website owners, freelancers and SEO professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audiences.map((aud, index) => {
            const Icon = aud.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm mb-4">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">
                  {aud.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {aud.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
