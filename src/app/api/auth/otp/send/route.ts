import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to send real SMS via Twilio API using native fetch
async function sendTwilioSMS(to: string, otp: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.warn('Twilio credentials not fully configured in env. Twilio sending skipped.');
    return false;
  }

  let formattedTo = to.trim();
  if (!formattedTo.startsWith('+')) {
    if (formattedTo.length === 10) {
      formattedTo = `+91${formattedTo}`; // Default to Indian country code
    } else {
      formattedTo = `+${formattedTo}`;
    }
  }

  const message = `Your ZAXO verification OTP is ${otp}`;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const params = new URLSearchParams();
  params.append('To', formattedTo);
  params.append('From', from);
  params.append('Body', message);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Twilio SMS send failed:', errorData);
    throw new Error(errorData.message || 'Failed to send SMS via Twilio');
  }

  console.log(`Twilio SMS sent successfully to ${formattedTo}`);
  return true;
}

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

    // Send real SMS if Twilio credentials are configured
    const sent = await sendTwilioSMS(phone, otp);

    return NextResponse.json({
      message: sent 
        ? 'OTP sent successfully via SMS' 
        : 'OTP generated successfully (SMS skipped - credentials not configured)'
    });
  } catch (error: any) {
    console.error('OTP send error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
