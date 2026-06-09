import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ColorShowcase from '@/components/ColorShowcase';
import { ArrowRight, Star, ShieldCheck, HeartPulse, RefreshCcw, Sparkles, Plus, Award } from 'lucide-react';

export const revalidate = 60; // Revalidate page cache every minute

export default async function HomePage() {
  // Directly query the SQLite database inside the Next.js Server Component
  let featuredProducts: any[] = [];
  try {
    featuredProducts = await prisma.product.findMany({
      where: { featured: true },
      take: 4
    });
  } catch (err) {
    console.error('Failed to load featured products for home page:', err);
  }

  // Predefined testimonials matching catalog page 18
  const testimonials = [
    {
      quote: "The fabric stretch and comfort is unparalleled. Our surgeons and nursing staff have noted how lightweight and breathable these scrubs feel during long surgical procedures.",
      author: "Dr. Neha Sharma",
      position: "Chief Medical Officer, Fortis Healthcare",
      rating: 5
    },
    {
      quote: "ZAXO's custom logo embroidery is extremely sharp. We ordered custom uniforms for all 150 of our hospital staff. The process was seamless and the colors are perfectly color-fast.",
      author: "Sanjay Singhal",
      position: "Procurement Manager, Apollo Hospitals Group",
      rating: 5
    },
    {
      quote: "Highly recommended for private clinics. The direct name embroidery on the coats adds a high-prestige touch, and patients frequently comment on our neat professional look.",
      author: "Dr. Arjun Mehta",
      position: "Director, Mehta Dental Clinic",
      rating: 5
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary-dark text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        
        {/* Abstract background grids */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              <Sparkles className="w-3.5 h-3.5" /> High Performance Medical Apparel
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Premium Medical Scrubs & Hospital Uniforms
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mx-auto lg:mx-0">
              Engineered with 4-way stretch flex comfort, moisture-wicking and wrinkle-free fabric. Upgrade your professional prestige with custom logo and name embroidery.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-teal-500/20 hover:scale-105 transition-all text-base"
              >
                Shop Collection <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/customize"
                className="inline-flex items-center justify-center px-6 py-3 border border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/70 text-white font-semibold rounded-xl transition-all text-base"
              >
                Customize Uniforms
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-8 mt-8 text-slate-400 text-xs text-center lg:text-left">
              <div>
                <p className="text-white text-lg font-bold">15+ Colors</p>
                <p>Catalog Swatches</p>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <p className="text-white text-lg font-bold">4-Way Stretch</p>
                <p>Wrinkle Resistant</p>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <p className="text-white text-lg font-bold">Custom Logo</p>
                <p>Direct Embroidery</p>
              </div>
            </div>
          </div>

          {/* Right Column Visual Mock */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col justify-between">
              
              {/* Top Banner */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <span className="text-[10px] font-extrabold tracking-widest text-teal-400 uppercase">Premium Series</span>
                <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] px-2 py-0.5 rounded font-bold">V-Neck Scrub Set</span>
              </div>

              {/* Central Mock Graphics */}
              <div className="flex-grow flex flex-col items-center justify-center py-6 text-center space-y-4">
                <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center border-2 border-teal-500/30">
                  <HeartPulse className="w-16 h-16 text-teal-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white">Classic Navy Blue Set</h3>
                <p className="text-xs text-slate-400 max-w-xs">Our gold standard scrub set, engineered with 72% Polyester, 21% Rayon, 7% Spandex.</p>
              </div>

              {/* Features footer */}
              <div className="border-t border-slate-800 pt-4 grid grid-cols-2 gap-2 text-center text-[10px] font-semibold text-slate-400 uppercase">
                <span className="bg-slate-800/40 p-2 rounded">Anti-microbial</span>
                <span className="bg-slate-800/40 p-2 rounded">Liquid barrier</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* B2B vs B2C Split Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* B2C Card */}
          <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-premium flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div className="space-y-4">
              <span className="inline-block p-3 rounded-xl bg-teal-50 text-primary border border-teal-100">
                <Award className="w-6 h-6" />
              </span>
              <h3 className="text-xl font-bold text-slate-800">B2C Retail Purchases</h3>
              <p className="text-sm text-slate-600">
                Buy premium scrubs for yourself or clinic team. Select size, custom color, and add custom logo & name embroidery directly to your product detail page.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center text-sm font-bold text-primary hover:gap-2 transition-all"
              >
                Browse Retail Shop <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </div>

          {/* B2B Card */}
          <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-premium flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div className="space-y-4">
              <span className="inline-block p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <h3 className="text-xl font-bold text-slate-800">B2B Hospital Contracts</h3>
              <p className="text-sm text-slate-600">
                Bulk uniform orders for large healthcare groups. Configure customized color schemes, select fabric upgrades, upload bulk sizing rosters, and request design proofs.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/hospital-orders"
                className="inline-flex items-center text-sm font-bold text-amber-600 hover:gap-2 transition-all"
              >
                Get Hospital Contract Quote <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-primary font-bold text-xs uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Our Top Sellers
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Featured Medical Apparel
          </h2>
          <p className="text-slate-600 text-sm">
            Discover catalog favorites trusted by leading surgeons, resident doctors, and clinical specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product: any) => {
            const parsedImages = JSON.parse(product.images);
            const displayPrice = product.discountPrice || product.basePrice;
            const hasDiscount = !!product.discountPrice;

            return (
              <div key={product.id} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-premium shadow-premium-hover flex flex-col justify-between">
                
                {/* Product Image placeholder graphic */}
                <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden border-b border-slate-50">
                  <HeartPulse className="w-12 h-12 text-slate-200 group-hover:scale-110 group-hover:text-primary/10 transition-all duration-300" />
                  
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Sale
                    </span>
                  )}

                  <span className="absolute top-3 right-3 bg-slate-900/5 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {product.gender}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{product.category}</span>
                    <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors text-sm line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-slate-800 font-extrabold text-base">₹{displayPrice}</span>
                      {hasDiscount && (
                        <span className="text-slate-400 line-through text-xs">₹{product.basePrice}</span>
                      )}
                    </div>
                    
                    <Link
                      href={`/shop/${product.slug}`}
                      className="p-1.5 rounded-lg bg-teal-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Color swatches showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ColorShowcase />
      </div>

      {/* Why Choose Zaxo */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 space-y-4">
            <span className="text-teal-400 font-bold text-xs uppercase tracking-wider">Quality Engineering</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Why Choose ZAXO Scrubs?</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our products are designed using direct feedback from resident doctors and surgical technicians. We build uniforms that endure the intense physical demands of clinical practice.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center text-sm font-bold text-teal-400 hover:text-teal-300"
              >
                Browse Fabrics & Colors <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-lg text-white mb-2">Liquid & Fluid Resistance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Coated with water-repellent finishing that beads liquids, blood, and body fluids instantly on contact, reducing stain retention and contamination risks.
              </p>
            </div>
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-lg text-white mb-2">4-Way Stretch Flex</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Synthetic spandex blend that flexes dynamically with you as you bend, reach, or stand, offering comfort that outperforms standard stiff cotton healthcare cottons.
              </p>
            </div>
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-lg text-white mb-2">Gold Standard Embroidery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Japanese precision embroidery machinery produces incredibly detailed logos and crisp department lettering that stays firm and never frays.
              </p>
            </div>
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-lg text-white mb-2">15+ Color Palette</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standardized clinical colors matching major hospital dress code directories. We provide perfect color matching across various sizes and orders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-primary font-bold text-xs uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Reviews from Page 18
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Loved by Doctors & Hospital Managers
          </h2>
          <p className="text-slate-600 text-sm">
            Read what healthcare specialists say about our scrubs comfort, embroidery sharpness, and bulk ordering speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testi, idx) => (
            <div key={idx} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(testi.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{testi.quote}"
                </p>
              </div>

              <div className="border-t border-slate-50 pt-4">
                <h4 className="font-bold text-slate-800 text-xs">{testi.author}</h4>
                <p className="text-[10px] text-slate-400 font-medium">{testi.position}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
