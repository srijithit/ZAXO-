import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fetch custom orders (supports filtering by userId for client history, or all for admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const where: any = {};
    if (userId) {
      where.userId = userId;

      // Auto-mark as viewed when the customer requests their list
      await prisma.customOrder.updateMany({
        where: {
          userId,
          viewedByCustomer: false
        },
        data: {
          viewedByCustomer: true
        }
      });
    }

    const customOrders = await prisma.customOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        }
      }
    });
    return NextResponse.json(customOrders);
  } catch (error: any) {
    console.error('Fetch custom orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create custom order (quote request)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      hospitalName, 
      productType, 
      color, 
      size, 
      quantity, 
      customName, 
      logoUrl, 
      measurements 
    } = body;

    if (!hospitalName || !productType || !color || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const customOrder = await prisma.customOrder.create({
      data: {
        userId: userId || null,
        hospitalName,
        productType,
        color,
        size: size || null,
        quantity: parseInt(quantity) || 10,
        customName: customName || null,
        logoUrl: logoUrl || null,
        measurements: measurements ? (typeof measurements === 'string' ? measurements : JSON.stringify(measurements)) : null,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      message: 'Custom uniform quote request submitted successfully',
      customOrder
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create custom order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update quote status or add price quote (for admin)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { customOrderId, status, priceQuote } = body;

    if (!customOrderId) {
      return NextResponse.json({ error: 'Custom Order ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priceQuote !== undefined) updateData.priceQuote = parseFloat(priceQuote);
    
    // Reset viewedByCustomer to false when the quote is updated by admin
    if (status === 'QUOTED' || priceQuote !== undefined) {
      updateData.viewedByCustomer = false;
    }

    const updatedCustomOrder = await prisma.customOrder.update({
      where: { id: customOrderId },
      data: updateData
    });

    return NextResponse.json({
      message: 'Custom order updated successfully',
      customOrder: updatedCustomOrder
    });

  } catch (error: any) {
    console.error('Update custom order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Delete B2B custom order/quote (for admin)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customOrderId = searchParams.get('customOrderId');

    if (!customOrderId) {
      return NextResponse.json({ error: 'Custom Order ID is required' }, { status: 400 });
    }

    await prisma.customOrder.delete({
      where: { id: customOrderId }
    });

    return NextResponse.json({ message: 'B2B quote deleted successfully' });
  } catch (error: any) {
    console.error('Delete custom order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

