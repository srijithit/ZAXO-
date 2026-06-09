'use client';

import React, { useState } from 'react';
import { Mail, Phone, Building, Briefcase, FileImage, ShieldCheck, HeartPulse, Send, BadgeAlert } from 'lucide-react';

export default function HospitalOrdersPage() {
  // Form State
  const [hospitalName, setHospitalName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(50);
  const [productType, setProductType] = useState('V-Neck Scrub Set');
  const [notes, setNotes] = useState('');
  const [logoFile, setLogoFile] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const productTypes = [
    'V-Neck Scrub Set',
    'Round Neck Scrub Set',
    'Overlap Neck Scrub Set',
    'Mandarin Collar Scrub Set',
    'Doctor Lab Coats',
    'Surgical Gowns',
    'Custom Mixed Staff Uniforms'
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

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity < 20) {
      alert('For bulk order inquiries, the quantity must be at least 20 units. For smaller orders, please use the Custom Uniform Builder.');
      return;
    }

    setLoading(true);

    const payload = {
      hospitalName,
      contactName,
      email,
      phone,
      quantity,
      productType,
      notes,
      logoUrl: logoFile || null
    };

    try {
      const res = await fetch('/api/bulk-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit B2B inquiry');
      }

      setSuccess(true);
      
      // Reset form
      setHospitalName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setQuantity(50);
      setNotes('');
      setLogoFile('');
      setLogoFileName('');
    } catch (err: any) {
      alert(err.message || 'Error occurred while submitting bulk lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Hero Header */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="lg:col-span-7 space-y-4 text-center lg:text-left z-10">
          <span className="text-teal-400 font-bold text-xs uppercase tracking-wider bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            Hospital Supply Chain
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Institutional Bulk Orders & Procurement
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl">
            ZAXO Clothing provides hospital-wide uniform procurement services. Partner with us for complete staff wardrobe standardization, custom fabric options, and dedicated account support.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-2 justify-center lg:justify-start">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4.5 h-4.5 text-teal-400" /> Bulk Pricing Rates</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4.5 h-4.5 text-teal-400" /> Roster Management</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4.5 h-4.5 text-teal-400" /> Dedicated Manager</span>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-4 max-w-xs w-full backdrop-blur-md">
            <Building className="w-12 h-12 text-teal-400 mx-auto" />
            <h3 className="font-bold text-lg">Hospital Procurement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We specialize in custom fits, embroidery design proofs, and monthly uniform replenishments.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Form Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Procurement Benefits */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Institutional Partnerships</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-premium">
              <span className="p-3 bg-teal-50 text-primary rounded-xl border border-teal-100 shrink-0 h-12 w-12 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm">Flexible Roster Sizing</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Submit sizing mixes or staff rosters. We handle shipping individually packed uniforms labeled with each doctor/nurse name.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-premium">
              <span className="p-3 bg-teal-50 text-primary rounded-xl border border-teal-100 shrink-0 h-12 w-12 flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm">Premium Fabric Options</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Choose from antimicrobial technology, stain-repellent coatings, or cotton-rich cooling fabrics according to department budgets.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-premium">
              <span className="p-3 bg-teal-50 text-primary rounded-xl border border-teal-100 shrink-0 h-12 w-12 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm">Dedicated Account Representative</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  A designated account manager coordinates samples, embroidery design verification, deliveries, and payment invoicing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Lead Form */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium">
          {success ? (
            <div className="text-center py-12 space-y-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 animate-bounce">
                <Send className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-slate-800">Inquiry Logged successfully!</h3>
                <p className="text-slate-500 text-sm">
                  Our B2B procurement representative will call/email you within 24 hours. Your lead is recorded in the admin sales CRM.
                </p>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-sm transition-all"
              >
                Submit New Bulk Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitLead} className="space-y-6">
              <h3 className="font-extrabold text-slate-800 text-lg border-b pb-2">Institutional Inquiry Form</h3>

              {/* Hospital & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hospital / Institution Name *</label>
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="E.g. Apollo Hospitals"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Sanjay Singhal (Procurement Manager)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@apollo.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Type & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Required Style Template *</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary bg-white focus:outline-none"
                  >
                    {productTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estimated Quantity *</label>
                  <input
                    type="number"
                    required
                    min={20}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Min. 20 units (Bulk pricing)</span>
                </div>
              </div>

              {/* Custom specs & Logo upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hospital Logo (Optional)</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <label className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-slate-50 text-slate-600 font-semibold flex items-center gap-1.5 bg-white">
                      <FileImage className="w-3.5 h-3.5 text-slate-400" />
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
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notes / Custom Requirements</label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. We require custom color matching for our pediatrics department (dusty rose and ceil blue). Please include sample swatches in the shipment."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isUploadingLogo}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-sm disabled:opacity-50"
              >
                {loading 
                  ? 'Submitting Inquiry...' 
                  : isUploadingLogo 
                    ? 'Uploading Logo to Cloud...' 
                    : 'Submit Procurement Inquiry'}
              </button>

            </form>
          )}
        </div>

      </div>

    </div>
  );
}
