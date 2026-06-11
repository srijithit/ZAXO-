'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Lock, Mail, User, Phone, Check, Eye, EyeOff, MessageSquare, ArrowLeft, Key } from 'lucide-react';

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

  // OTP-related states
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isOtpRegister, setIsOtpRegister] = useState(false);

  // Timer countdown hook
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Reset states when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setIsLoginView(true);
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setError('');
      setLoading(false);
      setSuccess(false);
      setShowPassword(false);
      setIsOtpMode(false);
      setOtpCode('');
      setOtpSent(false);
      setSimulatedOtp(null);
      setTimer(0);
      setIsOtpRegister(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setShowPassword(false);
  }, [isLoginView, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isOtpMode) {
        if (!otpSent) {
          // STEP 1: Request OTP
          const res = await fetch('/api/auth/otp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone,
              email: isOtpRegister ? email : undefined,
              name: isOtpRegister ? name : undefined,
              isRegistering: isOtpRegister,
            }),
          });
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Failed to send OTP');
          }

          setOtpSent(true);
          setSimulatedOtp(data.otp);
          setTimer(30); // 30 seconds cooldown
        } else {
          // STEP 2: Verify OTP
          const res = await fetch('/api/auth/otp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone,
              otp: otpCode,
              email: isOtpRegister ? email : undefined,
              name: isOtpRegister ? name : undefined,
            }),
          });
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Verification failed');
          }

          login(data.user.email, data.user.name, data.user.role, data.user.id);
          setSuccess(true);
          setTimeout(() => {
            onClose();
            setSuccess(false);
            setEmail('');
            setPhone('');
            setName('');
            setOtpCode('');
            setOtpSent(false);
            setSimulatedOtp(null);
          }, 1000);
        }
      } else {
        // STANDARD PASSWORD-BASED AUTH
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
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          email: isOtpRegister ? email : undefined,
          name: isOtpRegister ? name : undefined,
          isRegistering: isOtpRegister,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setSimulatedOtp(data.otp);
      setTimer(30);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const googleName = prompt("Select or enter your Google Account name:", "Dr. Arjun Mehta");
    if (!googleName) return; // User cancelled
    
    // Create a mock email from their name
    const emailPrefix = googleName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const mockEmail = `${emailPrefix || 'google.user'}@gmail.com`;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mockEmail,
          name: googleName
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google Login failed');
      }

      login(data.user.email, data.user.name, data.user.role, data.user.id);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign-in');
    } finally {
      setLoading(false);
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
            {isOtpMode 
              ? (otpSent ? 'Enter OTP' : 'OTP Fast Access') 
              : (isLoginView ? 'Welcome Back' : 'Create Account')}
          </h2>
          <p className="text-sm text-white/80 mt-1">
            {isOtpMode
              ? (otpSent ? 'We have sent a verification code' : 'Sign in or register securely via OTP')
              : (isLoginView ? 'Sign in to ZAXO Medical Apparel' : 'Join ZAXO for customized healthcare uniforms')}
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
            <>
              {/* Access Mode Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-5 border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpMode(false);
                    setError('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    !isOtpMode
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Password Access
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpMode(true);
                    setError('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    isOtpMode
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  OTP Fast Access
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* OTP Mode Form */}
                {isOtpMode ? (
                  <>
                    {!otpSent ? (
                      <>
                        {/* OTP Action Toggle */}
                        <div className="flex justify-center gap-6 mb-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold">
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-primary transition-colors">
                            <input
                              type="radio"
                              name="otp_type"
                              checked={!isOtpRegister}
                              onChange={() => {
                                setIsOtpRegister(false);
                                setError('');
                              }}
                              className="text-primary focus:ring-primary h-3.5 w-3.5 border-slate-300"
                            />
                            Existing Account
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-primary transition-colors">
                            <input
                              type="radio"
                              name="otp_type"
                              checked={isOtpRegister}
                              onChange={() => {
                                setIsOtpRegister(true);
                                setError('');
                              }}
                              className="text-primary focus:ring-primary h-3.5 w-3.5 border-slate-300"
                            />
                            New Account
                          </label>
                        </div>

                        {isOtpRegister && (
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
                          </>
                        )}

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

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {loading ? 'Sending...' : 'Send OTP Code'}
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Simulation notification */}
                        {simulatedOtp && (
                          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex flex-col gap-1.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-305">
                            <p className="font-bold flex items-center gap-1.5 text-amber-900">
                              <span className="animate-pulse">🔑</span> Simulated SMS Received:
                            </p>
                            <p>
                              Your ZAXO verification OTP is{' '}
                              <strong className="text-sm font-extrabold bg-white px-2.5 py-0.5 border border-amber-300 rounded shadow-sm tracking-widest text-primary">
                                {simulatedOtp}
                              </strong>
                            </p>
                          </div>
                        )}

                        <div className="text-center py-1">
                          <p className="text-xs text-slate-500">
                            Verification code sent to <strong className="text-slate-700">{phone}</strong>
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1 text-center">Enter 6-Digit OTP</label>
                          <div className="relative max-w-[200px] mx-auto">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                              <Key className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="123456"
                              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base font-extrabold tracking-[0.3em] text-center text-slate-800"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || otpCode.length !== 6}
                          className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50"
                        >
                          {loading ? 'Verifying...' : isOtpRegister ? 'Verify & Create Account' : 'Verify & Sign In'}
                        </button>

                        <div className="flex items-center justify-between text-xs pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setSimulatedOtp(null);
                              setOtpCode('');
                              setError('');
                            }}
                            className="flex items-center gap-1 text-slate-500 hover:text-primary font-semibold transition-colors"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Change Phone
                          </button>
                          
                          <button
                            type="button"
                            disabled={timer > 0 || loading}
                            onClick={handleResendOtp}
                            className="text-primary hover:underline font-bold disabled:text-slate-400 disabled:no-underline transition-colors"
                          >
                            {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  /* PASSWORD MODE FORM */
                  <>
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
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-655"
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
                  </>
                )}

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-150"></div>
                  <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Or</span>
                  <div className="flex-grow border-t border-slate-150"></div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg shadow-sm transition-all duration-200 text-xs disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Toggle View for Password Mode */}
                {!isOtpMode && (
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
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
