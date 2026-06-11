import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone, email, name, isRegistering } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // If attempting to register
    if (isRegistering) {
      if (!name || !email) {
        return NextResponse.json({ error: 'Name and email are required for registration' }, { status: 400 });
      }

      // Check if email already exists
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUserByEmail) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
      }
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Save OTP verification record
    await prisma.otpVerification.create({
      data: {
        phone,
        otp,
        expiresAt
      }
    });

    // In a live production environment, you would trigger SMS gateway here.
    // For development, we return the OTP to allow simulation in UI.
    return NextResponse.json({
      message: 'OTP generated successfully',
      otp
    });
  } catch (error: any) {
    console.error('OTP send error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
