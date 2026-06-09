import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

// Create new product (Admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, gender, basePrice, discountPrice, fabric, images, featured } = body;

    if (!name || !description || !category || !gender || !basePrice) {
      return NextResponse.json({ error: 'Missing required product parameters' }, { status: 400 });
    }

    // Generate unique slug
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const imageArray = Array.isArray(images) ? images : [images || '/images/scrubs-placeholder.jpg'];

    // Insert Product
    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        category,
        gender,
        basePrice: parseFloat(basePrice),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        fabric: fabric || '72% Polyester, 21% Rayon, 7% Spandex',
        images: JSON.stringify(imageArray),
        featured: featured === true
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
    const body = await request.json();
    const { id, name, description, category, gender, basePrice, discountPrice, fabric, images, featured } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (gender) updateData.gender = gender;
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (fabric) updateData.fabric = fabric;
    if (images) {
      const imageArray = Array.isArray(images) ? images : [images];
      updateData.images = JSON.stringify(imageArray);
    }
    if (featured !== undefined) updateData.featured = featured === true;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });

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

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Product deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
