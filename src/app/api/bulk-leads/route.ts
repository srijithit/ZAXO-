import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

// Fetch bulk leads (for admin dashboard)
export async function GET(request: Request) {
  try {
    const leads = await prisma.bulkLead.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(leads);
  } catch (error: any) {
    console.error('Fetch bulk leads error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create new bulk lead
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      hospitalName, 
      contactName, 
      email, 
      phone, 
      quantity, 
      productType, 
      notes, 
      logoUrl 
    } = body;

    if (!hospitalName || !contactName || !email || !phone || !quantity || !productType) {
      return NextResponse.json({ error: 'Missing required B2B lead details' }, { status: 400 });
    }

    const lead = await prisma.bulkLead.create({
      data: {
        hospitalName,
        contactName,
        email,
        phone,
        quantity: parseInt(quantity) || 50,
        productType,
        notes: notes || null,
        logoUrl: logoUrl || null,
        status: 'NEW'
      }
    });

    return NextResponse.json({
      message: 'B2B hospital bulk order request submitted successfully',
      lead
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create bulk lead error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update lead status (for admin)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { leadId, status } = body;

    if (!leadId || !status) {
      return NextResponse.json({ error: 'Lead ID and status are required' }, { status: 400 });
    }

    const updatedLead = await prisma.bulkLead.update({
      where: { id: leadId },
      data: { status }
    });

    // Log the update action
    await createAuditLog(
      'UPDATE_LEAD_STATUS',
      `Updated bulk lead status of "${updatedLead.hospitalName}" to "${status}".`,
      'Admin/Staff'
    );

    return NextResponse.json({
      message: 'Lead status updated successfully',
      lead: updatedLead
    });

  } catch (error: any) {
    console.error('Update bulk lead error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Delete B2B lead (for admin)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const targetLead = await prisma.bulkLead.findUnique({
      where: { id: leadId }
    });

    await prisma.bulkLead.delete({
      where: { id: leadId }
    });

    if (targetLead) {
      // Log the delete action
      await createAuditLog(
        'DELETE_LEAD',
        `Deleted B2B bulk lead from "${targetLead.hospitalName}" (Contact: ${targetLead.contactName}).`,
        'Admin'
      );
    }

    return NextResponse.json({ message: 'B2B lead deleted successfully' });
  } catch (error: any) {
    console.error('Delete bulk lead error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

