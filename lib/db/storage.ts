import { FullAudit, CrawledPage, AuditIssue, AIActionItem } from '@/types/seo';
import { prisma } from './prisma';
import { DEMO_AUDIT } from '../demo/demo-audit';

// In-memory cache for fast access & offline development fallback
const memoryAudits = new Map<string, FullAudit>();
memoryAudits.set(DEMO_AUDIT.id, DEMO_AUDIT);
memoryAudits.set('demo', DEMO_AUDIT);

export interface HistoryItem {
  id: string;
  url: string;
  normalizedUrl: string;
  score: number;
  technicalScore: number;
  onPageScore: number;
  contentScore: number;
  linksScore: number;
  pagesCrawled: number;
  criticalIssues: number;
  status: string;
  createdAt: string;
  isDemo: boolean;
}

/**
 * Saves a completed audit into the database and memory cache.
 */
export async function saveAudit(audit: FullAudit): Promise<void> {
  // Always update memory cache
  memoryAudits.set(audit.id, audit);

  try {
    const existing = await prisma.audit.findUnique({
      where: { id: audit.id },
      select: { id: true },
    });
    if (existing) {
      return;
    }

    // Save to Prisma database
    await prisma.audit.create({
      data: {
        id: audit.id,
        url: audit.url,
        normalizedUrl: audit.normalizedUrl,
        status: audit.status,
        score: audit.score,
        technicalScore: audit.technicalScore,
        onPageScore: audit.onPageScore,
        contentScore: audit.contentScore,
        linksScore: audit.linksScore,
        isDemo: audit.isDemo,
        summary: audit.summary,
        createdAt: new Date(audit.createdAt),
        completedAt: audit.completedAt ? new Date(audit.completedAt) : null,
        pages: {
          create: audit.pages.map(p => ({
            id: p.id,
            url: p.url,
            statusCode: p.statusCode,
            title: p.title,
            metaDescription: p.metaDescription,
            canonical: p.canonical,
            h1Count: p.h1Count,
            h2Count: p.h2Count,
            wordCount: p.wordCount,
            imageCount: p.imageCount,
            missingAltCount: p.missingAltCount,
            internalLinkCount: p.internalLinkCount,
            externalLinkCount: p.externalLinkCount,
            responseTimeMs: p.responseTimeMs,
          })),
        },
        issues: {
          create: audit.issues.map(i => ({
            id: i.id,
            pageId: i.pageId || null,
            category: i.category,
            severity: i.severity,
            status: i.status,
            title: i.title,
            description: i.description,
            recommendation: i.recommendation,
            evidence: i.evidence || null,
          })),
        },
        recommendations: {
          create: audit.recommendations.map(r => ({
            priority: r.priority,
            title: r.title,
            description: r.description,
            impact: r.impact,
            difficulty: r.difficulty,
            affectedPages: r.affectedPages || null,
          })),
        },
      },
    });
  } catch (err) {
    console.warn('Storage notice: Database persistence fallback to memory cache', err);
  }
}

/**
 * Retrieves a full audit by its ID.
 */
export async function getAuditById(id: string): Promise<FullAudit | null> {
  if (id === 'demo' || id === DEMO_AUDIT.id) {
    return DEMO_AUDIT;
  }

  // Check memory cache first
  if (memoryAudits.has(id)) {
    return memoryAudits.get(id)!;
  }

  try {
    const dbAudit = await prisma.audit.findUnique({
      where: { id },
      include: {
        pages: true,
        issues: true,
        recommendations: true,
      },
    });

    if (!dbAudit) return null;

    const fullAudit: FullAudit = {
      id: dbAudit.id,
      url: dbAudit.url,
      normalizedUrl: dbAudit.normalizedUrl,
      status: dbAudit.status as any,
      score: dbAudit.score,
      technicalScore: dbAudit.technicalScore,
      onPageScore: dbAudit.onPageScore,
      contentScore: dbAudit.contentScore,
      linksScore: dbAudit.linksScore,
      isDemo: dbAudit.isDemo,
      summary: dbAudit.summary,
      createdAt: dbAudit.createdAt.toISOString(),
      completedAt: dbAudit.completedAt?.toISOString() || null,
      pages: dbAudit.pages.map(p => ({
        id: p.id,
        url: p.url,
        statusCode: p.statusCode,
        title: p.title,
        metaDescription: p.metaDescription,
        canonical: p.canonical,
        robotsMeta: null,
        viewport: null,
        h1Count: p.h1Count,
        h1List: [],
        h2Count: p.h2Count,
        h2List: [],
        h3Count: 0,
        h3List: [],
        wordCount: p.wordCount,
        imageCount: p.imageCount,
        missingAltCount: p.missingAltCount,
        images: [],
        internalLinkCount: p.internalLinkCount,
        externalLinkCount: p.externalLinkCount,
        internalLinks: [],
        externalLinks: [],
        responseTimeMs: p.responseTimeMs,
        contentType: 'text/html',
        isHttps: p.url.startsWith('https://'),
        hasRobotsTxt: true,
        hasSitemap: true,
        issues: [],
      })),
      issues: dbAudit.issues.map(i => ({
        id: i.id,
        category: i.category as any,
        severity: i.severity as any,
        status: i.status as any,
        score: i.status === 'pass' ? 100 : i.severity === 'critical' ? 0 : 60,
        title: i.title,
        description: i.description,
        recommendation: i.recommendation,
        evidence: i.evidence || undefined,
        pageId: i.pageId || undefined,
      })),
      recommendations: dbAudit.recommendations.map(r => ({
        priority: r.priority,
        title: r.title,
        description: r.description,
        impact: r.impact as any,
        difficulty: r.difficulty as any,
        affectedPages: r.affectedPages || undefined,
        howToFix: r.description,
      })),
    };

    memoryAudits.set(id, fullAudit);
    return fullAudit;
  } catch {
    return null;
  }
}

