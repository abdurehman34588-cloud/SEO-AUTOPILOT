'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Sparkles, Shield, Search, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { validateAndNormalizeUrl } from '@/lib/security/url-validator';

export function Hero() {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateAndNormalizeUrl(urlInput);
    if (!validation.isValid || !validation.normalizedUrl) {
      setError(validation.error || 'Please enter a valid website address (e.g. example.com).');
      return;
    }

    setLoading(true);
    const target = encodeURIComponent(validation.normalizedUrl);
    router.push(`/audit?url=${target}`);
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrlInput(exampleUrl);
    setError(null);
  };

  return (
    <section id="run-audit" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-slate-100/50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Next-Generation SEO Audit & Action Engine</span>
        </div>

        {/* Main Headings */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Turn Your Website Into an{' '}
          <span className="text-emerald-600 inline-block relative">
            SEO Action Plan.
          </span>
        </h1>

        <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Scan your website, uncover SEO problems, understand what they mean, and get practical, prioritized recommendations to improve your search visibility.
        </p>

        {/* Input Form Card */}
        <div className="mt-10 max-w-2xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-2.5 bg-white rounded-2xl shadow-card border border-slate-200/90 transition-all focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10"
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1 flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Globe className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="https://example.com"
                  className="w-full pl-11 pr-4 py-3 text-base text-slate-900 placeholder:text-slate-400 bg-transparent border-none rounded-xl focus:outline-none"
                  aria-label="Website URL to audit"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-slate-900 hover:bg-emerald-600 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Preparing Scan...</span>
                  </>
                ) : (
                  <>
                    <span>Analyse Website</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Validation Error Message */}
          {error && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-rose-600 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick links & Demo CTA */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <span className="font-medium text-slate-400">Try an example:</span>
            <button
              type="button"
              onClick={() => handleExampleClick('https://example.com')}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono transition-colors"
            >
              example.com
            </button>
            <button
              type="button"
              onClick={() => handleExampleClick('https://news.ycombinator.com')}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono transition-colors"
            >
              news.ycombinator.com
            </button>
            <span className="text-slate-300">|</span>
            <Link
              href="/audit/demo"
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              View Demo Report (Score 78)
            </Link>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Real Server-Side Crawl</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>SSRF-Protected Security</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Zero Paid API Dependencies</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Deterministic Action Plans</span>
          </div>
        </div>
      </div>
    </section>
  );
}
