'use client';

import React from 'react';
import { Server, FileText, Layers, Link as LinkIcon, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { CheckCategory } from '@/types/seo';
import { ScoreGauge } from '../score-gauge';

interface CategoryBreakdownProps {
  technicalScore: number;
  onPageScore: number;
  contentScore: number;
  linksScore: number;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  counts: Record<CheckCategory, { passed: number; warnings: number; failures: number }>;
}

export function CategoryBreakdown({
  technicalScore,
  onPageScore,
  contentScore,
  linksScore,
  activeCategory,
  onSelectCategory,
  counts,
}: CategoryBreakdownProps) {
  const cards = [
    {
      id: 'TECHNICAL',
      label: 'Technical SEO',
      weight: '30% Weight',
      score: technicalScore,
      icon: Server,
      counts: counts.TECHNICAL || { passed: 0, warnings: 0, failures: 0 },
    },
    {
      id: 'ON_PAGE',
      label: 'On-Page SEO',
      weight: '30% Weight',
      score: onPageScore,
      icon: FileText,
      counts: counts.ON_PAGE || { passed: 0, warnings: 0, failures: 0 },
    },
    {
      id: 'CONTENT',
      label: 'Content Health',
      weight: '25% Weight',
      score: contentScore,
      icon: Layers,
      counts: counts.CONTENT || { passed: 0, warnings: 0, failures: 0 },
    },
    {
      id: 'LINKS',
      label: 'On-Site Links',
      weight: '15% Weight',
      score: linksScore,
      icon: LinkIcon,
      counts: counts.LINKS || { passed: 0, warnings: 0, failures: 0 },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeCategory === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectCategory(isSelected ? 'ALL' : card.id)}
            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
              isSelected
                ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200 shadow-subtle hover:border-slate-300 hover:shadow-card'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {card.label}
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">
                    {card.weight}
                  </span>
                </div>
              </div>
              <ScoreGauge score={card.score} size="sm" showLabel={false} />
            </div>

            {/* Status breakdown pills */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                {card.counts.passed} Pass
              </span>
              {card.counts.warnings > 0 && (
                <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  {card.counts.warnings} Warn
                </span>
              )}
              {card.counts.failures > 0 && (
                <span className="flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                  <XCircle className="w-3 h-3 text-rose-600" />
                  {card.counts.failures} Fail
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