/**
 * Lists past audit history items.
 */
export async function getAuditHistory(): Promise<HistoryItem[]> {
  const historyList: HistoryItem[] = [];

  try {
    const dbAudits = await prisma.audit.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        pages: { select: { id: true } },
        issues: { select: { severity: true, status: true } },
      },
      take: 50,
    });

    for (const a of dbAudits) {
      historyList.push({
        id: a.id,
        url: a.url,
        normalizedUrl: a.normalizedUrl,
        score: a.score,
        technicalScore: a.technicalScore,
        onPageScore: a.onPageScore,
        contentScore: a.contentScore,
        linksScore: a.linksScore,
        pagesCrawled: a.pages.length,
        criticalIssues: a.issues.filter(i => i.severity === 'critical' && i.status === 'fail').length,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
        isDemo: a.isDemo,
      });
    }

    // Merge in-memory audits
    for (const [id, a] of memoryAudits.entries()) {
      if (id === 'demo' || historyList.some(h => h.id === id)) continue;
      historyList.unshift({
        id: a.id,
        url: a.url,
        normalizedUrl: a.normalizedUrl,
        score: a.score,
        technicalScore: a.technicalScore,
        onPageScore: a.onPageScore,
        contentScore: a.contentScore,
        linksScore: a.linksScore,
        pagesCrawled: a.pages.length,
        criticalIssues: a.issues.filter(i => i.severity === 'critical' && i.status === 'fail').length,
        status: a.status,
        createdAt: a.createdAt,
        isDemo: a.isDemo,
      });
    }
  } catch {
    // If DB is not ready, read from memory audits
    for (const a of memoryAudits.values()) {
      if (a.id === 'demo') continue; // Avoid duplicate demo listing
      historyList.push({
        id: a.id,
        url: a.url,
        normalizedUrl: a.normalizedUrl,
        score: a.score,
        technicalScore: a.technicalScore,
        onPageScore: a.onPageScore,
        contentScore: a.contentScore,
        linksScore: a.linksScore,
        pagesCrawled: a.pages.length,
        criticalIssues: a.issues.filter(i => i.severity === 'critical' && i.status === 'fail').length,
        status: a.status,
        createdAt: a.createdAt,
        isDemo: a.isDemo,
      });
    }
  }

  // If list is empty, always show DEMO_AUDIT for instant preview
  if (historyList.length === 0) {
    historyList.push({
      id: DEMO_AUDIT.id,
      url: DEMO_AUDIT.url,
      normalizedUrl: DEMO_AUDIT.normalizedUrl,
      score: DEMO_AUDIT.score,
      technicalScore: DEMO_AUDIT.technicalScore,
      onPageScore: DEMO_AUDIT.onPageScore,
      contentScore: DEMO_AUDIT.contentScore,
      linksScore: DEMO_AUDIT.linksScore,
      pagesCrawled: DEMO_AUDIT.pages.length,
      criticalIssues: DEMO_AUDIT.issues.filter(i => i.severity === 'critical' && i.status === 'fail').length,
      status: DEMO_AUDIT.status,
      createdAt: DEMO_AUDIT.createdAt,
      isDemo: true,
    });
  }

  return historyList;
}

/**
 * Deletes an audit by ID.
 */
export async function deleteAudit(id: string): Promise<boolean> {
  memoryAudits.delete(id);
  try {
    await prisma.audit.delete({ where: { id } });
    return true;
  } catch {
    return true;
  }
}
