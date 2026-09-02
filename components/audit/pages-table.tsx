'use client';

import React, { useState } from 'react';
import { CrawledPage } from '@/types/seo';
import { Globe, ExternalLink, Image as ImageIcon, Link as LinkIcon, Clock, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';

interface PagesTableProps {
  pages: CrawledPage[];
}

export function PagesTable({ pages }: PagesTableProps) {
  const [filter, setFilter] = useState('');

  const filteredPages = pages.filter(p =>
    p.url.toLowerCase().includes(filter.toLowerCase()) ||
    (p.title && p.title.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
      {/* Search Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Crawled Pages ({pages.length})
          </h3>
          <p className="text-xs text-slate-500">
            Sample of pages discovered and analyzed during this crawl session.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter crawled URLs..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100/75 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">URL & Title</th>
              <th className="py-3 px-4">Words</th>
              <th className="py-3 px-4">Headings</th>
              <th className="py-3 px-4">Images / Alt</th>
              <th className="py-3 px-4">Internal Links</th>
              <th className="py-3 px-4">TTFB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPages.map((page) => {
              const is200 = page.statusCode === 200;
              return (
                <tr key={page.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Status Code */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        is200
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {is200 ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-600" />
                      )}
                      {page.statusCode}
                    </span>
                  </td>

                  {/* URL & Title */}
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-mono text-slate-800 truncate flex items-center gap-1">
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-600 hover:underline inline-flex items-center gap-1 truncate"
                      >
                        {page.url}
                        <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                      </a>
                    </div>
                    <div className="text-[11px] text-slate-500 font-sans truncate mt-0.5">
                      {page.title || <span className="text-rose-500 italic">Missing Title</span>}
                    </div>
                  </td>

                  {/* Word Count */}
                  <td className="py-3 px-4 whitespace-nowrap font-medium">
                    <span className={page.wordCount < 200 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {page.wordCount.toLocaleString()}
                    </span>
                  </td>

                  {/* Headings */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">
                      H1: {page.h1Count}
                    </span>
                    <span className="text-slate-400 text-[10px] ml-1.5">
                      (H2: {page.h2Count}, H3: {page.h3Count})
                    </span>
                  </td>

                  {/* Images */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-slate-800 font-medium">
                      {page.imageCount} imgs
                    </span>
                    {page.missingAltCount > 0 && (
                      <span className="text-rose-600 font-bold text-[10px] ml-1 bg-rose-50 px-1.5 py-0.5 rounded">
                        {page.missingAltCount} missing alt
                      </span>
                    )}
                  </td>

                  {/* Internal Links */}
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                    {page.internalLinkCount} links
                  </td>

                  {/* TTFB */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {page.responseTimeMs}ms
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
