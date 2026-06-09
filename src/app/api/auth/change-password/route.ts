import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Retrieve user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    // Update password in DB
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword }
    });

    return NextResponse.json({ message: 'Password changed successfully' });

  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
