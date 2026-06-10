'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, Product, ProductVariant } from '@/context/AppContext';
import { Ruler, ShieldCheck, ShoppingBag, Heart, Star, Check, Plus, Minus, AlertCircle, FileImage, Sparkles } from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
  variants: ProductVariant[];
  reviews: any[];
}

export default function ProductDetailClient({ product, variants, reviews }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useApp();

  // Pick unique colors and sizes from variants
  const availableColors = Array.from(new Set(variants.map(v => v.color)));
  const availableSizes = Array.from(new Set(variants.map(v => v.size))).sort((a, b) => {
    const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
    const idxA = sizeOrder.indexOf(a);
    const idxB = sizeOrder.indexOf(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  // Selected Option States
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || '');
  const [selectedSize, setSelectedSize] = useState(availableSizes[2] || availableSizes[0] || ''); // Default to M or first
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Customization States (inspired by uniformer.in)
  const [addName, setAddName] = useState(false);
  const [nameText, setNameText] = useState('');
  const [nameFont, setNameFont] = useState('Block');
  const [nameColor, setNameColor] = useState('Gold');
  const [namePlacement, setNamePlacement] = useState('Left Chest');

  const [addLogo, setAddLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<string>(''); // base64 representation
  const [logoFileName, setLogoFileName] = useState('');
  const [logoPlacement, setLogoPlacement] = useState('Right Chest');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // UI States
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [activeSizeChartTab, setActiveSizeChartTab] = useState<'men' | 'women'>('men');
  const [successMsg, setSuccessMsg] = useState('');

  // Update selected variant when color or size changes
  useEffect(() => {
    const variant = variants.find(v => v.color === selectedColor && v.size === selectedSize);
    setSelectedVariant(variant || null);
  }, [selectedColor, selectedSize, variants]);

  // Calculate pricing including upcharges
  const basePrice = product.discountPrice || product.basePrice;
  const nameCharge = addName ? 100 : 0;
  const logoCharge = addLogo ? 150 : 0;
  const totalPrice = basePrice + nameCharge + logoCharge;

  // Handle Logo Upload with Vercel Blob
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      setIsUploadingLogo(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        setLogoFile(data.url);
      } catch (error) {
        console.error('Logo upload error:', error);
        alert('Failed to upload logo to cloud storage. Please try again.');
        setLogoFileName('');
        setLogoFile('');
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const handleAddToCart = (buyNow = false) => {
    if (!selectedVariant) return;

    const customization = (addName || addLogo) ? {
      nameText: addName ? nameText : undefined,
      nameFont: addName ? nameFont : undefined,
      nameColor: addName ? nameColor : undefined,
      namePlacement: addName ? namePlacement : undefined,
      logoFile: addLogo ? logoFile : undefined,
      logoPlacement: addLogo ? logoPlacement : undefined,
      priceCharge: nameCharge + logoCharge
    } : undefined;

    addToCart({
      product,
      variant: selectedVariant,
      quantity,
      customization
    });

    setSuccessMsg('Added to Shopping Cart!');
    setTimeout(() => {
      setSuccessMsg('');
      if (buyNow) {
        router.push('/cart');
      }
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Product Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Image Gallery/Preview */}
        <div className="space-y-4">
          <div className="aspect-square bg-white border border-slate-100 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-premium">
            <span className="absolute top-4 left-4 z-10 bg-slate-900/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
              Category: {product.category}
            </span>
            {product.discountPrice && (
              <span className="absolute top-4 right-4 z-10 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                15% OFF
              </span>
            )}
            
            {(() => {
              let parsedImages: string[] = [];
              try {
                parsedImages = JSON.parse(product.images);
              } catch (e) {
                parsedImages = product.images ? [product.images] : [];
              }
              const imageUrl = parsedImages[0];
              
              if (imageUrl && imageUrl !== '/images/scrubs-placeholder.jpg') {
                return (
                  <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                );
              }
              
              return (
                /* Styled Visual Canvas Fallback */
                <div className="flex flex-col items-center p-8">
                  <div 
                    className="w-40 h-40 rounded-full flex items-center justify-center border-4 border-slate-100 mb-4 transition-all"
                    style={{ 
                      backgroundColor: selectedColor ? getColorHex(selectedColor) : '#16a34a',
                      borderColor: selectedColor ? `${getColorHex(selectedColor)}30` : '#16a34a20'
                    }}
                  >
                    <ShoppingBag className="w-16 h-16 text-white/90" />
                  </div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Premium Fabric Drape Preview</p>
                  <div className="flex gap-2 mt-4 text-xs font-bold text-slate-700">
                    <span className="bg-slate-100 px-3 py-1 rounded-full">4-Way Stretch</span>
                    <span className="bg-slate-100 px-3 py-1 rounded-full">Wrinkle Free</span>
                  </div>
                </div>
              );
            })()}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center space-x-3 shadow-premium">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Antimicrobial</h4>
                <p className="text-[10px] text-slate-500">Liquid barrier protection</p>
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center space-x-3 shadow-premium">
              <Ruler className="w-8 h-8 text-primary" />
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Tailored Fit</h4>
                <p className="text-[10px] text-slate-500">Structured style outline</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customization & Shopping Panel */}
        <div className="space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">{product.name}</h1>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4.5 h-4.5 fill-amber-500" />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-400">({reviews.length} Customer Reviews)</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Pricing & Stock */}
          <div className="flex items-baseline space-x-3 bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-sm">
            <span className="text-2xl font-extrabold text-slate-800">₹{totalPrice}</span>
            {product.discountPrice && (
              <span className="text-slate-400 line-through text-sm">₹{product.basePrice + nameCharge + logoCharge}</span>
            )}
            <span className="text-xs text-slate-400 font-semibold ml-2">
              (Includes Name/Logo embroidery charges if active)
            </span>
          </div>

          {/* Color Selector */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Color</h3>
            <div className="flex flex-wrap gap-3">
              {availableColors.map(color => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                      isSelected 
                        ? 'border-primary bg-teal-50/20 text-primary shadow-sm scale-105' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-slate-200/50" 
                      style={{ backgroundColor: getColorHex(color) }}
                    />
                    <span>{color}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector & Chart Trigger */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Size</h3>
              <button
                onClick={() => setIsSizeChartOpen(true)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Ruler className="w-3.5 h-3.5" /> Size Guide Chart
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map(size => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-11 h-11 flex items-center justify-center border text-sm font-bold rounded-xl transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary text-white scale-105 shadow-md' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Customization Panel (uniformer.in style) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-premium space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b pb-2 flex items-center gap-1">
              <Sparkles className="w-4.5 h-4.5 text-primary" /> Direct Custom Embroidery
            </h3>

            {/* Name Embroidery Checkbox */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2.5 text-slate-700 font-bold text-xs select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={addName}
                  onChange={(e) => setAddName(e.target.checked)}
                  className="rounded border-slate-350 text-primary focus:ring-primary w-4 h-4"
                />
                <span>Add Name & Department Embroidery <span className="text-teal-600 font-semibold">(+₹100)</span></span>
              </label>

              {addName && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 border-l-2 border-primary/20 animate-in fade-in slide-in-from-left-2 duration-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Embroidery Text</label>
                    <input
                      type="text"
                      placeholder="Dr. Rajesh Kumar"
                      value={nameText}
                      onChange={(e) => setNameText(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Thread Color</label>
                    <select
                      value={nameColor}
                      onChange={(e) => setNameColor(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary bg-white focus:outline-none"
                    >
                      <option value="Gold">Luxury Gold</option>
                      <option value="White">Classic White</option>
                      <option value="Navy">Deep Navy</option>
                      <option value="Silver">Bright Silver</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Font Style</label>
                    <select
                      value={nameFont}
                      onChange={(e) => setNameFont(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary bg-white"
                    >
                      <option value="Block">Sans Block</option>
                      <option value="Script">Script Calligraphy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Embroidery Position</label>
                    <select
                      value={namePlacement}
                      onChange={(e) => setNamePlacement(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary bg-white"
                    >
                      <option value="Left Chest">Left Chest</option>
                      <option value="Right Chest">Right Chest</option>
                      <option value="Left Sleeve">Left Sleeve</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Logo Embroidery Checkbox */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center space-x-2.5 text-slate-700 font-bold text-xs select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={addLogo}
                  onChange={(e) => setAddLogo(e.target.checked)}
                  className="rounded border-slate-350 text-primary focus:ring-primary w-4 h-4"
                />
                <span>Add Custom Logo Embroidery <span className="text-teal-600 font-semibold">(+₹150)</span></span>
              </label>

              {addLogo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 border-l-2 border-primary/20 animate-in fade-in slide-in-from-left-2 duration-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Upload Brand Logo</label>
                    <div className="flex items-center space-x-2">
                      <label className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-slate-50 text-slate-600 font-semibold flex items-center gap-1.5">
                        <FileImage className="w-3.5 h-3.5 text-slate-400" />
                        <span>{logoFileName ? 'Change Logo' : 'Select File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {logoFileName && <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{logoFileName}</span>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Logo Position</label>
                    <select
                      value={logoPlacement}
                      onChange={(e) => setLogoPlacement(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary bg-white"
                    >
                      <option value="Right Chest">Right Chest</option>
                      <option value="Left Chest">Left Chest</option>
                      <option value="Right Sleeve">Right Sleeve</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Stock Availability Indicator */}
          {selectedVariant && (
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span>
                {selectedVariant.stock > 10 
                  ? `${selectedVariant.stock} items in stock, ready to ship` 
                  : `Only ${selectedVariant.stock} items left in stock - low inventory`}
              </span>
            </div>
          )}

          {/* Action Bar (Qty + Buy/Cart Buttons) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            
            {/* Quantity Selector */}
            <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 text-slate-500 hover:text-primary transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-slate-800 text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 text-slate-500 hover:text-primary transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Shopping CTAs */}
            <div className="flex gap-3 w-full">
              <button
                disabled={isUploadingLogo}
                onClick={() => handleAddToCart(false)}
                className="flex-grow flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" /> {isUploadingLogo ? 'Uploading...' : 'Add to Cart'}
              </button>
              <button
                disabled={isUploadingLogo}
                onClick={() => handleAddToCart(true)}
                className="flex-grow py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
              >
                {isUploadingLogo ? 'Uploading...' : 'Buy It Now'}
              </button>
            </div>

          </div>

          {/* Success Dialog overlay */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-xl text-center text-sm animate-bounce shadow-md">
              {successMsg}
            </div>
          )}

        </div>

      </div>

      {/* Size Chart Modal */}
      {isSizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-premium overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-dark p-5 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">ZAXO Size Measurement Chart</h2>
              <button 
                onClick={() => setIsSizeChartOpen(false)}
                className="text-white/80 hover:text-white font-bold text-lg"
              >
                Close (X)
              </button>
            </div>
            
            <div className="p-6">
              
              {/* Tab Selector */}
              <div className="flex border-b mb-4">
                <button
                  onClick={() => setActiveSizeChartTab('men')}
                  className={`flex-grow py-2 text-sm font-bold text-center border-b-2 transition-all ${
                    activeSizeChartTab === 'men' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Men's Sizing (Inches)
                </button>
                <button
                  onClick={() => setActiveSizeChartTab('women')}
                  className={`flex-grow py-2 text-sm font-bold text-center border-b-2 transition-all ${
                    activeSizeChartTab === 'women' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Women's Sizing (Inches)
                </button>
              </div>

              {/* Table details from pages 12-13 of catalog */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                      <th className="p-2.5 border-b">Size Label</th>
                      <th className="p-2.5 border-b">{activeSizeChartTab === 'men' ? 'Chest' : 'Bust'}</th>
                      <th className="p-2.5 border-b">Waist</th>
                      <th className="p-2.5 border-b">Hips</th>
                      <th className="p-2.5 border-b">Shoulder</th>
                      <th className="p-2.5 border-b">Length</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 font-medium divide-y">
                    {activeSizeChartTab === 'men' ? (
                      <>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-800">XS</td>
                          <td className="p-2.5">34" - 36"</td>
                          <td className="p-2.5">28" - 30"</td>
                          <td className="p-2.5">34" - 36"</td>
                          <td className="p-2.5">16.5"</td>
                          <td className="p-2.5">27.5"</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-800">S</td>
                          <td className="p-2.5">36" - 38"</td>
                          <td className="p-2.5">30" - 32"</td>
                          <td className="p-2.5">36" - 38"</td>
                          <td className="p-2.5">17"</td>
                          <td className="p-2.5">28.5"</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-2.5 font-bold text-slate-800">M</td>
                          <td className="p-2.5">38" - 40"</td>
                          <td className="p-2.5">32" - 34"</td>
                          <td className="p-2.5">38" - 40"</td>
                          <td className="p-2.5">17.5"</td>
                          <td className="p-2.5">29.5"</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-800">L</td>
                          <td className="p-2.5">40" - 42"</td>
                          <td className="p-2.5">34" - 36"</td>
                          <td className="p-2.5">40" - 42"</td>
                          <td className="p-2.5">18.2"</td>
                          <td className="p-2.5">30.5"</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-2.5 font-bold text-slate-800">XL</td>
                          <td className="p-2.5">42" - 44"</td>
                          <td className="p-2.5">36" - 38"</td>
                          <td className="p-2.5">42" - 44"</td>
                          <td className="p-2.5">19"</td>
                          <td className="p-2.5">31"</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-800">XXL</td>
                          <td className="p-2.5">44" - 46"</td>
                          <td className="p-2.5">38" - 40"</td>
                          <td className="p-2.5">44" - 46"</td>
                          <td className="p-2.5">20"</td>
                          <td className="p-2.5">32"</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-800">XS</td>
                          <td className="p-2.5">32" - 34"</td>
                          <td className="p-2.5">24" - 26"</td>
                          <td className="p-2.5">32" - 34"</td>
                          <td className="p-2.5">14.5"</td>
                          <td className="p-2.5">25.5"</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-800">S</td>
                          <td className="p-2.5">34" - 36"</td>
                          <td className="p-2.5">26" - 28"</td>
                          <td className="p-2.5">34" - 36"</td>
                          <td className="p-2.5">15"</td>
                          <td className="p-2.5">26.5"</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-2.5 font-bold text-slate-800">M</td>
                          <td className="p-2.5">36" - 38"</td>
                          <td className="p-2.5">28" - 30"</td>
                          <td className="p-2.5">36" - 38"</td>
                          <td className="p-2.5">15.5"</td>
                          <td className="p-2.5">27.5"</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-800">L</td>
                          <td className="p-2.5">38" - 40"</td>
                          <td className="p-2.5">30" - 32"</td>
                          <td className="p-2.5">38" - 40"</td>
                          <td className="p-2.5">16.2"</td>
                          <td className="p-2.5">28.5"</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-2.5 font-bold text-slate-800">XL</td>
                          <td className="p-2.5">40" - 42"</td>
                          <td className="p-2.5">32" - 34"</td>
                          <td className="p-2.5">40" - 42"</td>
                          <td className="p-2.5">17"</td>
                          <td className="p-2.5">29"</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-800">XXL</td>
                          <td className="p-2.5">42" - 44"</td>
                          <td className="p-2.5">34" - 36"</td>
                          <td className="p-2.5">42" - 44"</td>
                          <td className="p-2.5">18.5"</td>
                          <td className="p-2.5">30"</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-amber-50 text-amber-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> If your measurements fall between sizes, we recommend ordering the larger size for a relaxed, comfortable shift fit. For custom sizes, please use the <strong>Custom Uniform Builder</strong> in the menu.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Reviews Section */}
      <section className="border-t pt-8 space-y-6">
        <h3 className="text-xl font-bold text-slate-800">Fabric Performance Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500">No reviews yet. Be the first to purchase and review!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev, idx) => (
              <div key={idx} className="bg-slate-50 p-5 rounded-2xl space-y-3 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-xs">{rev.author}</span>
                  <div className="flex gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Verified Purchase</div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

// Color Hex map helper function
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
