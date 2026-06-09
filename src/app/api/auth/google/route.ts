import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Google authentication details are required' }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // If this is the first user in the database, make them an ADMIN
      const usersCount = await prisma.user.count();
      const role = usersCount === 0 ? 'ADMIN' : 'USER';

      // Create a new user with Google details
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: 'google_oauth_placeholder', // Google users do not use passwords
          role
        }
      });
    }

    return NextResponse.json({
      message: 'Logged in with Google successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (error: any) {
    console.error('Google login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
