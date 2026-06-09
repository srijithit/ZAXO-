'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Trash2, ShoppingBag, ArrowRight, Check, Sparkles, CreditCard, ChevronRight, FileCheck } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, user } = useApp();
  
  // Checkout Wizard Steps: 1 = Cart, 2 = Address, 3 = Payment, 4 = Success
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Address Form State
  const [addressName, setAddressName] = useState(user?.name || '');
  const [addressEmail, setAddressEmail] = useState(user?.email || '');
  const [addressPhone, setAddressPhone] = useState(user?.phone || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [stateName, setStateName] = useState('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, Razorpay, COD

  // Created Order details
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const handleNextStep = () => {
    if (step === 2) {
      if (!addressName || !addressEmail || !addressPhone || !streetAddress || !city || !postalCode) {
        alert('Please fill out all required fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    const shippingDetails = {
      name: addressName,
      email: addressEmail,
      phone: addressPhone,
      address: streetAddress,
      city,
      postalCode,
      state: stateName
    };

    const orderPayload = {
      userId: user?.id || null,
      totalAmount: cartTotal,
      shippingAddress: shippingDetails,
      items: cart.map(item => ({
        product: { 
          id: item.product.id, 
          name: item.product.name, 
          slug: item.product.slug,
          basePrice: item.product.basePrice,
          discountPrice: item.product.discountPrice || null
        },
        variant: { id: item.variant.id, sku: item.variant.sku, size: item.variant.size, color: item.variant.color },
        quantity: item.quantity,
        customization: item.customization
      })),
      paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'PAID'
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setCreatedOrder(data.order);
      clearCart();
      setStep(4);
    } catch (err: any) {
      alert(err.message || 'Error occurred while checking out');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 4) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-800">Your Shopping Cart is Empty</h2>
          <p className="text-slate-500 text-sm">Add premium medical scrubs or lab coats to get started.</p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow transition-colors text-sm"
        >
          Go to Apparel Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Wizard Header Progress Bar */}
      <div className="max-w-3xl mx-auto flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-400">
        <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-primary font-bold' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200'}`}>1</span>
          <span>Review Cart</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-primary font-bold' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200'}`}>2</span>
          <span>Delivery Details</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-primary font-bold' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-200'}`}>3</span>
          <span>Payment Info</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-emerald-600 font-bold' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>4</span>
          <span>Success</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Step 1: Cart Items Review */}
        {step === 1 && (
          <>
            {/* Left side items */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-xl font-extrabold text-slate-800">Shopping Cart Items ({cart.length})</h2>
              
              <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 shadow-premium space-y-4 divide-y divide-slate-100">
                {cart.map((item) => {
                  const unitPrice = item.product.discountPrice || item.product.basePrice;
                  const itemTotal = (unitPrice + (item.customization?.priceCharge || 0)) * item.quantity;

                  return (
                    <div key={item.variant.sku} className="pt-4 first:pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      
                      {/* Item Details */}
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200/50"
                          style={{ backgroundColor: getColorHex(item.variant.color) }}
                        >
                          <ShoppingBag className="w-6 h-6 text-white/90" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.product.name}</h4>
                          <div className="flex gap-2 text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                            <span>Size: {item.variant.size}</span>
                            <span>•</span>
                            <span>Color: {item.variant.color}</span>
                          </div>
                          
                          {/* Embroidery details if exist */}
                          {item.customization && (
                            <div className="mt-2 p-2 bg-teal-50/50 border border-teal-100 rounded-lg text-[10px] text-teal-800 space-y-0.5">
                              <p className="font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-teal-600" /> Embroidery Details:
                              </p>
                              {item.customization.nameText && (
                                <p>Name: "{item.customization.nameText}" ({item.customization.nameFont} - {item.customization.nameColor} thread - {item.customization.namePlacement})</p>
                              )}
                              {item.customization.logoFile && (
                                <p>Logo: Uploaded (placed on {item.customization.logoPlacement})</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Price controls */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 self-stretch sm:self-center">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.variant.sku, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:text-primary"
                          >
                            <MinusIcon />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variant.sku, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:text-primary"
                          >
                            <PlusIcon />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-extrabold text-slate-800 text-sm">₹{itemTotal}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">₹{unitPrice + (item.customization?.priceCharge || 0)} each</p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.variant.sku)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side summary */}
            <div className="lg:col-span-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-premium space-y-4">
              <h3 className="font-bold text-slate-800 border-b pb-2 text-base">Checkout Summary</h3>
              <div className="space-y-2 text-xs font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Cart Items Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-emerald-600">FREE Shipping</span>
                </div>
              </div>
              <div className="border-t pt-4 flex justify-between font-extrabold text-slate-800 text-lg">
                <span>Grand Total</span>
                <span>₹{cartTotal}</span>
              </div>
              
              <button
                onClick={handleNextStep}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-sm"
              >
                Proceed to Checkout <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </>
        )}

        {/* Step 2: Shipping Address */}
        {step === 2 && (
          <>
            {/* Left side Address Form */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-xl font-extrabold text-slate-800">Enter Shipping & Delivery Details</h2>
              <form className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={addressName}
                    onChange={(e) => setAddressName(e.target.value)}
                    placeholder="Dr. Rajesh Kumar"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addressEmail}
                    onChange={(e) => setAddressEmail(e.target.value)}
                    placeholder="rajesh@fortis.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={addressPhone}
                    onChange={(e) => setAddressPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="12/A, Doctors Enclave, Richmond Road"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Postal Code (PIN) *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="560025"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">State / Province</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                  />
                </div>

              </form>
            </div>

            {/* Right side summary */}
            <div className="lg:col-span-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-premium space-y-4">
              <h3 className="font-bold text-slate-800 border-b pb-2 text-base">Checkout Summary</h3>
              <div className="flex justify-between font-extrabold text-slate-800 text-lg">
                <span>Grand Total</span>
                <span>₹{cartTotal}</span>
              </div>
              <button
                onClick={handleNextStep}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-sm"
              >
                Proceed to Payment <ArrowRight className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setStep(1)}
                className="w-full py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Back to Shopping Cart
              </button>
            </div>
          </>
        )}

        {/* Step 3: Payment Details */}
        {step === 3 && (
          <>
            {/* Left side: Payment Methods Selector */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-xl font-extrabold text-slate-800">Select Payment Method (Simulated Gateway)</h2>
              
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4">
                     {/* UPI Option */}
                <label className={`flex flex-col p-4 rounded-xl border cursor-pointer select-none transition-all ${
                  paymentMethod === 'UPI' ? 'border-primary bg-teal-50/10' : 'border-slate-200'
                }`}>
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      className="mt-1 text-primary focus:ring-primary"
                    />
                    <div className="ml-3">
                      <h4 className="font-bold text-slate-800 text-sm">UPI Payment (GPay, PhonePe, Paytm)</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Pay instantly using your preferred UPI app. Instant authorization.</p>
                    </div>
                  </div>
                  {paymentMethod === 'UPI' && (
                    <div className="mt-3 ml-6 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 text-slate-700 animate-in fade-in duration-200">
                      <p><strong>Official UPI ID:</strong> <span className="font-bold text-slate-900 select-all">zaxoclothing@okaxis</span></p>
                      <p className="text-[10px] text-slate-400">Transfer the exact grand total to this UPI ID to authorize your order.</p>
                    </div>
                  )}
                </label>

                {/* Direct Bank Transfer Option */}
                <label className={`flex flex-col p-4 rounded-xl border cursor-pointer select-none transition-all ${
                  paymentMethod === 'BankTransfer' ? 'border-primary bg-teal-50/10' : 'border-slate-200'
                }`}>
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'BankTransfer'}
                      onChange={() => setPaymentMethod('BankTransfer')}
                      className="mt-1 text-primary focus:ring-primary"
                    />
                    <div className="ml-3">
                      <h4 className="font-bold text-slate-800 text-sm">Direct Bank Transfer (NEFT / IMPS / RTGS)</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Transfer funds directly into our corporate bank account. Orders are processed upon verification.</p>
                    </div>
                  </div>
                  {paymentMethod === 'BankTransfer' && (
                    <div className="mt-4 ml-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-700 animate-in fade-in duration-200">
                      <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b pb-1">Zaxo Clothing Corporate Bank Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <p><span className="text-slate-400 font-semibold">Account Name:</span> <strong className="text-slate-850">ZAXO CLOTHING</strong></p>
                        <p><span className="text-slate-400 font-semibold">Bank Name:</span> <strong className="text-slate-850">HDFC Bank Ltd</strong></p>
                        <p><span className="text-slate-400 font-semibold">Account Number:</span> <strong className="text-slate-850">50200088899912</strong></p>
                        <p><span className="text-slate-400 font-semibold">IFSC Code:</span> <strong className="text-slate-850">HDFC0000123</strong></p>
                        <p><span className="text-slate-400 font-semibold">Branch Name:</span> <strong className="text-slate-850">Ganapathy, Coimbatore</strong></p>
                        <p><span className="text-slate-400 font-semibold">Account Type:</span> <strong className="text-slate-850">Current Account</strong></p>
                      </div>
                    </div>
                  )}
                </label>

                {/* Razorpay Card Option */}
                <label className={`flex items-start p-4 rounded-xl border cursor-pointer select-none transition-all ${
                  paymentMethod === 'Razorpay' ? 'border-primary bg-teal-50/10' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="mt-1 text-primary focus:ring-primary"
                  />
                  <div className="ml-3">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-slate-400" /> Razorpay Credit/Debit Card
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Simulate payment verification. International cards accepted.</p>
                  </div>
                </label>

                {/* Cash On Delivery Option */}
                <label className={`flex items-start p-4 rounded-xl border cursor-pointer select-none transition-all ${
                  paymentMethod === 'COD' ? 'border-primary bg-teal-50/10' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 text-primary focus:ring-primary"
                  />
                  <div className="ml-3">
                    <h4 className="font-bold text-slate-800 text-sm">Cash On Delivery (COD)</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Pay in cash or card when the delivery partner delivers at your address.</p>
                  </div>
                </label>

              </div>
            </div>

            {/* Right side summary */}
            <div className="lg:col-span-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-premium space-y-4">
              <h3 className="font-bold text-slate-800 border-b pb-2 text-base">Payment Summary</h3>
              <div className="space-y-1 text-xs text-slate-500">
                <p>Deliver to: <strong>{addressName}</strong></p>
                <p className="truncate">Address: {streetAddress}, {city}</p>
                <p>Payment Mode: <strong>{paymentMethod}</strong></p>
              </div>
              
              <div className="border-t pt-4 flex justify-between font-extrabold text-slate-800 text-lg">
                <span>Grand Total</span>
                <span>₹{cartTotal}</span>
              </div>
              
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-sm disabled:opacity-50"
              >
                {loading ? 'Processing Checkout...' : `Confirm & Pay ₹${cartTotal}`}
              </button>
              <button
                onClick={() => setStep(2)}
                className="w-full py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Back to Shipping Form
              </button>
            </div>
          </>
        )}

        {/* Step 4: Success / Confirmation */}
        {step === 4 && createdOrder && (
          <div className="lg:col-span-12 max-w-2xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-premium text-center space-y-6">
            
            {/* Header animation badge */}
            <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
              <Check className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-800">Order Placed Successfully!</h2>
              <p className="text-slate-500 text-sm">
                Thank you for shopping with ZAXO Medical Apparel. Your order details are logged below.
              </p>
            </div>

            {/* Order Specs */}
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-200/50 pb-4">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Order ID Reference</p>
                  <p className="font-extrabold text-slate-800 mt-0.5">{createdOrder.id}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Payment Status</p>
                  <p className={`font-extrabold mt-0.5 ${createdOrder.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {createdOrder.paymentStatus === 'PAID' ? 'PAID (Simulated)' : 'PENDING (Cash on Delivery)'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Delivery Recipient Address</p>
                <p className="font-bold text-slate-800 mt-1">{JSON.parse(createdOrder.shippingAddress).name}</p>
                <p className="mt-0.5">{JSON.parse(createdOrder.shippingAddress).address}, {JSON.parse(createdOrder.shippingAddress).city} - {JSON.parse(createdOrder.shippingAddress).postalCode}</p>
                <p className="mt-0.5">Phone: {JSON.parse(createdOrder.shippingAddress).phone}</p>
              </div>

              <div className="border-t border-slate-200/50 pt-4 flex justify-between items-center text-sm font-extrabold text-slate-800">
                <span>Total Amount Charged</span>
                <span className="text-primary">₹{createdOrder.totalAmount}</span>
              </div>
            </div>

            {/* Home redirection actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/shop"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md text-sm transition-all"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all"
              >
                Return to Home
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// Small Icon Helpers
function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
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

