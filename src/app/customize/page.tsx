'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Ruler, UploadCloud, CheckCircle2, ChevronRight, FileImage, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function CustomizePage() {
  const { user } = useApp();
  
  // Customizer State
  const [productType, setProductType] = useState('V-Neck Scrubs');
  const [color, setColor] = useState('Navy Blue');
  const [quantity, setQuantity] = useState(15);
  const [hospitalName, setHospitalName] = useState('');
  const [customNameText, setCustomNameText] = useState('');
  
  // Sizing mode: 'standard' or 'custom'
  const [sizingMode, setSizingMode] = useState<'standard' | 'custom'>('standard');

  // Standard Sizing Mix
  const [sizeS, setSizeS] = useState(5);
  const [sizeM, setSizeM] = useState(5);
  const [sizeL, setSizeL] = useState(5);
  const [sizeXL, setSizeXL] = useState(0);

  // Custom Sizing Measurements (Individual Staff Member)
  const [staffName, setStaffName] = useState('');
  const [chestSize, setChestSize] = useState('');
  const [waistSize, setWaistSize] = useState('');
  const [hipSize, setHipSize] = useState('');
  const [heightSize, setHeightSize] = useState('');

  // Logo upload state
  const [logoFile, setLogoFile] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // UI Flow States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdQuote, setCreatedQuote] = useState<any>(null);

  const productTypes = [
    'V-Neck Scrubs',
    'Round Neck Scrubs',
    'Overlap Neck Scrubs',
    'Mandarin Collar Scrubs',
    'Full Sleeve Scrubs',
    'Doctor Coats',
    'Surgical Gowns'
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

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity < 10) {
      alert('Minimum Order Quantity (MOQ) for custom uniform branding is 10 units.');
      return;
    }

    if (!hospitalName) {
      alert('Hospital or Clinic name is required');
      return;
    }

    setLoading(true);

    // Prepare measurements block
    let measurementsData: any = {};
    if (sizingMode === 'standard') {
      measurementsData = {
        type: 'standard-mix',
        sizes: { S: sizeS, M: sizeM, L: sizeL, XL: sizeXL }
      };
    } else {
      measurementsData = {
        type: 'custom-staff',
        staffName,
        measurements: { chest: chestSize, waist: waistSize, hip: hipSize, height: heightSize }
      };
    }

    const payload = {
      userId: user?.id || null,
      hospitalName,
      productType,
      color,
      quantity,
      customName: customNameText,
      logoUrl: logoFile || null,
      measurements: measurementsData
    };

    try {
      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quote request');
      }

      setCreatedQuote(data.customOrder);
      setSuccess(true);
      
      // Reset form
      setHospitalName('');
      setCustomNameText('');
      setLogoFile('');
      setLogoFileName('');
      setStaffName('');
      setChestSize('');
      setWaistSize('');
      setHipSize('');
      setHeightSize('');
    } catch (err: any) {
      alert(err.message || 'Error occurred while submitting request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
        <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          B2B Bespoke Uniforms
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
          ZAXO Custom Uniform Builder
        </h1>
        <p className="text-slate-600 text-sm">
          Design custom-branded uniforms for your clinic or hospital network. Select color, add logo embroidery, specify sizing runs, and get a formal invoice quote.
        </p>
      </div>

      {success ? (
        /* Success Screen */
        <div className="max-w-2xl mx-auto bg-white border border-slate-100 p-8 rounded-3xl shadow-premium text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-800">Quote Request Logged Successfully!</h2>
            <p className="text-slate-500 text-sm">
              Our design and production team will review your requirements. A custom pricing quote has been forwarded to the admin panel.
            </p>
          </div>
          
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-3 text-xs text-slate-600 max-w-md mx-auto">
            <p><strong>Quote ID:</strong> {createdQuote?.id}</p>
            <p><strong>Hospital Name:</strong> {createdQuote?.hospitalName}</p>
            <p><strong>Configured Style:</strong> {createdQuote?.productType} ({createdQuote?.color})</p>
            <p><strong>Bulk Quantity:</strong> {createdQuote?.quantity} sets (MOQ active)</p>
            <p><strong>Status:</strong> <span className="text-amber-600 font-bold">Pending Review</span></p>
          </div>

          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-sm transition-all"
          >
            Configure Another Uniform
          </button>
        </div>
      ) : (
        /* Builder Form Split Screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Visual preview mockup */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 shadow-premium space-y-6 sticky top-24">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Style Canvas Preview</span>
              <span className="bg-slate-800 border border-slate-700 text-[10px] px-2 py-0.5 rounded text-slate-300 font-medium">B2B Spec</span>
            </div>

            {/* Custom Uniform top mockup */}
            <div className="h-64 flex items-center justify-center">
              <div className="relative w-40 h-44 flex flex-col items-center">
                {/* Collar */}
                <div 
                  className="w-16 h-10 rounded-b-full shadow-inner transition-colors duration-300 relative z-25"
                  style={{ backgroundColor: getColorHex(color), filter: 'brightness(0.9)' }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-slate-900" />
                </div>
                {/* Torso */}
                <div 
                  className="w-32 h-32 rounded-t-lg transition-colors duration-300 relative z-20 flex justify-between px-3 pt-5"
                  style={{ backgroundColor: getColorHex(color) }}
                >
                  {/* Hospital Logo print on Left Chest */}
                  {logoFileName ? (
                    <div className="w-6 h-6 rounded border border-white/30 bg-white/20 flex items-center justify-center text-[5px] text-white overflow-hidden shrink-0 mt-1">
                      Logo
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded border-dashed border-white/20 bg-white/5 flex items-center justify-center shrink-0 mt-1">
                      <UploadCloud className="w-2.5 h-2.5 text-white/40" />
                    </div>
                  )}
                  {/* Custom Name embroidery on Right Chest */}
                  <div className="text-[6px] text-amber-400 font-serif leading-none mt-1 text-right truncate max-w-[50px]">
                    {customNameText || 'Name Text'}
                  </div>
                </div>
                {/* Sleeves */}
                <div 
                  className="absolute top-4 left-0 w-8 h-10 origin-top-left -rotate-[35deg] rounded-l transition-colors duration-300"
                  style={{ backgroundColor: getColorHex(color) }}
                />
                <div 
                  className="absolute top-4 right-0 w-8 h-10 origin-top-right rotate-[35deg] rounded-r transition-colors duration-300"
                  style={{ backgroundColor: getColorHex(color) }}
                />
              </div>
            </div>

            {/* Spec Details Card */}
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 text-xs space-y-2 text-slate-300">
              <p className="flex justify-between"><span className="text-slate-400">Design Model:</span> <strong className="text-white">{productType}</strong></p>
              <p className="flex justify-between"><span className="text-slate-400">Primary Color:</span> <strong className="text-white">{color}</strong></p>
              <p className="flex justify-between"><span className="text-slate-400">Logo Branding:</span> <strong className="text-white">{logoFileName ? `Uploaded (${logoFileName})` : 'None'}</strong></p>
              <p className="flex justify-between"><span className="text-slate-400">Minimum Order:</span> <strong className="text-white">10 units (MOQ active)</strong></p>
            </div>
          </div>

          {/* Right Side: Builder Form details */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium">
            <form onSubmit={handleSubmitQuote} className="space-y-6">
              
              {/* Styling Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Uniform Template</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary bg-white focus:outline-none"
                  >
                    {productTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fabric Color</label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary bg-white focus:outline-none"
                  >
                    {colors.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              </div>

              {/* Hospital details & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Hospital / Clinic Name *</label>
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="Max Super Speciality Hospital"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bulk Quantity *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Min. 10 sets (MOQ)</span>
                </div>
              </div>

              {/* Branding Customizations */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Embroidery Custom Text</label>
                  <input
                    type="text"
                    value={customNameText}
                    onChange={(e) => setCustomNameText(e.target.value)}
                    placeholder="E.g. Internal Medicine"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none bg-white"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1">Stitched on the right chest</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hospital Logo Upload</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <label className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs cursor-pointer hover:bg-slate-50 text-slate-600 font-semibold flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
                      <span>{logoFileName ? 'Change Logo' : 'Select Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {logoFileName && <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{logoFileName}</span>}
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">High-res vector or PNG</span>
                </div>

              </div>

              {/* Measurement Roster */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                    <Ruler className="w-4 h-4 text-primary" /> Uniform Sizing Roster
                  </h3>
                  
                  {/* Sizing Mode Pill Switch */}
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSizingMode('standard')}
                      className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                        sizingMode === 'standard' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Standard Mix
                    </button>
                    <button
                      type="button"
                      onClick={() => setSizingMode('custom')}
                      className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                        sizingMode === 'custom' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Bespoke Staff Measurements
                    </button>
                  </div>
                </div>

                {sizingMode === 'standard' ? (
                  /* Standard Sizing Counts */
                  <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 text-center uppercase mb-1">Small (S)</label>
                      <input
                        type="number"
                        min={0}
                        value={sizeS}
                        onChange={(e) => setSizeS(parseInt(e.target.value) || 0)}
                        className="w-full text-center px-2 py-1 border border-slate-200 rounded-lg text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 text-center uppercase mb-1">Medium (M)</label>
                      <input
                        type="number"
                        min={0}
                        value={sizeM}
                        onChange={(e) => setSizeM(parseInt(e.target.value) || 0)}
                        className="w-full text-center px-2 py-1 border border-slate-200 rounded-lg text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 text-center uppercase mb-1">Large (L)</label>
                      <input
                        type="number"
                        min={0}
                        value={sizeL}
                        onChange={(e) => setSizeL(parseInt(e.target.value) || 0)}
                        className="w-full text-center px-2 py-1 border border-slate-200 rounded-lg text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 text-center uppercase mb-1">X-Large (XL)</label>
                      <input
                        type="number"
                        min={0}
                        value={sizeXL}
                        onChange={(e) => setSizeXL(parseInt(e.target.value) || 0)}
                        className="w-full text-center px-2 py-1 border border-slate-200 rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  /* Bespoke Staff Sizing Inputs */
                  <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-in fade-in duration-200">
                    <div className="flex gap-2 items-center text-[10px] text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-semibold mb-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Input measurements for individual staff member to request a bespoke tailored cut.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Staff Member Name</label>
                        <input
                          type="text"
                          value={staffName}
                          onChange={(e) => setStaffName(e.target.value)}
                          placeholder="Dr. Neha Sharma"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chest Measurement (Inches)</label>
                        <input
                          type="text"
                          value={chestSize}
                          onChange={(e) => setChestSize(e.target.value)}
                          placeholder="38.5"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Waist Measurement (Inches)</label>
                        <input
                          type="text"
                          value={waistSize}
                          onChange={(e) => setWaistSize(e.target.value)}
                          placeholder="32.0"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hip Measurement (Inches)</label>
                        <input
                          type="text"
                          value={hipSize}
                          onChange={(e) => setHipSize(e.target.value)}
                          placeholder="39.0"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Height (Ft/In)</label>
                        <input
                          type="text"
                          value={heightSize}
                          onChange={(e) => setHeightSize(e.target.value)}
                          placeholder="5ft 8in"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading || isUploadingLogo}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-sm disabled:opacity-50"
              >
                {loading 
                  ? 'Submitting Quote Request...' 
                  : isUploadingLogo 
                    ? 'Uploading Logo to Cloud...' 
                    : 'Submit Custom Quote Request'}
              </button>

            </form>
          </div>

        </div>
      )}

    </div>
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
