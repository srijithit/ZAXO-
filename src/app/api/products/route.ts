import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

// Fetch products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const gender = searchParams.get('gender');
    const featured = searchParams.get('featured');

    const whereClause: any = {};

    if (category) {
      whereClause.category = category;
    }

    if (gender) {
      if (gender === 'Men' || gender === 'Women') {
        whereClause.OR = [
          { gender: gender },
          { gender: 'Unisex' }
        ];
      } else {
        whereClause.gender = gender;
      }
    }

    if (featured === 'true') {
      whereClause.featured = true;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        variants: true,
        reviews: true
      }
    });

    return NextResponse.json(products);

  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { put } from '@vercel/blob';

// Create new product (Admin)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const gender = formData.get('gender') as string;
    const basePriceStr = formData.get('basePrice') as string;
    const discountPriceStr = formData.get('discountPrice') as string;
    const fabric = formData.get('fabric') as string;
    const featuredStr = formData.get('featured') as string;

    if (!name || !description || !category || !gender || !basePriceStr) {
      return NextResponse.json({ error: 'Missing required product parameters' }, { status: 400 });
    }

    // Generate unique slug
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    let imageUrl = '/images/scrubs-placeholder.jpg';
    
    // Check if there is an uploaded file
    const file = formData.get('image') as File | null;
    if (file && file.size > 0) {
      const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });
      imageUrl = blob.url;
    } else {
      // Check if an external image url was passed
      const extUrl = formData.get('imageUrl') as string;
      if (extUrl) imageUrl = extUrl;
    }

    const imageArray = [imageUrl];

    // Insert Product
    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        category,
        gender,
        basePrice: parseFloat(basePriceStr),
        discountPrice: discountPriceStr ? parseFloat(discountPriceStr) : null,
        fabric: fabric || '72% Polyester, 21% Rayon, 7% Spandex',
        images: JSON.stringify(imageArray),
        featured: featuredStr === 'true'
      }
    });

    // Auto-generate variants (sizes S, M, L, XL for Navy, Royal, Teal) so the product is instantly shoppable
    const colors = ['Navy Blue', 'Royal Blue', 'Teal'];
    const sizes = ['S', 'M', 'L', 'XL'];
    const variantData = [];

    for (const color of colors) {
      for (const size of sizes) {
        const cleanColor = color.replace(/\s+/g, '').toLowerCase();
        variantData.push({
          productId: newProduct.id,
          size,
          color,
          stock: 30,
          sku: `${slug}-${cleanColor}-${size.toLowerCase()}`
        });
      }
    }

    await prisma.productVariant.createMany({
      data: variantData
    });

    // Log the product creation
    await createAuditLog(
      'CREATE_PRODUCT',
      `Published new product "${name}" in category "${category}" with automatic variants.`,
      'Admin/Staff'
    );

    return NextResponse.json({
      message: 'Product created successfully',
      product: newProduct
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Edit existing product (Admin)
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const gender = formData.get('gender') as string;
    const basePriceStr = formData.get('basePrice') as string;
    const discountPriceStr = formData.get('discountPrice') as string;
    const fabric = formData.get('fabric') as string;
    const featuredStr = formData.get('featured') as string;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (gender) updateData.gender = gender;
    if (basePriceStr !== undefined && basePriceStr !== null) {
      updateData.basePrice = parseFloat(basePriceStr);
    }
    if (discountPriceStr !== undefined && discountPriceStr !== null) {
      updateData.discountPrice = discountPriceStr ? parseFloat(discountPriceStr) : null;
    }
    if (fabric) updateData.fabric = fabric;
    if (featuredStr !== undefined && featuredStr !== null) {
      updateData.featured = featuredStr === 'true';
    }

    // Check if there is an uploaded file
    const file = formData.get('image') as File | null;
    if (file && file.size > 0) {
      const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });
      updateData.images = JSON.stringify([blob.url]);
    } else {
      // Check if imageUrl was passed
      const extUrl = formData.get('imageUrl') as string;
      if (extUrl) {
        updateData.images = JSON.stringify([extUrl]);
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });

    // Log the product update
    await createAuditLog(
      'UPDATE_PRODUCT',
      `Modified details of product "${updatedProduct.name}" (ID: ${id.slice(0, 8)}).`,
      'Admin/Staff'
    );

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Delete product (Admin)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const targetProduct = await prisma.product.findUnique({
      where: { id }
    });

    await prisma.product.delete({
      where: { id }
    });

    if (targetProduct) {
      // Log the product delete action
      await createAuditLog(
        'DELETE_PRODUCT',
        `Permanently deleted product "${targetProduct.name}" (ID: ${id.slice(0, 8)}) and its variants.`,
        'Admin'
      );
    }

    return NextResponse.json({
      message: 'Product deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
