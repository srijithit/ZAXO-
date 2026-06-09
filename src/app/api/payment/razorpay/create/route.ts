import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, orderId } = await request.json();

    if (!amount || !orderId) {
      return NextResponse.json({ error: 'Missing required parameters amount and orderId' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If Razorpay keys are not configured, use simulated mode
    if (!keyId || !keySecret) {
      console.log('Razorpay keys not configured. Operating in SIMULATED mode.');
      const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 12)}`;
      return NextResponse.json({
        simulated: true,
        key_id: 'rzp_test_simulated',
        razorpay_order_id: mockOrderId,
        amount: Math.round(amount * 100),
        currency: 'INR'
      });
    }

    // Call real Razorpay API using native fetch
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: 'INR',
        receipt: orderId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay Order API Error:', data);
      return NextResponse.json({ error: data.error?.description || 'Failed to create Razorpay order' }, { status: response.status });
    }

    return NextResponse.json({
      simulated: false,
      key_id: keyId,
      razorpay_order_id: data.id,
      amount: data.amount,
      currency: data.currency
    });
  } catch (error: any) {
    console.error('Create Razorpay order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
