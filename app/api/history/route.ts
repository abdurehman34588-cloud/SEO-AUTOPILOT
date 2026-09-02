import { NextRequest, NextResponse } from 'next/server';
import { getAuditHistory, deleteAudit } from '@/lib/db/storage';

export async function GET() {
  try {
    const history = await getAuditHistory();
    return NextResponse.json(history);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body?.id;
    if (!id) {
      return NextResponse.json({ error: 'Audit ID required' }, { status: 400 });
    }

    await deleteAudit(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
