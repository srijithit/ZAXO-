'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Heart, ShieldAlert, BadgeCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block bg-white px-3 py-2 rounded-xl shadow-sm hover:opacity-90 transition-opacity">
              <img 
                src="/images/logo.png" 
                alt="ZAXO Clothing" 
                className="h-8 w-auto object-contain" 
              />
            </Link>
            <p className="text-sm text-slate-400">
              Premium Medical Scrubs, Doctor Coats, and Surgical Gowns designed for maximum comfort, durability, and professional prestige.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <BadgeCheck className="w-4 h-4 text-teal-400" />
              <span>ISO 9001:2015 Certified Fabric</span>
            </div>
          </div>

          {/* Customer Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Retail Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop?gender=Men" className="hover:text-teal-400 transition-colors">Men's Collection</Link>
              </li>
              <li>
                <Link href="/shop?gender=Women" className="hover:text-teal-400 transition-colors">Women's Collection</Link>
              </li>
              <li>
                <Link href="/shop?category=Doctor%20Coats" className="hover:text-teal-400 transition-colors">Doctor Lab Coats</Link>
              </li>
              <li>
                <Link href="/shop?category=Surgical%20Gowns" className="hover:text-teal-400 transition-colors">Surgical Gowns</Link>
              </li>
            </ul>
          </div>

          {/* Hospital B2B Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">B2B Hospital Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/customize" className="hover:text-teal-400 transition-colors font-semibold text-teal-300">Custom Uniform Builder</Link>
              </li>
              <li>
                <Link href="/hospital-orders" className="hover:text-teal-400 transition-colors">Bulk Hospital Supply</Link>
              </li>
              <li>
                <Link href="/customize" className="hover:text-teal-400 transition-colors">Logo & Name Embroidery</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <a 
                  href="https://maps.app.goo.gl/9t3adg4WqopBekPv7" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-teal-400 transition-colors"
                >
                  446/1, Ist Floor, RvR Store, Athipalayam Road, Ganapathy, Coimbatore - 641006, Tamil Nadu
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400" />
                <a href="tel:+919894012345" className="hover:text-teal-400 transition-colors">
                  +91 98940 12345
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400" />
                <a href="mailto:support@zaxoclothing.in" className="hover:text-teal-400 transition-colors">
                  support@zaxoclothing.in
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ZAXO Clothing (Unit of Sri Textiles). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for healthcare heroes
          </p>
        </div>
      </div>
    </footer>
  );
}
