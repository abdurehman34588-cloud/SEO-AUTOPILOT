'use client';

import React from 'react';
import { Sparkles, Zap, Flame, ShieldAlert, ArrowRight, CheckCircle2, Wrench, Clock, FileCode } from 'lucide-react';
import { AIActionItem } from '@/types/seo';

interface AIActionPlanProps {
  summary: string | null;
  actions: AIActionItem[];
  quickWins?: string[];
  recommendations?: string[];
}

export function AIActionPlan({ summary, actions, quickWins, recommendations }: AIActionPlanProps) {
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">High Impact</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Medium Impact</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Low Impact</span>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Easy Fix (&lt; 15 mins)</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Medium Effort</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Advanced / Refactor</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Executive AI Summary Box */}
      {summary && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white shadow-card border border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Executive Analysis</span>
          </div>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
            {summary}
          </p>
        </div>
      )}

      {/* Quick Wins Header Strip */}
      {quickWins && quickWins.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-subtle">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
            <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>High-Impact Quick Wins</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quickWins.map((win, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-amber-950 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{win}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Sequenced Action Plan */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              YOUR SEO ACTION PLAN
            </h3>
            <p className="text-xs text-slate-500">
              Rank-ordered by highest expected return on search visibility and indexing health.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {actions.length} Sequenced Actions
          </span>
        </div>

        <div className="space-y-4">
          {actions.map((action, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle hover:border-slate-300 hover:shadow-card transition-all"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold shadow-sm">
                    Priority {action.priority || idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">
                    {action.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {getImpactBadge(action.impact)}
                  {getDifficultyBadge(action.difficulty)}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {action.description}
              </p>

              {/* Affected pages */}
              {action.affectedPages && (
                <div className="mb-4 flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-mono text-slate-700">
                  <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-500 font-sans">Affected:</span>
                  <span className="truncate">{action.affectedPages}</span>
                </div>
              )}

              {/* Remediation Guide */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs uppercase tracking-wider mb-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                  <span>How To Fix</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed">
                  {action.howToFix}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
