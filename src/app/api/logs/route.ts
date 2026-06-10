import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fetch all audit logs (restricted to ADMIN role)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requesterId');

    if (!requesterId) {
      return NextResponse.json({ error: 'Requester ID is required' }, { status: 400 });
    }

    const requester = await prisma.user.findUnique({
      where: { id: requesterId }
    });

    if (!requester || requester.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only admins can access audit logs.' }, { status: 403 });
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Fetch logs error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Clear all audit logs (restricted to ADMIN role)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requesterId');

    if (!requesterId) {
      return NextResponse.json({ error: 'Requester ID is required' }, { status: 400 });
    }

    const requester = await prisma.user.findUnique({
      where: { id: requesterId }
    });

    if (!requester || requester.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only admins can clear logs.' }, { status: 403 });
    }

    await prisma.auditLog.deleteMany();

    // Log the clear action
    await prisma.auditLog.create({
      data: {
        action: 'CLEAR_LOGS',
        details: 'All system audit logs were cleared.',
        performedBy: requester.email
      }
    });

    return NextResponse.json({ message: 'Audit logs cleared successfully.' });
  } catch (error: any) {
    console.error('Clear logs error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
