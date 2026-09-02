import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Zap, Terminal } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-base">
                SEO <span className="text-emerald-600">AUTOPILOT</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Turn your website into a prioritized SEO action plan. Deep server-side crawler, technical verification, and actionable AI recommendations.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                SSRF-Protected Engine
              </span>
              <span className="inline-flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Real-Time Crawling
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-slate-900 transition-colors">Audit History</Link>
              </li>
              <li>
                <Link href="/audit/demo" className="hover:text-slate-900 transition-colors">Demo Report</Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-slate-900 transition-colors">Settings</Link>
              </li>
            </ul>
          </div>

          {/* Standards & Transparency */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Ethical SEO
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              SEO AUTOPILOT analyzes publicly accessible HTML structure, metadata, and site architecture. We do not support spam backlink generation or manipulative techniques.
            </p>
            <div className="mt-3 text-xs text-slate-400">
              System Version: <span className="font-mono text-slate-600">v1.0.0-MVP</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SEO AUTOPILOT. Built for website owners, freelancers, and SEO engineers.</p>
          <div className="flex items-center gap-4">
            <span>Next.js 14 & Prisma</span>
            <span>•</span>
            <span>Accessible SaaS Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
