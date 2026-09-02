export type CheckCategory = 'TECHNICAL' | 'ON_PAGE' | 'CONTENT' | 'LINKS';
export type IssueSeverity = 'critical' | 'warning' | 'info';
export type IssueStatus = 'pass' | 'warning' | 'fail';
export type AuditStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AuditIssue {
  id: string;
  category: CheckCategory;
  title: string;
  severity: IssueSeverity;
  status: IssueStatus;
  score: number; // 0 to 100 contribution
  description: string; // What is wrong & why it matters
  recommendation: string; // How to fix it
  evidence?: string;
  pageUrl?: string;
  pageId?: string;
}

export interface ExtractedImage {
  src: string;
  alt: string;
  hasAlt: boolean;
  isAltEmpty: boolean;
}

export interface ExtractedLink {
  href: string;
  text: string;
  isInternal: boolean;
  isExternal: boolean;
}

export interface CrawledPage {
  id: string;
  url: string;
  statusCode: number;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  robotsMeta: string | null;
  viewport: string | null;
  h1Count: number;
  h1List: string[];
  h2Count: number;
  h2List: string[];
  h3Count: number;
  h3List: string[];
  wordCount: number;
  imageCount: number;
  missingAltCount: number;
  images: ExtractedImage[];
  internalLinkCount: number;
  externalLinkCount: number;
  internalLinks: string[];
  externalLinks: string[];
  responseTimeMs: number;
  contentType: string | null;
  isHttps: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  rawText?: string;
  issues: AuditIssue[];
}

export interface CategoryScoreBreakdown {
  score: number; // 0 to 100
  weight: number; // 0.3, 0.3, 0.25, 0.15
  passed: number;
  warnings: number;
  failures: number;
  totalChecks: number;
}

export interface AIActionItem {
  id?: string;
  priority: number;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  affectedPages?: string;
  howToFix: string;
}

export interface AIAnalysisResult {
  summary: string;
  priorityActions: AIActionItem[];
  recommendations: string[];
  quickWins: string[];
}

export interface FullAudit {
  id: string;
  url: string;
  normalizedUrl: string;
  status: AuditStatus;
  score: number; // 0 to 100 overall
  technicalScore: number;
  onPageScore: number;
  contentScore: number;
  linksScore: number;
  isDemo: boolean;
  summary: string | null;
  createdAt: string;
  completedAt: string | null;
  pages: CrawledPage[];
  issues: AuditIssue[];
  recommendations: AIActionItem[];
  quickWins?: string[];
  error?: string;
}

export interface AuditProgressEvent {
  stage: 'init' | 'homepage' | 'metadata' | 'headings' | 'images' | 'links' | 'technical' | 'ai' | 'complete' | 'error';
  message: string;
  progressPercent: number;
  crawledCount?: number;
  totalEstimated?: number;
}
