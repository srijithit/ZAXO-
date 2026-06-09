'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, User, LogOut, Shield, Briefcase, RefreshCw, Menu, X, PlusSquare, Settings } from 'lucide-react';
import LoginModal from './LoginModal';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, cartCount, isB2BMode, setB2BMode } = useApp();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('showLogin') === 'true') {
        setIsLoginOpen(true);
        // Clean up URL parameter silently without reload
        const url = new URL(window.location.href);
        url.searchParams.delete('showLogin');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    }
  }, []);

  const activeLink = (path: string) => 
    pathname === path 
      ? 'text-primary font-bold border-b-2 border-primary' 
      : 'text-slate-600 hover:text-primary transition-colors border-b-2 border-transparent';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center">
              <img 
                src="/images/logo.png" 
                alt="ZAXO Clothing" 
                className="h-10 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            <Link href="/shop" className={activeLink('/shop')}>
              Shop Scrubs
            </Link>
            <Link href="/customize" className={activeLink('/customize')}>
              Custom Uniforms
            </Link>
            <Link href="/hospital-orders" className={activeLink('/hospital-orders')}>
              Bulk orders
            </Link>
            {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
              <Link href="/admin" className="text-amber-600 hover:text-amber-700 transition-colors border-b-2 border-transparent flex items-center gap-1 font-semibold">
                <Shield className="w-4 h-4" /> Admin Panel
              </Link>
            )}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            
            {/* Toggle Mode Button (B2C vs B2B) */}

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2 text-slate-600 hover:text-primary transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none bg-primary text-white transform translate-x-1/3 -translate-y-1/3">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-primary transition-all text-sm font-semibold"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span className="hidden lg:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    </div>
                    {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-semibold border-b border-slate-50"
                      >
                        <Shield className="w-4 h-4 mr-2" /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/order-history"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary font-semibold border-b border-slate-50"
                    >
                      <Briefcase className="w-4 h-4 mr-2 text-primary" /> Order History
                    </Link>
                    <Link
                      href="/order-history?tab=settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary font-semibold border-b border-slate-50"
                    >
                      <Settings className="w-4 h-4 mr-2 text-primary" /> Account Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LogOut className="w-4 h-4 mr-2 text-slate-400" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-primary transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 py-2 px-4 space-y-1 shadow-inner animate-in slide-in-from-top duration-200">
          <Link
            href="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
          >
            Shop Scrubs
          </Link>
          <Link
            href="/customize"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
          >
            Custom Uniforms
          </Link>
          <Link
            href="/hospital-orders"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
          >
            Bulk Orders
          </Link>
          {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-bold text-amber-700 bg-amber-50"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}

      </header>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
