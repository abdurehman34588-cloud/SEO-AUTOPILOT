import { NextRequest, NextResponse } from 'next/server';
import { getAuditById } from '@/lib/db/storage';
import { DEMO_AUDIT } from '@/lib/demo/demo-audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Audit ID required' }, { status: 400 });
    }

    if (id === 'demo') {
      return NextResponse.json(DEMO_AUDIT);
    }

    const audit = await getAuditById(id);
    if (!audit) {
      return NextResponse.json({ error: 'Audit report not found' }, { status: 404 });
    }

    return NextResponse.json(audit);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
