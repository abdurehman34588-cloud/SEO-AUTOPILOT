'use client';

import React, { useState } from 'react';
import { Download, FileJson, FileText, Printer, Check, Copy } from 'lucide-react';
import { FullAudit } from '@/types/seo';

interface ExportReportProps {
  audit: FullAudit;
}

export function ExportReport({ audit }: ExportReportProps) {
  const [copied, setCopied] = useState(false);

  // Generate Markdown string
  const generateMarkdown = () => {
    return `# SEO AUTOPILOT Audit Report: ${audit.url}
Generated: ${new Date(audit.createdAt).toLocaleString()}

## Overall SEO Health Score: ${audit.score} / 100
- Technical SEO: ${audit.technicalScore} / 100
- On-Page SEO: ${audit.onPageScore} / 100
- Content Health: ${audit.contentScore} / 100
- On-Site Links: ${audit.linksScore} / 100

---

## Executive Summary
${audit.summary || 'No summary available.'}

---

## Prioritized AI Action Plan
${audit.recommendations
  .map(
    (r, i) => `### Priority ${r.priority || i + 1}: ${r.title}
- **Impact**: ${r.impact.toUpperCase()} | **Difficulty**: ${r.difficulty.toUpperCase()}
- **Affected Pages**: ${r.affectedPages || audit.url}
- **Remediation**: ${r.howToFix}
`
  )
  .join('\n')}

---

## Crawled Pages Sample (${audit.pages.length} pages)
${audit.pages
  .map(
    (p) => `- [${p.statusCode}] ${p.url} (Words: ${p.wordCount}, H1s: ${p.h1Count}, Images: ${p.imageCount}, Missing Alt: ${p.missingAltCount})`
  )
  .join('\n')}

---

## Detailed Issues (${audit.issues.length} total)
${audit.issues
  .map(
    (issue) => `### [${issue.severity.toUpperCase()}] ${issue.title}
- **Category**: ${issue.category} | **Status**: ${issue.status.toUpperCase()}
- **Description**: ${issue.description}
- **Recommendation**: ${issue.recommendation}
${issue.evidence ? `- **Evidence**: \`${issue.evidence}\`` : ''}
${issue.pageUrl ? `- **Page**: ${issue.pageUrl}` : ''}
`
  )
  .join('\n')}
`;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-audit-${audit.url.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const json = JSON.stringify(audit, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-audit-${audit.url.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopyMarkdown}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-subtle transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
        <span>{copied ? 'Copied MD!' : 'Copy Summary'}</span>
      </button>

      <button
        type="button"
        onClick={handleDownloadMarkdown}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-subtle transition-colors"
      >
        <FileText className="w-3.5 h-3.5 text-slate-500" />
        <span>Download Markdown</span>
      </button>

      <button
        type="button"
        onClick={handleDownloadJson}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-subtle transition-colors"
      >
        <FileJson className="w-3.5 h-3.5 text-slate-500" />
        <span>Export JSON</span>
      </button>

      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-subtle transition-colors"
      >
        <Printer className="w-3.5 h-3.5 text-slate-500" />
        <span>Print / PDF</span>
      </button>
    </div>
  );
}
