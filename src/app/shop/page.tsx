'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { HeartPulse, Search, SlidersHorizontal, Plus, ArrowUpDown, Sparkles } from 'lucide-react';

function ShopCatalog() {
  const searchParams = useSearchParams();
  const initialGender = searchParams.get('gender') || '';
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [selectedGender, setSelectedGender] = useState(initialGender);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedColor, setSelectedColor] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Available options
  const categories = [
    'V-Neck Scrubs',
    'Round Neck Scrubs',
    'Overlap Neck Scrubs',
    'Mandarin Collar Scrubs',
    'Full Sleeve Scrubs',
    'Basic Pants',
    'Cargo Pants',
    'Jogger Pants',
    'Flare Pants',
    'Doctor Coats',
    'Surgical Gowns'
  ];

  const genders = ['Men', 'Women', 'Unisex'];

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

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Update states if query params change
  useEffect(() => {
    if (searchParams.get('gender')) {
      setSelectedGender(searchParams.get('gender') || '');
    }
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category') || '');
    }
  }, [searchParams]);

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.description.toLowerCase().includes(search.toLowerCase());
    
    // Gender logic: Unisex matches both men/women filters
    const matchesGender = !selectedGender || 
                          product.gender === selectedGender || 
                          product.gender === 'Unisex';
                          
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    // Color logic: Check if any variant has the selected color
    const matchesColor = !selectedColor || product.variants.some((v: any) => v.color === selectedColor);

    return matchesSearch && matchesGender && matchesCategory && matchesColor;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.basePrice;
    const priceB = b.discountPrice || b.basePrice;

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    // 'popular' defaults to how they are seeded (featured first)
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const handleClearFilters = () => {
    setSearch('');
    setSelectedGender('');
    setSelectedCategory('');
    setSelectedColor('');
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="space-y-2 text-center md:text-left z-10">
          <span className="text-teal-400 font-bold text-xs uppercase tracking-wider">Clinical Apparel Store</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Browse Premium Collection</h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-md">
            wrinkle-resistant, 4-way stretch flex comfort fabric. Standard clinical shades and custom name embroidery options.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center md:text-right shrink-0 z-10">
          <p className="text-teal-400 font-bold text-lg">100% Cotton Feel</p>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Antimicrobial Coated</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-800 flex items-center gap-1.5 text-base">
              <SlidersHorizontal className="w-4.5 h-4.5 text-primary" /> Filter Options
            </h2>
            <button 
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-primary hover:underline font-semibold"
            >
              Clear All
            </button>
          </div>

          {/* Gender Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collection Gender</h3>
            <div className="flex flex-col space-y-1">
              {genders.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(selectedGender === g ? '' : g)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedGender === g 
                      ? 'bg-primary text-white font-semibold' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {g} Collection
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Categories</h3>
            <div className="flex flex-col space-y-1 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-primary text-white font-semibold' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fabric Colors</h3>
            <div className="grid grid-cols-3 gap-2">
              {colors.map(col => {
                return (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(selectedColor === col ? '' : col)}
                    className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                      selectedColor === col 
                        ? 'border-primary bg-slate-50' 
                        : 'border-slate-150 hover:bg-slate-50/50'
                    }`}
                    title={col}
                  >
                    <span 
                      className="w-5 h-5 rounded-full shadow-inner border border-slate-200/50" 
                      style={{ backgroundColor: getColorHex(col) }}
                    />
                    <span className="text-[9px] font-bold text-slate-600 mt-1 truncate w-full text-center">
                      {col}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </aside>

        {/* Catalog Content Area */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-100 p-4 rounded-xl shadow-sm gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search scrubs, pants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
              />
            </div>

            {/* Sorting and Mobile Filters Trigger */}
            <div className="flex w-full sm:w-auto justify-between sm:justify-end items-center gap-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-1 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Product Name (A-Z)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Mobile Filters Drawer */}
          {showMobileFilters && (
            <div className="lg:hidden p-4 bg-white border border-slate-100 rounded-xl shadow-md space-y-4 animate-in slide-in-from-top duration-200">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-800 text-sm">Filter Options</h3>
                <button onClick={handleClearFilters} className="text-xs text-primary font-semibold">Clear All</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</h4>
                  <div className="flex flex-col gap-1">
                    {genders.map(g => (
                      <button
                        key={g}
                        onClick={() => setSelectedGender(selectedGender === g ? '' : g)}
                        className={`text-left text-xs p-1.5 rounded ${selectedGender === g ? 'bg-primary text-white' : 'text-slate-600'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Color</h4>
                  <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto">
                    {colors.map(col => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(selectedColor === col ? '' : col)}
                        className={`text-left text-[10px] p-1 rounded truncate ${selectedColor === col ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600'}`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {categories.slice(0, 6).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                      className={`text-xs px-2.5 py-1 rounded-full border ${selectedCategory === cat ? 'bg-primary text-white border-transparent' : 'border-slate-200 text-slate-600'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl h-80 shadow-sm" />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <HeartPulse className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No apparel items found</h3>
              <p className="text-slate-500 text-sm mt-1">Try clearing your filter selection or adjustments.</p>
              <button 
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-hover transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {sortedProducts.map((product) => {
                const parsedImages = JSON.parse(product.images);
                const displayPrice = product.discountPrice || product.basePrice;
                const hasDiscount = !!product.discountPrice;
                
                // Collect unique colors available in variants
                const availableColors = Array.from(new Set(product.variants.map((v: any) => v.color)));

                return (
                  <div key={product.id} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-premium shadow-premium-hover flex flex-col justify-between">
                    
                    {/* Product Image preview */}
                    <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center relative overflow-hidden border-b border-slate-50">
                      {parsedImages && parsedImages[0] && parsedImages[0] !== '/images/scrubs-placeholder.jpg' ? (
                        <img 
                          src={parsedImages[0]} 
                          alt={product.name} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <HeartPulse className="w-12 h-12 text-slate-200 group-hover:scale-110 group-hover:text-primary/10 transition-all duration-300" />
                      )}
                      
                      {hasDiscount && (
                        <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Sale
                        </span>
                      )}

                      <span className="absolute top-3 right-3 z-10 bg-slate-900/80 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        {product.gender}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{product.category}</span>
                        <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors text-sm line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                        
                        {/* Display Available Color Swatches */}
                        {availableColors.length > 0 && (
                          <div className="flex gap-1.5 pt-1">
                            {availableColors.slice(0, 6).map((col: any) => {
                              return (
                                <span 
                                  key={col}
                                  className="w-3.5 h-3.5 rounded-full border border-slate-200/50"
                                  style={{ backgroundColor: getColorHex(col) }}
                                  title={col}
                                />
                              );
                            })}
                            {availableColors.length > 6 && (
                              <span className="text-[8px] font-bold text-slate-400">+{availableColors.length - 6}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-slate-800 font-extrabold text-base">₹{displayPrice}</span>
                          {hasDiscount && (
                            <span className="text-slate-400 line-through text-xs">₹{product.basePrice}</span>
                          )}
                        </div>
                        
                        <Link
                          href={`/shop/${product.slug}`}
                          className="px-3 py-1.5 text-xs bg-teal-50 text-primary group-hover:bg-primary group-hover:text-white font-bold rounded-lg transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <HeartPulse className="w-8 h-8 animate-pulse mx-auto mb-2 text-primary" />
        <p className="text-sm font-semibold font-sans">Loading ZAXO Scrubs Catalog...</p>
      </div>
    }>
      <ShopCatalog />
    </Suspense>
  );
}

// Color Hex map helper
function getColorHex(color: string): string {
  const map: Record<string, string> = {
    'Navy Blue': '#1b2d42',
    'Royal Blue': '#2b579a',
    'Teal': '#0f766e',
    'Hunter Green': '#1e3f20',
    'Wine': '#611a24',
    'Charcoal': '#4a4a4a',
    'Black': '#111111',
    'Ceil Blue': '#8da4c4',
    'Dusty Rose': '#c48d9f'
  };
  return map[color] || '#0f766e';
}

