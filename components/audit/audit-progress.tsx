'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2, Sparkles, Globe, Server, FileText, Layers, Link as LinkIcon } from 'lucide-react';

interface AuditProgressProps {
  url: string;
  onComplete?: () => void;
}

interface Step {
  id: string;
  label: string;
  icon: any;
  duration: number; // ms
}

const STEPS: Step[] = [
  { id: 'prep', label: 'Preparing website & security checks...', icon: Globe, duration: 1500 },
  { id: 'homepage', label: 'Fetching homepage & HTML content...', icon: Server, duration: 2000 },
  { id: 'metadata', label: 'Analysing metadata & title tags...', icon: FileText, duration: 1800 },
  { id: 'headings', label: 'Checking headings & structure...', icon: Layers, duration: 1500 },
  { id: 'images', label: 'Inspecting images & alt attributes...', icon: FileText, duration: 1800 },
  { id: 'links', label: 'Checking on-site links & architecture...', icon: LinkIcon, duration: 2000 },
  { id: 'technical', label: 'Checking technical SEO, robots & sitemaps...', icon: Server, duration: 1800 },
  { id: 'ai', label: 'Generating AI recommendations & action plan...', icon: Sparkles, duration: 2200 },
  { id: 'complete', label: 'Audit complete!', icon: CheckCircle2, duration: 1000 },
];

export function AuditProgress({ url, onComplete }: AuditProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (currentStepIndex < STEPS.length - 1) {
      timeout = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, STEPS[currentStepIndex].duration);
    } else {
      if (onComplete) {
        timeout = setTimeout(onComplete, 800);
      }
    }
    return () => clearTimeout(timeout);
  }, [currentStepIndex, onComplete]);

  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / STEPS.length) * 100));

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-card">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Live Crawl in Progress</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Auditing Website
        </h2>
        <p className="text-sm font-mono text-slate-500 mt-1 truncate max-w-md mx-auto">
          {url}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
          <span>{STEPS[currentStepIndex].label}</span>
          <span className="font-mono text-emerald-600">{progressPercent}% ({elapsedSeconds}s)</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3 border-t border-slate-100 pt-6">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-all ${
                isCurrent
                  ? 'bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 font-semibold'
                  : isDone
                  ? 'text-slate-700 font-medium'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : isCurrent
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                </div>
                <span>{step.label}</span>
              </div>

              {isDone && (
                <span className="text-[11px] font-semibold text-emerald-600 uppercase">
                  Done
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
