'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Trash2, ShoppingBag, ArrowRight, Check, Sparkles, CreditCard, ChevronRight, FileCheck } from 'lucide-react';

// Helper to inject the Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, Razorpay, COD, WhatsApp

  // Created Order details
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Razorpay Simulation modal states
  const [showRazorpaySim, setShowRazorpaySim] = useState(false);
  const [razorpaySimData, setRazorpaySimData] = useState<any>(null);
  const [simSelectedSubMethod, setSimSelectedSubMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [simCardNumber, setSimCardNumber] = useState('');
  const [simCardExpiry, setSimCardExpiry] = useState('');
  const [simCardCVV, setSimCardCVV] = useState('');
  const [simUpiId, setSimUpiId] = useState('');

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
      paymentStatus: (paymentMethod === 'COD' || paymentMethod === 'WhatsApp' || paymentMethod === 'Razorpay') ? 'UNPAID' : 'PAID',
      paymentMethod: paymentMethod
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

      const orderObj = data.order;

      // Handle Razorpay checkout integration
      if (paymentMethod === 'Razorpay') {
        const rzRes = await fetch('/api/payment/razorpay/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: cartTotal, orderId: orderObj.id })
        });
        const rzData = await rzRes.json();
        if (!rzRes.ok) throw new Error(rzData.error || 'Failed to initialize Razorpay checkout');

        // Check if sandbox simulated mode
        if (rzData.simulated) {
          setRazorpaySimData({
            orderId: orderObj.id,
            razorpayOrderId: rzData.razorpay_order_id,
            amount: cartTotal
          });
          setShowRazorpaySim(true);
          setLoading(false);
          return;
        }

        // Real integration
        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded) throw new Error('Razorpay SDK failed to load. Please verify your internet connection.');

        const options = {
          key: rzData.key_id,
          amount: rzData.amount,
          currency: rzData.currency,
          name: 'ZAXO Clothing',
          description: `ZAXO Order Ref #${orderObj.id.substring(0, 8)}`,
          order_id: rzData.razorpay_order_id,
          handler: async function (response: any) {
            try {
              setLoading(true);
              const verifyRes = await fetch('/api/payment/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderObj.id,
                  simulated: false
                })
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment signature verification failed');

              setCreatedOrder(verifyData.order);
              clearCart();
              setStep(4);
            } catch (err: any) {
              alert(err.message || 'Error verifying Razorpay signature');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: addressName,
            email: addressEmail,
            contact: addressPhone
          },
          theme: {
            color: '#0f766e'
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              alert('Payment process was cancelled.');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      // Handle WhatsApp checkout integration
      if (paymentMethod === 'WhatsApp') {
        setCreatedOrder(orderObj);
        clearCart();
        setStep(4);

        // Format detailed WhatsApp text message
        const itemsText = cart.map(item => {
          let custText = '';
          if (item.customization) {
            const nameSub = item.customization.nameText ? `\n   - Custom Name: "${item.customization.nameText}" (${item.customization.nameColor} thread, ${item.customization.nameFont})` : '';
            const logoSub = item.customization.logoFile ? `\n   - Custom Logo: Uploaded (placement on ${item.customization.logoPlacement})` : '';
            custText = `${nameSub}${logoSub}`;
          }
          return `• ${item.product.name} (Qty: ${item.quantity}, Size: ${item.variant.size}, Color: ${item.variant.color})${custText}`;
        }).join('\n');

        const messageText = `Hi ZAXO Clothing, I've placed order #${orderObj.id.substring(0, 8)} on your site.\n\n*Order Details:*\n${itemsText}\n\n*Shipping Address:*\nName: ${addressName}\nAddress: ${streetAddress}, ${city} - ${postalCode}\nPhone: ${addressPhone}\n\n*Grand Total:* ₹${cartTotal}\n\nPlease share the payment instructions to confirm this order. Thank you!`;
        
        const encodedMessage = encodeURIComponent(messageText);
        const whatsappUrl = `https://wa.me/919791471277?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
        setLoading(false);
        return;
      }

      // Handle standard COD, UPI manual, etc.
      setCreatedOrder(orderObj);
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
                      <p><strong>Official UPI ID:</strong> <span className="font-bold text-slate-900 select-all">9791471277@kotakbank</span></p>
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
                      <CreditCard className="w-4 h-4 text-slate-400" /> Razorpay Payment Gateway
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Secure payment via credit/debit card, UPI, or Netbanking via Razorpay SDK.</p>
                  </div>
                </label>

                {/* WhatsApp Payment Option */}
                <label className={`flex items-start p-4 rounded-xl border cursor-pointer select-none transition-all ${
                  paymentMethod === 'WhatsApp' ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'WhatsApp'}
                    onChange={() => setPaymentMethod('WhatsApp')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="ml-3 flex gap-2 items-start">
                    <svg className="w-5 h-5 text-emerald-600 fill-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.59-2.09c1.61.956 3.197 1.467 4.86 1.468 5.462 0 9.907-4.444 9.91-9.913.002-2.65-1.02-5.14-2.877-6.998C16.63 4.607 14.14 3.582 11.998 3.582c-5.466 0-9.91 4.445-9.913 9.916-.002 1.764.462 3.486 1.348 5.023l-.974 3.56 3.655-.959zm12.39-7.228c-.303-.152-1.793-.884-2.071-.985-.278-.102-.48-.153-.681.152-.2.304-.778.985-.955 1.187-.176.203-.353.228-.656.076-.303-.152-1.278-.47-2.435-1.502-.9-.803-1.507-1.794-1.684-2.098-.177-.303-.019-.467.132-.618.136-.135.303-.353.455-.53.15-.176.2-.303.3-.505.1-.202.05-.378-.025-.53-.075-.152-.682-1.644-.934-2.253-.246-.597-.496-.516-.681-.526-.176-.009-.379-.01-.582-.01-.202 0-.53.076-.808.379-.278.303-1.062 1.037-1.062 2.529 0 1.492 1.087 2.934 1.239 3.136.152.203 2.138 3.264 5.18 4.58.723.313 1.288.5 1.727.64.726.23 1.388.197 1.91.12.583-.087 1.794-.733 2.047-1.44.253-.708.253-1.314.177-1.44-.076-.126-.278-.203-.581-.355z"/>
                    </svg>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm text-emerald-800 flex items-center gap-1.5">
                        Order & Pay via WhatsApp
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Submit details instantly to our representative. Excellent for manual or customized confirmations.</p>
                    </div>
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

      {/* Razorpay Simulation Modal */}
      {showRazorpaySim && razorpaySimData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Simulation Header */}
            <div className="bg-blue-600 text-white p-6 flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-100">Razorpay Checkout</p>
                <h3 className="text-xl font-extrabold mt-1">ZAXO Clothing Merchant</h3>
                <p className="text-xs text-blue-200 mt-1 select-all">Order ID: {razorpaySimData.razorpayOrderId}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-blue-100 block">Amount Due</span>
                <span className="text-2xl font-extrabold">₹{razorpaySimData.amount}</span>
              </div>
            </div>

            {/* Simulated Payment Area */}
            <div className="p-6 space-y-5 flex-1">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <p>
                  <strong>Sandbox Environment:</strong> Razorpay API keys are not detected in your `.env` file. You are viewing the payment gateway simulation portal.
                </p>
              </div>

              {/* Sub-Methods Switcher */}
              <div className="flex border-b border-slate-100 text-xs font-bold">
                <button 
                  onClick={() => setSimSelectedSubMethod('card')}
                  className={`pb-2 pr-4 border-b-2 transition-colors ${simSelectedSubMethod === 'card' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
                >
                  Card Payment
                </button>
                <button 
                  onClick={() => setSimSelectedSubMethod('upi')}
                  className={`pb-2 px-4 border-b-2 transition-colors ${simSelectedSubMethod === 'upi' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
                >
                  UPI Apps
                </button>
                <button 
                  onClick={() => setSimSelectedSubMethod('netbanking')}
                  className={`pb-2 px-4 border-b-2 transition-colors ${simSelectedSubMethod === 'netbanking' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
                >
                  Netbanking
                </button>
              </div>

              {/* Card Inputs */}
              {simSelectedSubMethod === 'card' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="4111 2222 3333 4444" 
                      value={simCardNumber}
                      onChange={(e) => setSimCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                      className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={simCardExpiry}
                        onChange={(e) => setSimCardExpiry(e.target.value.substring(0, 5))}
                        className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CVV</label>
                      <input 
                        type="password" 
                        placeholder="•••" 
                        value={simCardCVV}
                        onChange={(e) => setSimCardCVV(e.target.value.replace(/\D/g, '').substring(0, 3))}
                        className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Inputs */}
              {simSelectedSubMethod === 'upi' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Virtual Payment Address (VPA)</label>
                    <input 
                      type="text" 
                      placeholder="doctor@upi" 
                      value={simUpiId}
                      onChange={(e) => setSimUpiId(e.target.value)}
                      className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold">
                    <button onClick={() => setSimUpiId('doctor@okaxis')} className="p-2 border rounded-lg hover:border-blue-500 hover:bg-blue-50/10">doctor@okaxis</button>
                    <button onClick={() => setSimUpiId('care@okicici')} className="p-2 border rounded-lg hover:border-blue-500 hover:bg-blue-50/10">care@okicici</button>
                    <button onClick={() => setSimUpiId('zaxo@ybl')} className="p-2 border rounded-lg hover:border-blue-500 hover:bg-blue-50/10">zaxo@ybl</button>
                  </div>
                </div>
              )}

              {/* Netbanking Select */}
              {simSelectedSubMethod === 'netbanking' && (
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold animate-in fade-in duration-150">
                  <button className="p-3 border rounded-xl hover:border-blue-500 hover:bg-blue-50/10 flex flex-col items-center gap-1">
                    <span className="text-blue-700">SBI</span>
                    <span className="text-[9px] text-slate-400">State Bank of India</span>
                  </button>
                  <button className="p-3 border rounded-xl hover:border-blue-500 hover:bg-blue-50/10 flex flex-col items-center gap-1">
                    <span className="text-blue-700">HDFC</span>
                    <span className="text-[9px] text-slate-400">HDFC Bank</span>
                  </button>
                  <button className="p-3 border rounded-xl hover:border-blue-500 hover:bg-blue-50/10 flex flex-col items-center gap-1">
                    <span className="text-blue-700">ICICI</span>
                    <span className="text-[9px] text-slate-400">ICICI Bank</span>
                  </button>
                  <button className="p-3 border rounded-xl hover:border-blue-500 hover:bg-blue-50/10 flex flex-col items-center gap-1">
                    <span className="text-blue-700">AXIS</span>
                    <span className="text-[9px] text-slate-400">Axis Bank</span>
                  </button>
                </div>
              )}
            </div>

            {/* Simulation Actions */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const verifyRes = await fetch('/api/payment/razorpay/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orderId: razorpaySimData.orderId,
                        razorpay_order_id: razorpaySimData.razorpayOrderId,
                        razorpay_payment_id: 'pay_sim_' + Math.random().toString(36).substring(2, 12),
                        razorpay_signature: 'sig_sim_' + Math.random().toString(36).substring(2, 12),
                        simulated: true
                      })
                    });
                    const verifyData = await verifyRes.json();
                    if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');
                    
                    setShowRazorpaySim(false);
                    setCreatedOrder(verifyData.order);
                    clearCart();
                    setStep(4);
                  } catch (err: any) {
                    alert(err.message || 'Payment simulation failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs transition-colors flex items-center justify-center gap-1"
              >
                Simulate Successful Payment
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowRazorpaySim(false);
                    setLoading(false);
                    alert('Razorpay Checkout Simulation: Payment was declined/cancelled.');
                  }}
                  className="flex-1 py-2 border border-slate-200 text-rose-600 hover:bg-rose-50/50 rounded-xl text-xs font-bold transition-colors"
                >
                  Simulate Payment Decline
                </button>
                <button
                  onClick={() => {
                    setShowRazorpaySim(false);
                    setLoading(false);
                  }}
                  className="px-3 py-2 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

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

