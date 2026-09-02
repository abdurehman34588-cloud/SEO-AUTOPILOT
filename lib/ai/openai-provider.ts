import { AIAnalysisResult } from '@/types/seo';
import { AuditDataForAI, AIProvider } from './ai-provider';
import { RuleBasedAIProvider } from './rule-based-ai';

export class OpenAIAIProvider implements AIProvider {
  name = 'OpenAI';
  private apiKey: string;
  private fallback = new RuleBasedAIProvider();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateRecommendations(data: AuditDataForAI): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      return this.fallback.generateRecommendations(data);
    }

    try {
      const prompt = `You are an expert SEO auditor and technical strategist.
Analyze the following verified SEO audit data for website: ${data.url}
SEO Health Score: ${data.score}/100
Technical Score: ${data.technicalScore}/100
On-Page Score: ${data.onPageScore}/100
Content Score: ${data.contentScore}/100
Links Score: ${data.linksScore}/100
Crawled Pages: ${data.pagesCount}

Verified Issues:
${JSON.stringify(
  data.issues.map(i => ({
    title: i.title,
    severity: i.severity,
    status: i.status,
    category: i.category,
    description: i.description,
    page: i.pageUrl,
  })).slice(0, 25),
  null,
  2
)}

Return a valid JSON object matching this structure:
{
  "summary": "Concise 2-3 sentence executive summary explaining overall site health and top priorities.",
  "priorityActions": [
    {
      "priority": 1,
      "title": "Action title",
      "description": "Why this matters",
      "impact": "high",
      "difficulty": "easy",
      "affectedPages": "affected URLs or site-wide",
      "howToFix": "Specific technical steps to fix this"
    }
  ],
  "recommendations": ["4-5 high level strategic recommendations"],
  "quickWins": ["3-4 fast high-impact quick wins"]
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You are an SEO expert generating structured audit action plans.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        return this.fallback.generateRecommendations(data);
      }

      const json = await response.json();
      const content = json?.choices?.[0]?.message?.content;
      if (!content) return this.fallback.generateRecommendations(data);

      const parsed = JSON.parse(content) as AIAnalysisResult;
      return {
        summary: parsed.summary || (await this.fallback.generateRecommendations(data)).summary,
        priorityActions: parsed.priorityActions || (await this.fallback.generateRecommendations(data)).priorityActions,
        recommendations: parsed.recommendations || (await this.fallback.generateRecommendations(data)).recommendations,
        quickWins: parsed.quickWins || (await this.fallback.generateRecommendations(data)).quickWins,
      };
    } catch {
      return this.fallback.generateRecommendations(data);
    }
  }
}
