import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductDetailClient from '@/components/ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product = null;
  try {
    product = await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
        reviews: true
      }
    });
  } catch (err) {
    console.error('Failed to query product details:', err);
  }

  if (!product) {
    notFound();
  }

  // Map product database structure to context expected structure
  const productInfo = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    gender: product.gender,
    basePrice: product.basePrice,
    discountPrice: product.discountPrice,
    fabric: product.fabric,
    images: product.images,
    featured: product.featured
  };

  return (
    <ProductDetailClient 
      product={productInfo} 
      variants={product.variants} 
      reviews={product.reviews} 
    />
  );
}
