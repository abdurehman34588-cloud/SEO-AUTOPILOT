'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  History as HistoryIcon,
  Search,
  Globe,
  Trash2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { HistoryItem } from '@/lib/db/storage';
import { ScoreGauge } from '@/components/score-gauge';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
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
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this audit report?')) return;

    try {
      await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert('Failed to delete audit record');
    }
  };

  const filteredHistory = history.filter((item) =>
    item.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <HistoryIcon className="w-7 h-7 text-emerald-600" />
            <span>Audit History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review and compare previous SEO audits and recommendations.
          </p>
        </div>

        <Link
          href="/#run-audit"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <span>Run New Scan</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search past websites..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredHistory.length} audit report{filteredHistory.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Audit List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading audit history...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <Globe className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Audits Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search ? 'No audited websites match your search query.' : 'Enter a website on the homepage to generate your first SEO health report.'}
            </p>
            <Link
              href="/"
              className="inline-block mt-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              Start Free Audit
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/80 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">SEO Health Score</th>
                  <th className="py-3.5 px-4">Website URL</th>
                  <th className="py-3.5 px-4">Pages Crawled</th>
                  <th className="py-3.5 px-4">Critical Issues</th>
                  <th className="py-3.5 px-4">Date Scanned</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Score */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <ScoreGauge score={item.score} size="sm" showLabel={false} />
                        <span className="font-bold text-sm text-slate-900">
                          {item.score} / 100
                        </span>
                      </div>
                    </td>

                    {/* Website URL */}
                    <td className="py-4 px-4 font-mono text-slate-900 font-semibold max-w-xs">
                      <div className="flex items-center gap-2 truncate">
                        <Link
                          href={`/audit/${item.id}`}
                          className="hover:text-emerald-600 hover:underline truncate"
                        >
                          {item.url}
                        </Link>
                        {item.isDemo && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase shrink-0">
                            Demo
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Pages Crawled */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-700 font-medium">
                      {item.pagesCrawled} pages
                    </td>

                    {/* Critical Issues */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.criticalIssues > 0 ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                          <AlertCircle className="w-3 h-3" />
                          {item.criticalIssues} critical
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          0 critical
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 whitespace-nowrap text-right space-x-2">
                      <Link
                        href={`/audit/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 rounded-lg shadow-subtle transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      {!item.isDemo && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          aria-label="Delete audit record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
