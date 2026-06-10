import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, orderId, customerName, customerEmail, customerPhone } = await request.json();

    if (!amount || !orderId) {
      return NextResponse.json({ error: 'Missing required parameters amount and orderId' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Clean phone number format for Razorpay (remove non-digits)
    let formattedPhone = customerPhone ? customerPhone.replace(/\D/g, '') : '';
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }

    // If Razorpay keys are not configured, use simulated link
    if (!keyId || !keySecret) {
      console.log('Razorpay keys not configured. Operating in SIMULATED link mode.');
      const mockLinkId = `link_mock_${Math.random().toString(36).substring(2, 10)}`;
      return NextResponse.json({
        simulated: true,
        short_url: `https://rzp.io/rzp/${mockLinkId}`
      });
    }

    // Create payment link using standard Razorpay API
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // amount in paise
        currency: 'INR',
        accept_partial: false,
        reference_id: orderId,
        description: `Payment for ZAXO Order #${orderId.substring(0, 8)}`,
        customer: {
          name: customerName || 'Valued Customer',
          email: customerEmail || undefined,
          contact: formattedPhone ? `+${formattedPhone}` : undefined
        },
        notify: {
          sms: false,
          email: false
        },
        reminder_enable: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay Payment Link API Error:', data);
      return NextResponse.json({ error: data.error?.description || 'Failed to generate payment link' }, { status: response.status });
    }

    return NextResponse.json({
      simulated: false,
      short_url: data.short_url
    });
  } catch (error: any) {
    console.error('Create Razorpay payment link error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
