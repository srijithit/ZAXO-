'use client';

import React, { useState } from 'react';
import { BadgeCheck, Shield, Sparkles } from 'lucide-react';

interface ColorOption {
  name: string;
  cssClass: string;
  desc: string;
  hex: string;
}

const colors: ColorOption[] = [
  { name: 'Navy Blue', cssClass: 'bg-navy-blue', hex: '#1b2d42', desc: 'Standard clinical shade. Authoritative, professional, and stain-resistant.' },
  { name: 'Royal Blue', cssClass: 'bg-royal-blue', hex: '#2b579a', desc: 'Vibrant and neat. Ideal for nursing staff, critical care, and general wards.' },
  { name: 'Teal', cssClass: 'bg-teal', hex: '#0f766e', desc: 'Modern surgical favorite. Calming, sleek, and highly photogenic.' },
  { name: 'Hunter Green', cssClass: 'bg-hunter-green', hex: '#1e3f20', desc: 'Rich, natural green. Popular in surgical suites and specialized departments.' },
  { name: 'Wine', cssClass: 'bg-wine', hex: '#611a24', desc: 'Premium deep maroon. Exudes prestige and looks stunning with gold embroidery.' },
  { name: 'Charcoal', cssClass: 'bg-charcoal', hex: '#4a4a4a', desc: 'Sleek, technical gray. Ideal for dental practitioners and modern labs.' },
  { name: 'Black', cssClass: 'bg-black', hex: '#111111', desc: 'Premium modern look. Authoritative, sharp, and slimming.' },
  { name: 'Ceil Blue', cssClass: 'bg-ceil-blue', hex: '#8da4c4', desc: 'Traditional pediatric and general hospital blue. Muted, soft, and soothing.' },
  { name: 'Dusty Rose', cssClass: 'bg-dusty-rose', hex: '#c48d9f', desc: 'Gentle, warm pastel pink. Highly popular in obstetrics and pediatric units.' }
];

export default function ColorShowcase() {
  const [selectedColor, setSelectedColor] = useState<ColorOption>(colors[0]);

  return (
    <section className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8 my-12 shadow-premium">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Column: Interactive Selector */}
        <div className="space-y-6">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Fabric Spectrum
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-2">
              15+ Colors Available
            </h3>
            <p className="text-slate-600 text-sm mt-2">
              Click any premium swatch from the ZAXO color palette (Catalog Page 11) to inspect how our medical scrubs drape and stand out in that shade.
            </p>
          </div>

          {/* Swatches Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color)}
                className={`flex flex-col items-center p-2.5 rounded-xl border transition-all duration-200 hover:scale-105 ${
                  selectedColor.name === color.name
                    ? 'border-primary bg-white shadow-md'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <span className={`w-8 h-8 rounded-full shadow-inner ${color.cssClass}`} />
                <span className="text-[10px] font-bold text-slate-700 mt-1.5 text-center truncate w-full">
                  {color.name}
                </span>
              </button>
            ))}
          </div>

          {/* Description Card */}
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <span className={`w-3 h-3 rounded-full ${selectedColor.cssClass}`} />
              {selectedColor.name} Fabric Profile
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedColor.desc}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-slate-500 font-semibold uppercase">
              <span className="flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-emerald-500" /> Color Fastness</span>
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Anti-Fade tech</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Preview */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-sm aspect-square bg-white rounded-2xl border border-slate-100 shadow-md p-6 flex flex-col justify-between overflow-hidden">
            
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-10 -translate-y-10 -z-10" />

            {/* Scrub mock top */}
            <div className="flex-grow flex items-center justify-center">
              <div className="relative w-44 h-48 flex flex-col items-center">
                {/* Collar */}
                <div 
                  className="w-16 h-12 rounded-b-full shadow-inner transition-colors duration-300 relative z-25"
                  style={{ backgroundColor: selectedColor.hex, filter: 'brightness(0.9)' }}
                >
                  {/* V line */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-white" />
                </div>
                {/* Torso */}
                <div 
                  className="w-36 h-36 rounded-t-lg transition-colors duration-300 relative z-20 flex justify-between px-3 pt-6"
                  style={{ backgroundColor: selectedColor.hex }}
                >
                  {/* Mock Pocket left */}
                  <div className="w-8 h-8 rounded border border-white/20 bg-white/5 flex items-center justify-center">
                    <span className="text-[5px] text-white/50">ZAXO</span>
                  </div>
                  {/* Mock embroidery right */}
                  <div className="text-[6px] text-amber-400 font-serif leading-none mt-1 text-right">
                    Dr. Sharma<br/>
                    <span className="text-[4px] text-white/80">Cardiology</span>
                  </div>
                </div>
                {/* Sleeves */}
                <div 
                  className="absolute top-4 left-0 w-8 h-12 origin-top-left -rotate-[35deg] rounded-l transition-colors duration-300"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <div 
                  className="absolute top-4 right-0 w-8 h-12 origin-top-right rotate-[35deg] rounded-r transition-colors duration-300"
                  style={{ backgroundColor: selectedColor.hex }}
                />
              </div>
            </div>

            {/* Feature labels */}
            <div className="border-t border-slate-100 pt-4 text-center">
              <span className="text-slate-400 text-[10px] font-semibold tracking-wider uppercase block">Visual drape mockup</span>
              <p className="text-slate-800 font-bold text-sm mt-1">{selectedColor.name} Scrub Set</p>
              <div className="flex justify-center gap-2 mt-2">
                <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-semibold">4-Way Stretch</span>
                <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-semibold">Wrinkle Resistant</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
