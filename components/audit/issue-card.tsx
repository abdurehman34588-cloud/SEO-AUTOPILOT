'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, AlertTriangle, CheckCircle2, Globe, ExternalLink, HelpCircle, Lightbulb, Code2 } from 'lucide-react';
import { AuditIssue } from '@/types/seo';

interface IssueCardProps {
  issue: AuditIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Styling based on severity & status
  const getBadgeConfig = () => {
    if (issue.status === 'pass') {
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
        iconColor: 'text-emerald-600',
        label: 'Passed Check',
      };
    }
    if (issue.severity === 'critical') {
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: AlertCircle,
        iconColor: 'text-rose-600',
        label: 'Critical Issue',
      };
    }
    return {
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      label: 'High Priority',
    };
  };

  const badge = getBadgeConfig();
  const Icon = badge.icon;

  // Split description if it follows WHAT / WHY format or use direct
  const descriptionParts = issue.description.split('\n');
  const hasStructuredParts = descriptionParts.some(p => p.startsWith('WHAT:') || p.startsWith('WHY:') || p.startsWith('HOW TO FIX:'));

  return (
    <div className={`bg-white rounded-2xl border transition-all ${
      expanded ? 'border-slate-300 shadow-md ring-1 ring-slate-200' : 'border-slate-200 hover:border-slate-300 shadow-subtle'
    }`}>
      {/* Header Row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${badge.badge}`}>
            <Icon className={`w-4 h-4 ${badge.iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${badge.badge}`}>
                {badge.label}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                {issue.category}
              </span>
              {issue.pageUrl && (
                <span className="text-xs text-slate-400 font-mono truncate max-w-xs hidden sm:inline">
                  {issue.pageUrl}
                </span>
              )}
            </div>

            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {issue.title}
            </h4>

            {!expanded && (
              <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                {issue.description.replace(/WHAT:|WHY:|HOW TO FIX:/g, '').trim()}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          aria-label={expanded ? 'Collapse details' : 'View details'}
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Details Section */}
      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-xs sm:text-sm">
          {/* Affected URL if present */}
          {issue.pageUrl && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-700">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-500">Affected URL:</span>
              <a
                href={issue.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline truncate inline-flex items-center gap-1"
              >
                {issue.pageUrl}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}

          {/* Structured WHAT / WHY / HOW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What & Why */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>What is wrong & Why it matters</span>
                </div>
                <div className="text-slate-600 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
                  {issue.description}
                </div>
              </div>
            </div>

            {/* How To Fix */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs uppercase tracking-wider mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                  <span>How to fix it</span>
                </div>
                <p className="text-emerald-900/90 leading-relaxed text-xs sm:text-sm font-medium">
                  {issue.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Evidence Snippet */}
          {issue.evidence && (
            <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 font-sans text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                <Code2 className="w-3.5 h-3.5" />
                <span>Extracted Evidence</span>
              </div>
              <div className="overflow-x-auto text-emerald-300 select-all p-1 bg-slate-950/60 rounded">
                {issue.evidence}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
