import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fetch orders (either all for admin, or filter by userId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let orders;
    if (userId) {
      orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // In a real app, verify admin session first
      orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, totalAmount, shippingAddress, items, paymentStatus } = body;

    if (!totalAmount || !shippingAddress || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    // Save order in database
    const order = await prisma.order.create({
      data: {
        userId: userId || null,
        totalAmount,
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        items: JSON.stringify(items),
        paymentStatus: paymentStatus || 'PAID', // Defaults to PAID for demo/simulated checkouts
        status: 'PENDING'
      }
    });

    // Reduce stock for each variant in the order
    for (const item of items) {
      if (item.variant && item.variant.id) {
        try {
          await prisma.productVariant.update({
            where: { id: item.variant.id },
            data: {
              stock: {
                decrement: item.quantity || 1
              }
            }
          });
        } catch (stockErr) {
          console.error(`Failed to decrement stock for variant ${item.variant.sku}:`, stockErr);
        }
      }
    }

    return NextResponse.json({
      message: 'Order created successfully',
      order
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update order status (for admin)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });

    return NextResponse.json({
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Delete order (for admin)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await prisma.order.delete({
      where: { id: orderId }
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Delete order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

