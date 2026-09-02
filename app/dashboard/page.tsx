'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { HistoryItem } from '@/lib/db/storage';
import { ScoreGauge } from '@/components/score-gauge';
import { validateAndNormalizeUrl } from '@/lib/security/url-validator';

export default function DashboardPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanUrl, setScanUrl] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/history');
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = validateAndNormalizeUrl(scanUrl);
    if (!val.isValid || !val.normalizedUrl) {
      setScanError(val.error || 'Please enter a valid website URL.');
      return;
    }
    router.push(`/audit?url=${encodeURIComponent(val.normalizedUrl)}`);
  };

  const avgScore = history.length > 0
    ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / history.length)
    : 78;

  const totalCritical = history.reduce((acc, h) => acc + h.criticalIssues, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            SEO AUTOPILOT Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time search health metrics, crawl analytics, and ongoing action plans.
          </p>
        </div>

        <Link
          href="/audit/demo"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-sm transition-colors self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>View Sample Demo Report</span>
        </Link>
      </div>

      {/* Quick Launch Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-card">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 block">
            Instant Crawl Engine
          </span>
          <h2 className="text-xl font-bold mb-4">
            Audit Any Target Website
          </h2>

          <form onSubmit={handleScanSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={scanUrl}
                onChange={(e) => {
                  setScanUrl(e.target.value);
                  if (scanError) setScanError(null);
                }}
                placeholder="https://example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-800 text-white placeholder:text-slate-400 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0 flex items-center justify-center gap-1.5"
            >
              <span>Scan Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {scanError && (
            <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {scanError}
            </p>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Audits Run
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {history.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Stored in database & cache
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Globe className="w-6 h-6 text-slate-700" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg. Health Score
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {avgScore} <span className="text-base font-normal text-slate-400">/ 100</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              Across all scanned properties
            </span>
          </div>
          <ScoreGauge score={avgScore} size="sm" showLabel={false} />
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Critical Issues Flagged
            </span>
            <div className="text-3xl font-black text-rose-600 mt-1">
              {totalCritical}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Blocking search indexability
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Audits Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Website Scans
            </h3>
            <p className="text-xs text-slate-500">
              Open previous audit reports to view AI recommendations and crawled pages.
            </p>
          </div>

          <Link
            href="/history"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All History</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading recent scans...
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <span>No audits recorded yet. Enter a website above to run your first crawl.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <ScoreGauge score={item.score} size="sm" showLabel={false} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/audit/${item.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition-colors truncate"
                      >
                        {item.url}
                      </Link>
                      {item.isDemo && (
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                          Demo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{item.pagesCrawled} pages</span>
                      {item.criticalIssues > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-rose-600 font-semibold">
                            {item.criticalIssues} critical
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Link
                    href={`/audit/${item.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-subtle transition-colors"
                  >
                    <span>View Audit</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
