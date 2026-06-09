import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fetch all users (for admin dashboard, restricted to admin only)
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
      return NextResponse.json({ error: 'Unauthorized. Only admins can access user list.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update a user's role (restricted to admin)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { requesterId, targetUserId, newRole } = body;

    if (!requesterId || !targetUserId || !newRole) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (newRole !== 'USER' && newRole !== 'STAFF' && newRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Invalid role value' }, { status: 400 });
    }

    const requester = await prisma.user.findUnique({
      where: { id: requesterId }
    });

    if (!requester || requester.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only admins can modify roles.' }, { status: 403 });
    }

    // Update target user
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json({
      message: `User role updated to ${newRole} successfully`,
      user: updatedUser
    });

  } catch (error: any) {
    console.error('Update user role error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
