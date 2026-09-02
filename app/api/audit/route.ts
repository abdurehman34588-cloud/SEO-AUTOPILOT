import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateAndNormalizeUrl } from '@/lib/security/url-validator';
import { runFullAudit } from '@/lib/seo/audit-engine';
import { saveAudit } from '@/lib/db/storage';
import { DEMO_AUDIT } from '@/lib/demo/demo-audit';

const requestSchema = z.object({
  url: z.string().min(1, 'Website URL is required'),
  maxPages: z.number().min(1).max(20).optional(),
  maxDepth: z.number().min(1).max(3).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid request body' },
        { status: 400 }
      );
    }

    const { url, maxPages, maxDepth } = parsed.data;

    // Explicit demo request ONLY if user specifically requests literal 'demo'
    if (url === 'demo') {
      await saveAudit(DEMO_AUDIT);
      return NextResponse.json({
        auditId: DEMO_AUDIT.id,
        status: DEMO_AUDIT.status,
        audit: DEMO_AUDIT,
      });
    }

    // URL validation and SSRF protection
    const validation = validateAndNormalizeUrl(url);
    if (!validation.isValid || !validation.normalizedUrl) {
      return NextResponse.json(
        { error: validation.error || 'Invalid or prohibited website URL.' },
        { status: 400 }
      );
    }

    // Run real SEO audit
    const auditResult = await runFullAudit(validation.normalizedUrl, {
      maxPages: maxPages || 10,
      maxDepth: maxDepth || 2,
    });

    // Save audit to database & memory cache
    await saveAudit(auditResult);

    return NextResponse.json({
      auditId: auditResult.id,
      status: auditResult.status,
      audit: auditResult,
    });
  } catch (err: any) {
    console.error('Audit API error:', err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "We couldn't access this website. Check that the URL is correct and publicly accessible.",
      },
      { status: 500 }
    );
  }
}
