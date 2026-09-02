'use client';

import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  label = 'SEO Health Score',
  className = '',
}: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Size configurations
  const dimensions = {
    sm: { size: 64, stroke: 6, textClass: 'text-lg font-bold', subTextClass: 'text-[10px]' },
    md: { size: 100, stroke: 8, textClass: 'text-2xl font-bold', subTextClass: 'text-xs' },
    lg: { size: 140, stroke: 10, textClass: 'text-3xl font-extrabold', subTextClass: 'text-xs' },
    xl: { size: 190, stroke: 13, textClass: 'text-5xl font-black tracking-tight', subTextClass: 'text-sm' },
  }[size];

  const radius = (dimensions.size - dimensions.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Color selection based on score threshold
  const getScoreColors = (s: number) => {
    if (s >= 85) return { stroke: '#10b981', bg: '#ecfdf5', text: 'text-emerald-700', rating: 'Excellent' };
    if (s >= 70) return { stroke: '#0284c7', bg: '#f0f9ff', text: 'text-sky-700', rating: 'Good' };
    if (s >= 50) return { stroke: '#f59e0b', bg: '#fffbeb', text: 'text-amber-700', rating: 'Fair' };
    return { stroke: '#ef4444', bg: '#fef2f2', text: 'text-rose-700', rating: 'Needs Work' };
  };

  const colors = getScoreColors(clampedScore);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: dimensions.size, height: dimensions.size }}>
        <svg
          width={dimensions.size}
          height={dimensions.size}
          className="transform -rotate-90 transition-transform duration-700"
        >
          {/* Background circle track */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`${dimensions.textClass} text-slate-900 leading-none`}>
            {clampedScore}
          </span>
          {size !== 'sm' && (
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">/ 100</span>
          )}
        </div>
      </div>

      {showLabel && (
        <div className="text-center mt-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </div>
          <div className={`text-xs font-semibold ${colors.text} mt-0.5`}>
            {colors.rating}
          </div>
        </div>
      )}
    </div>
  );
}
