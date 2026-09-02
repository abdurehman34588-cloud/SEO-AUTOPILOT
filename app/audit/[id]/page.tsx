'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Globe,
  Calendar,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Layers,
  FileText,
  Server,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Search,
  ListOrdered,
  Eye,
} from 'lucide-react';
import { FullAudit, CheckCategory, AuditIssue } from '@/types/seo';
import { ScoreGauge } from '@/components/score-gauge';
import { CategoryBreakdown } from '@/components/audit/category-breakdown';
import { IssueFilter } from '@/components/audit/issue-filter';
import { IssueCard } from '@/components/audit/issue-card';
import { AIActionPlan } from '@/components/audit/ai-action-plan';
import { PagesTable } from '@/components/audit/pages-table';
import { ExportReport } from '@/components/audit/export-report';
import { DEMO_AUDIT } from '@/lib/demo/demo-audit';

export default function AuditReportPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params?.id as string;

  const [audit, setAudit] = useState<FullAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'critical' | 'warning' | 'pass'
  const [activeCategory, setActiveCategory] = useState<string>('ALL'); // 'ALL' | 'TECHNICAL' | 'ON_PAGE' | 'CONTENT' | 'LINKS'
  const [searchQuery, setSearchQuery] = useState('');
  const [mainViewTab, setMainViewTab] = useState<'issues' | 'action_plan' | 'pages'>('issues');

  useEffect(() => {
    async function fetchAudit() {
      if (!auditId) return;

      if (auditId === 'demo') {
        setAudit(DEMO_AUDIT);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/audit/${auditId}`);
        if (!res.ok) {
          throw new Error('Audit report not found');
        }
        const data = await res.json();
        setAudit(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load audit report');
      } finally {
        setLoading(false);
      }
    }

    fetchAudit();
  }, [auditId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading audit report...</p>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-card space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Audit Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || 'This audit report may have expired or is unavailable.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Start New Audit
            </Link>
            <Link
              href="/audit/demo"
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              View Demo Report
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate issue counts for filters
  const criticalCount = audit.issues.filter((i) => i.severity === 'critical' && i.status === 'fail').length;
  const warningCount = audit.issues.filter((i) => i.severity === 'warning' && (i.status === 'warning' || i.status === 'fail')).length;
  const passCount = audit.issues.filter((i) => i.status === 'pass').length;

  // Category counts
  const categoryCounts: Record<CheckCategory, { passed: number; warnings: number; failures: number }> = {
    TECHNICAL: {
      passed: audit.issues.filter((i) => i.category === 'TECHNICAL' && i.status === 'pass').length,
      warnings: audit.issues.filter((i) => i.category === 'TECHNICAL' && i.status === 'warning').length,
      failures: audit.issues.filter((i) => i.category === 'TECHNICAL' && i.status === 'fail').length,
    },
    ON_PAGE: {
      passed: audit.issues.filter((i) => i.category === 'ON_PAGE' && i.status === 'pass').length,
      warnings: audit.issues.filter((i) => i.category === 'ON_PAGE' && i.status === 'warning').length,
      failures: audit.issues.filter((i) => i.category === 'ON_PAGE' && i.status === 'fail').length,
    },
    CONTENT: {
      passed: audit.issues.filter((i) => i.category === 'CONTENT' && i.status === 'pass').length,
      warnings: audit.issues.filter((i) => i.category === 'CONTENT' && i.status === 'warning').length,
      failures: audit.issues.filter((i) => i.category === 'CONTENT' && i.status === 'fail').length,
    },
    LINKS: {
      passed: audit.issues.filter((i) => i.category === 'LINKS' && i.status === 'pass').length,
      warnings: audit.issues.filter((i) => i.category === 'LINKS' && i.status === 'warning').length,
      failures: audit.issues.filter((i) => i.category === 'LINKS' && i.status === 'fail').length,
    },
  };

  // Filter issues based on activeTab, activeCategory, and searchQuery
  const filteredIssues = audit.issues.filter((issue) => {
    // Status tab filter
    if (activeTab === 'critical' && !(issue.severity === 'critical' && issue.status === 'fail')) return false;
    if (activeTab === 'warning' && !(issue.severity === 'warning' && (issue.status === 'warning' || issue.status === 'fail'))) return false;
    if (activeTab === 'pass' && issue.status !== 'pass') return false;

    // Category filter
    if (activeCategory !== 'ALL' && issue.category !== activeCategory) return false;

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchUrl = issue.pageUrl?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchUrl) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              New Scan
            </Link>

            {audit.isDemo && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                DEMO DATA
              </span>
            )}

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Audit Completed
            </span>
          </div>

          <div className="pt-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md inline-block mb-1 border border-slate-200">
              AUDITED URL: <span className="font-mono text-slate-900 font-bold lowercase">{audit.url}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{audit.url}</span>
              <a
                href={audit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Open website"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Last scanned: {new Date(audit.createdAt).toLocaleString()}
            </span>
            <span>•</span>
            <span>{audit.pages.length} Pages Crawled</span>
            <span>•</span>
            <span className="font-semibold text-rose-600">
              {criticalCount} Critical Issue{criticalCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Action bar (Export & Rescan) */}
        <div className="flex flex-wrap items-center gap-2">
          <ExportReport audit={audit} />
          <Link
            href={`/audit?url=${encodeURIComponent(audit.url)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-scan
          </Link>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card">
        <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
          {/* Circular Score Gauge */}
          <div className="shrink-0 flex flex-col items-center">
            <ScoreGauge score={audit.score} size="xl" label="SEO Health Score" />
          </div>

          {/* Score Explanation & Quick Stats */}
          <div className="flex-1 text-center lg:text-left space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Comprehensive Audit Evaluation
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {audit.score >= 85 ? 'Excellent SEO Foundation' : audit.score >= 70 ? 'Solid Health With High-Impact Quick Wins' : 'Requires Priority Remediation'}
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-2xl">
                {audit.summary || 'Follow the prioritized action plan below to address structural issues and improve crawlability.'}
              </p>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-md">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="block text-lg font-black text-rose-600 leading-tight">
                  {criticalCount}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Critical
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="block text-lg font-black text-amber-600 leading-tight">
                  {warningCount}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Warnings
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="block text-lg font-black text-emerald-600 leading-tight">
                  {passCount}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Passed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Category Cards Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Pillar Health Breakdown
          </h3>
          <span className="text-xs text-slate-400">
            Click any pillar to filter issues below
          </span>
        </div>
        <CategoryBreakdown
          technicalScore={audit.technicalScore}
          onPageScore={audit.onPageScore}
          contentScore={audit.contentScore}
          linksScore={audit.linksScore}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setMainViewTab('issues');
          }}
          counts={categoryCounts}
        />
      </div>

      {/* Main View Mode Selector (Issues vs AI Action Plan vs Crawled Pages) */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setMainViewTab('issues')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            mainViewTab === 'issues'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Detailed Issues ({audit.issues.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainViewTab('action_plan')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            mainViewTab === 'action_plan'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>AI Action Plan ({audit.recommendations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainViewTab('pages')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            mainViewTab === 'pages'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Crawled Pages ({audit.pages.length})</span>
        </button>
      </div>

      {/* View Tab 1: Issues View */}
      {mainViewTab === 'issues' && (
        <div className="space-y-4">
          <IssueFilter
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            counts={{
              all: audit.issues.length,
              critical: criticalCount,
              warning: warningCount,
              pass: passCount,
            }}
          />

          {filteredIssues.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-900">No issues found</h4>
              <p className="text-xs text-slate-500 mt-1">
                No checks match your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Tab 2: AI Action Plan */}
      {mainViewTab === 'action_plan' && (
        <AIActionPlan
          summary={audit.summary}
          actions={audit.recommendations}
          quickWins={audit.quickWins}
        />
      )}

      {/* View Tab 3: Crawled Pages Table */}
      {mainViewTab === 'pages' && <PagesTable pages={audit.pages} />}
    </div>
  );
}
