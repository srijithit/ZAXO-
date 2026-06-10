import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const url = process.env.DATABASE_URL || 'file:./dev.db';
const cleanUrl = url.startsWith('file:') ? url.replace('file:', '') : url;
const adapter = new PrismaBetterSqlite3({ url: cleanUrl });
const prisma = new PrismaClient({ adapter });



async function main() {
  console.log('Clearing database...');
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customOrder.deleteMany();
  await prisma.bulkLead.deleteMany();

  console.log('Seeding admin user...');
  await prisma.user.create({
    data: {
      name: 'ZAXO Admin',
      email: 'admin@zaxo.com',
      password: 'admin', // Simple password for demo
      role: 'ADMIN',
      phone: '9876543210'
    }
  });

  console.log('Seeding staff user...');
  await prisma.user.create({
    data: {
      name: 'ZAXO Staff',
      email: 'staff@zaxo.com',
      password: 'staff', // Simple password for demo
      role: 'STAFF',
      phone: '9876543212'
    }
  });

  await prisma.user.create({
    data: {
      name: 'Dr. Arjun Mehta',
      email: 'arjun@hospital.com',
      password: 'user', // Simple password for demo
      role: 'USER',
      phone: '9876543211'
    }
  });

  console.log('Seeding products...');
  const productsData = [
    {
      name: 'Classic V-Neck Scrub Set',
      slug: 'classic-v-neck-scrub-set',
      description: 'Our best-selling V-Neck scrub set. Crafted with premium 4-way stretch fabric that is moisture-wicking and wrinkle-resistant. Features a modern fit top with 3 pockets and classic pants with a comfortable drawstring waist.',
      category: 'V-Neck Scrubs',
      gender: 'Unisex',
      basePrice: 1899.00,
      discountPrice: 1599.00,
      fabric: '72% Polyester, 21% Rayon, 7% Spandex (4-Way Stretch)',
      images: JSON.stringify(['/images/extracted_img_2.jpeg', '/images/extracted_img_3.jpeg']),
      featured: true
    },
    {
      name: 'Tailored Round Neck Scrub Set',
      slug: 'tailored-round-neck-scrub-set',
      description: 'Sophisticated round neck design with a tailored fit. Breathable, lightweight fabric keeps you cool during long shifts. Includes multiple utility loops and zip pockets.',
      category: 'Round Neck Scrubs',
      gender: 'Women',
      basePrice: 1999.00,
      discountPrice: 1699.00,
      fabric: '70% Polyester, 23% Rayon, 7% Spandex (Antimicrobial)',
      images: JSON.stringify(['/images/extracted_img_4.jpeg']),
      featured: true
    },
    {
      name: 'Sporty Overlap Scrub Set',
      slug: 'sporty-overlap-scrub-set',
      description: 'Stylish overlap neck scrubs offering a sporty look. Advanced antimicrobial finish and double-needle stitching for maximum durability.',
      category: 'Overlap Neck Scrubs',
      gender: 'Men',
      basePrice: 2099.00,
      discountPrice: 1799.00,
      fabric: '72% Polyester, 21% Rayon, 7% Spandex (Dry-Fast Tech)',
      images: JSON.stringify(['/images/extracted_img_5.jpeg']),
      featured: false
    },
    {
      name: 'Mandarin Collar Scrub Set',
      slug: 'mandarin-collar-scrub-set',
      description: 'An elegant, contemporary mandarin collar scrub set that combines professional style with everyday functionality. Features hidden snap buttons and a polished look.',
      category: 'Mandarin Collar Scrubs',
      gender: 'Unisex',
      basePrice: 2299.00,
      discountPrice: 1999.00,
      fabric: '75% Polyester, 20% Rayon, 5% Spandex (Premium Twill)',
      images: JSON.stringify(['/images/extracted_img_6.jpeg']),
      featured: true
    },
    {
      name: 'Full Sleeve Comfort Scrubs',
      slug: 'full-sleeve-comfort-scrubs',
      description: 'Designed for extra coverage and warmth, these full-sleeve scrubs feature elastic cuffs, side slits, and ultra-soft comfort. Perfect for air-conditioned hospital wards.',
      category: 'Full Sleeve Scrubs',
      gender: 'Unisex',
      basePrice: 2199.00,
      discountPrice: 1899.00,
      fabric: '72% Polyester, 21% Rayon, 7% Spandex (Brushed Comfort)',
      images: JSON.stringify(['/images/extracted_img_7.jpeg']),
      featured: false
    },
    {
      name: 'Classic Straight Fit Pants',
      slug: 'classic-straight-fit-pants',
      description: 'Classic straight-leg medical scrub pants. Features a semi-elastic waistband, deep side pockets, and durable stitching.',
      category: 'Basic Pants',
      gender: 'Unisex',
      basePrice: 999.00,
      discountPrice: 849.00,
      fabric: '72% Polyester, 21% Rayon, 7% Spandex',
      images: JSON.stringify(['/images/extracted_img_8.jpeg']),
      featured: false
    },
    {
      name: 'Multi-Pocket Cargo Pants',
      slug: 'multi-pocket-cargo-pants',
      description: 'Multi-pocket scrub cargo pants designed for healthcare heroes who need to carry it all. Includes 6 pockets, utility loops, and a reinforced seat.',
      category: 'Cargo Pants',
      gender: 'Unisex',
      basePrice: 1299.00,
      discountPrice: 1099.00,
      fabric: '72% Polyester, 21% Rayon, 7% Spandex',
      images: JSON.stringify(['/images/extracted_img_9.jpeg']),
      featured: true
    },
    {
      name: 'Active Jogger Pants',
      slug: 'active-jogger-pants',
      description: 'Modern jogger scrub pants with a soft elastic cuff and drawstring waist. Sporty, sleek, and comfortable for on-the-go doctors.',
      category: 'Jogger Pants',
      gender: 'Unisex',
      basePrice: 1299.00,
      discountPrice: 1149.00,
      fabric: '70% Polyester, 22% Rayon, 8% Spandex',
      images: JSON.stringify(['/images/extracted_img_10.jpeg']),
      featured: true
    },
    {
      name: 'Tailored Doctor Lab Coat',
      slug: 'tailored-doctor-lab-coat',
      description: 'Tailored professional lab coat made with high-performance twill. Stain-resistant, breathable, and designed with multiple tablet pockets and a premium notched lapel.',
      category: 'Doctor Coats',
      gender: 'Unisex',
      basePrice: 1599.00,
      discountPrice: 1299.00,
      fabric: '65% Polyester, 35% Cotton Twill (Stain Release)',
      images: JSON.stringify(['/images/extracted_img_12.jpeg']),
      featured: true
    },
    {
      name: 'Fluid Resistant Surgical Gown',
      slug: 'fluid-resistant-surgical-gown',
      description: 'High-protection medical surgical gown. Liquid-resistant barrier fabric with back ties and comfortable knit cuffs. Designed for OT use and autoclavable up to 50 times.',
      category: 'Surgical Gowns',
      gender: 'Unisex',
      basePrice: 1499.00,
      discountPrice: 1199.00,
      fabric: '100% Polyester with PU Coating (Autoclavable)',
      images: JSON.stringify(['/images/extracted_img_13.jpeg']),
      featured: false
    }
  ];

  const colors = [
    'Navy Blue',
    'Royal Blue',
    'Teal',
    'Hunter Green',
    'Wine',
    'Charcoal',
    'Black',
    'Ceil Blue',
    'Dusty Rose'
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  for (const prodData of productsData) {
    const createdProduct = await prisma.product.create({
      data: prodData
    });

    console.log(`Created product: ${createdProduct.name}`);

    // Create variants (Cartesian product of colors and sizes for demonstration)
    // To avoid too massive DB footprint in demo, we'll create variants for a selection of colors and sizes.
    // For V-Neck, Mandarin Collar, Lab Coat, and Joggers we create a full run. For others we create a subset.
    const selectedColors = prodData.featured ? colors : colors.slice(0, 3);
    const selectedSizes = sizes;

    const variantData = [];
    for (const color of selectedColors) {
      for (const size of selectedSizes) {
        const cleanColorName = color.replace(/\s+/g, '').toLowerCase();
        const sku = `${prodData.slug}-${cleanColorName}-${size.toLowerCase()}`;
        variantData.push({
          productId: createdProduct.id,
          size,
          color,
          stock: Math.floor(Math.random() * 40) + 10, // 10-50 in stock
          sku
        });
      }
    }

    await prisma.productVariant.createMany({
      data: variantData
    });

    console.log(`  Added ${variantData.length} variants.`);

    // Seed some reviews
    if (prodData.featured) {
      await prisma.review.createMany({
        data: [
          {
            productId: createdProduct.id,
            author: 'Dr. Neha Sharma',
            rating: 5,
            comment: 'Absolutely love the stretch and comfort of these scrubs. They don\'t wrinkle even after a 12-hour shift!'
          },
          {
            productId: createdProduct.id,
            author: 'Dr. Vivek Malhotra',
            rating: 4,
            comment: 'Excellent fit and fabric quality. The customized name embroidery looks very professional.'
          }
        ]
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // We don't disconnect manually if prisma is not globally open, but let's close the adapter just in case
  });
