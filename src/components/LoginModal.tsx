'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Lock, Mail, User, Phone, Check, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useApp();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setShowPassword(false);
  }, [isLoginView, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginView) {
        // Run API login call
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Login failed');
        }

        login(data.user.email, data.user.name, data.user.role, data.user.id);
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setEmail('');
          setPassword('');
        }, 1000);
      } else {
        // Run API register call
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password })
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        login(data.user.email, data.user.name, data.user.role, data.user.id);
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setEmail('');
          setPassword('');
          setName('');
          setPhone('');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill helper credentials to make testing extremely easy for the user
  const handlePrefill = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setEmail('admin@zaxo.com');
      setPassword('admin');
    } else {
      setEmail('arjun@hospital.com');
      setPassword('user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-premium overflow-hidden flex flex-col max-h-[90vh] transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white text-center shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold tracking-wide">
            {isLoginView ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-white/80 mt-1">
            {isLoginView ? 'Sign in to ZAXO Medical Apparel' : 'Join ZAXO for customized healthcare uniforms'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-emerald-600">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-500 mb-4 animate-bounce">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold">Successfully Authenticated!</h3>
              <p className="text-sm text-slate-500 mt-1">Redirecting you to the workspace...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {!isLoginView && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Rajesh Kumar"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50"
              >
                {loading ? 'Processing...' : isLoginView ? 'Sign In' : 'Sign Up'}
              </button>

              {/* Demo Pre-fill Section */}
              {isLoginView && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase text-center mb-2">Demo Accounts (Quick Select)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePrefill('user')}
                      className="px-2 py-1.5 border border-slate-200 hover:border-primary text-slate-600 hover:text-primary rounded text-xs transition-colors"
                    >
                      Doctor Login
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrefill('admin')}
                      className="px-2 py-1.5 border border-slate-200 hover:border-primary text-slate-600 hover:text-primary rounded text-xs transition-colors"
                    >
                      Admin Login
                    </button>
                  </div>
                </div>
              )}

              {/* Toggle View */}
              <div className="flex items-center justify-center gap-1.5 text-sm text-slate-600 mt-4">
                {isLoginView ? (
                  <>
                    <span>Don't have an account?</span>
                    <button
                      type="button"
                      onClick={() => setIsLoginView(false)}
                      className="text-primary hover:underline font-bold transition-all"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => setIsLoginView(true)}
                      className="text-primary hover:underline font-bold transition-all"
                    >
                      Login instead
                    </button>
                  </>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
