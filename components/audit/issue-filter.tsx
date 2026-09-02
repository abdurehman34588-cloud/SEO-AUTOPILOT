'use client';

import React from 'react';
import { Search, Filter, AlertCircle, AlertTriangle, CheckCircle2, ListFilter } from 'lucide-react';
import { CheckCategory } from '@/types/seo';

interface IssueFilterProps {
  activeTab: string; // 'all' | 'critical' | 'warning' | 'pass'
  onTabChange: (tab: string) => void;
  activeCategory: string; // 'ALL' | CheckCategory
  onCategoryChange: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: {
    all: number;
    critical: number;
    warning: number;
    pass: number;
  };
}

export function IssueFilter({
  activeTab,
  onTabChange,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  counts,
}: IssueFilterProps) {
  const tabs = [
    { id: 'all', label: 'All Checks', count: counts.all, icon: ListFilter },
    { id: 'critical', label: 'Critical Issues', count: counts.critical, icon: AlertCircle, badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'warning', label: 'High Priority', count: counts.warning, icon: AlertTriangle, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'pass', label: 'Passed Checks', count: counts.pass, icon: CheckCircle2, badgeColor: 'bg-emerald-100 text-emerald-800' },
  ];

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'TECHNICAL', label: 'Technical SEO' },
    { id: 'ON_PAGE', label: 'On-Page SEO' },
    { id: 'CONTENT', label: 'Content' },
    { id: 'LINKS', label: 'On-Site Links' },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
      {/* Top row: Status Tabs & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${
                  tab.id === 'critical' ? 'text-rose-600' :
                  tab.id === 'warning' ? 'text-amber-600' :
                  tab.id === 'pass' ? 'text-emerald-600' : 'text-slate-500'
                }`} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Query Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search checks, titles, URLs..."
            className="w-full pl-9 pr-3.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider mr-1">
          Category:
        </span>
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                isSelected
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
