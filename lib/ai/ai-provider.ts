import { AIActionItem, AIAnalysisResult, AuditIssue, CrawledPage } from '@/types/seo';
import { RuleBasedAIProvider } from './rule-based-ai';
import { GeminiAIProvider } from './gemini-provider';
import { OpenAIAIProvider } from './openai-provider';

export interface AuditDataForAI {
  url: string;
  score: number;
  technicalScore: number;
  onPageScore: number;
  contentScore: number;
  linksScore: number;
  pagesCount: number;
  issues: AuditIssue[];
  pages: CrawledPage[];
}

export interface AIProvider {
  name: string;
  generateRecommendations(data: AuditDataForAI): Promise<AIAnalysisResult>;
}

export function getAiProvider(providerName?: string, apiKey?: string): AIProvider {
  const chosenProvider = (providerName || process.env.AI_PROVIDER || 'rules').toLowerCase();
  const key = apiKey || process.env.AI_API_KEY || '';

  if (chosenProvider === 'gemini' && key) {
    return new GeminiAIProvider(key);
  }

  if (chosenProvider === 'openai' && key) {
    return new OpenAIAIProvider(key);
  }

  // Default fallback: deterministic rule-based engine (zero external API dependency)
  return new RuleBasedAIProvider();
}
