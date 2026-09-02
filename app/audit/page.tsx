'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuditProgress } from '@/components/audit/audit-progress';
import { Globe, AlertCircle, ArrowLeft, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { validateAndNormalizeUrl } from '@/lib/security/url-validator';

function AuditLauncherContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawUrl = searchParams.get('url');

  const [urlInput, setUrlInput] = useState(rawUrl || '');
  const [isAuditing, setIsAuditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAudit = useCallback(async (target: string) => {
    setError(null);
    const validation = validateAndNormalizeUrl(target);
    if (!validation.isValid || !validation.normalizedUrl) {
      setError(validation.error || 'Please enter a valid website URL.');
      return;
    }

    setIsAuditing(true);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: validation.normalizedUrl }),
      });

      const data = await response.json();

      if (!response.ok || !data.auditId) {
        throw new Error(data.error || "We couldn't access this website. Check that the URL is correct and publicly accessible.");
      }

      // Allow progress animation to complete before navigation
      setTimeout(() => {
        router.push(`/audit/${data.auditId}`);
      }, 1000);
    } catch (err: any) {
      setIsAuditing(false);
      setError(err.message || 'Failed to complete website audit.');
    }
  }, [router]);

  useEffect(() => {
    if (rawUrl) {
      startAudit(rawUrl);
    }
  }, [rawUrl, startAudit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    startAudit(urlInput);
  };

  if (isAuditing) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <AuditProgress url={urlInput || rawUrl || 'Target Website'} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Return link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-card">
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
            <Globe className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Run Live SEO Audit
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Enter any public website to launch our server-side crawler and generate your prioritized SEO action roadmap.
          </p>
        </div>

        {/* Error Alert if any */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-rose-900">Audit Notice</h4>
              <p className="mt-0.5 text-xs leading-relaxed text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* Audit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="audit-url" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Target Website URL
            </label>
            <div className="relative">
              <Globe className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="audit-url"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Start SEO Audit</span>
          </button>
        </form>

        {/* Sample Links */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-400">Quick tests:</span>
            <button
              type="button"
              onClick={() => {
                setUrlInput('https://example.com');
                startAudit('https://example.com');
              }}
              className="font-mono text-emerald-700 hover:underline"
            >
              example.com
            </button>
          </div>

          <Link
            href="/audit/demo"
            className="inline-flex items-center gap-1 font-semibold text-amber-600 hover:text-amber-700"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Open Preloaded Demo
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading audit engine...</div>}>
      <AuditLauncherContent />
    </Suspense>
  );
}
