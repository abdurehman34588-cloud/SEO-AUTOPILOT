'use client';

import React, { useState } from 'react';
import { Settings as SettingsIcon, Sparkles, ShieldCheck, Database, Sliders, Check, Info } from 'lucide-react';

export default function SettingsPage() {
  const [provider, setProvider] = useState('rules');
  const [apiKey, setApiKey] = useState('');
  const [maxPages, setMaxPages] = useState(10);
  const [maxDepth, setMaxDepth] = useState(2);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-slate-700" />
          <span>Application Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure AI recommendation engines, crawler depth parameters, and storage connections.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Provider Config */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card space-y-5">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>AI Recommendation Provider</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Choose which intelligence engine generates your executive summaries and action plans. When no API key is set, SEO AUTOPILOT automatically utilizes its deterministic heuristic rule engine.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'rules', label: 'Deterministic Heuristics', desc: 'Built-in (Zero API keys needed)', active: true },
              { id: 'gemini', label: 'Google Gemini AI', desc: 'gemini-1.5-flash model' },
              { id: 'openai', label: 'OpenAI GPT', desc: 'gpt-4o-mini model' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  provider === opt.id
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div>
                  <input
                    type="radio"
                    name="provider"
                    value={opt.id}
                    checked={provider === opt.id}
                    onChange={(e) => setProvider(e.target.value)}
                    className="sr-only"
                  />
                  <div className="font-bold text-xs text-slate-900">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{opt.desc}</div>
                </div>
                {provider === opt.id && (
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <Check className="w-3 h-3" />
                    Selected
                  </div>
                )}
              </label>
            ))}
          </div>

          {provider !== 'rules' && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {provider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 block">
                API keys can also be specified securely in your server’s <code className="bg-slate-100 px-1 py-0.5 rounded">.env</code> file via <code className="bg-slate-100 px-1 py-0.5 rounded">AI_API_KEY</code>.
              </span>
            </div>
          )}
        </div>

        {/* Crawler Parameters */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card space-y-5">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
            <Sliders className="w-5 h-5 text-slate-700" />
            <span>Crawler Limits & Limits Safeguards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Maximum Pages per Audit
              </label>
              <select
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value={5}>5 Pages (Ultra-Fast)</option>
                <option value={10}>10 Pages (Recommended MVP)</option>
                <option value={20}>20 Pages (Comprehensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Maximum Internal Crawl Depth
              </label>
              <select
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value={1}>Depth 1 (Homepage & Direct Links)</option>
                <option value={2}>Depth 2 (Subpages - Recommended)</option>
                <option value={3}>Depth 3 (Deep Traversal)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database & Architecture Info */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
            <Database className="w-5 h-5 text-slate-700" />
            <span>Persistence & Database Layer</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <p><strong>ORM Engine:</strong> Prisma 5.x</p>
            <p><strong>Default Local Database:</strong> SQLite (<code className="font-mono">prisma/dev.db</code>)</p>
            <p><strong>Production Support:</strong> PostgreSQL compatible via <code className="font-mono">DATABASE_URL</code></p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Settings Saved Successfully!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
