import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, simulated } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Local orderId is required' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Handle simulation mode verification
    if (simulated || !keySecret) {
      console.log(`Verifying simulated order ${orderId}`);
      
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' }
      });

      return NextResponse.json({
        verified: true,
        simulated: true,
        order: updatedOrder
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing signature verification parameters' }, { status: 400 });
    }

    // Verify HMAC-SHA256 signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    const isValid = generatedSignature === razorpay_signature;

    if (isValid) {
      console.log(`Successfully verified payment for order ${orderId}`);
      
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' }
      });

      return NextResponse.json({
        verified: true,
        simulated: false,
        order: updatedOrder
      });
    } else {
      console.error(`Signature verification failed for order ${orderId}`);
      
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' }
      });

      return NextResponse.json({
        verified: false,
        error: 'Invalid payment signature'
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Verify Razorpay payment error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
