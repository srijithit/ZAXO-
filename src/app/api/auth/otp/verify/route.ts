import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone, otp, email, name } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 });
    }

    // Find valid OTP record (active and not expired)
    const verification = await prisma.otpVerification.findFirst({
      where: {
        phone,
        otp,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!verification) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Consume the OTP so it cannot be reused
    await prisma.otpVerification.delete({
      where: { id: verification.id }
    }).catch((err: any) => console.error('Failed to delete used OTP record:', err));

    // Check if user already exists by phone
    let user = await prisma.user.findFirst({
      where: { phone }
    });

    // If user does not exist by phone, let's also check by email to prevent duplicate email issues
    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email }
      });
      
      // If we find them by email but phone wasn't set, we can link/update their phone!
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { phone }
        });
      }
    }

    if (!user) {
      // Register new user
      if (!name || !email) {
        return NextResponse.json({ 
          error: 'Registration details (Name and Email) are required for new accounts' 
        }, { status: 400 });
      }

      // Check if email already taken
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUserByEmail) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
      }

      const usersCount = await prisma.user.count();
      const role = usersCount === 0 ? 'ADMIN' : 'USER';

      // Create new user in DB with a random placeholder password
      user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          password: `otp_auth_${Math.random().toString(36).slice(-8)}`,
          role
        }
      });
    }

    return NextResponse.json({
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
