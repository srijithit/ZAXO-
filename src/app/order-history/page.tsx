'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  ShoppingBag, 
  Calendar, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Lock, 
  FileText,
  Clock,
  Truck,
  CheckCircle2,
  Trash2,
  Sparkles,
  Ruler,
  Building,
  Check,
  XCircle,
  Info,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';

export default function OrderHistoryPage() {
  const { user, isAuthenticating } = useApp();
  
  // B2C Retail Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // B2B Custom Quotes State
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(true);
  const [expandedCustomOrder, setExpandedCustomOrder] = useState<string | null>(null);
  
  // Active Tab state
  const [activeTab, setActiveTab] = useState<'retail' | 'custom'>('retail');
  
  // Print State
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<any>(null);

  // Trigger print after state updates
  useEffect(() => {
    if (selectedPrintOrder) {
      const timer = setTimeout(() => {
        window.print();
        setSelectedPrintOrder(null);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedPrintOrder]);

  const fetchUserOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching user order history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomOrders = async () => {
    if (!user) return;
    try {
      setLoadingCustom(true);
      const res = await fetch(`/api/custom-orders?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch custom orders');
      const data = await res.json();
      setCustomOrders(data);
    } catch (err) {
      console.error('Error fetching custom orders:', err);
    } finally {
      setLoadingCustom(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to remove this order from your purchase history? This action is permanent.')) return;
    try {
      const res = await fetch(`/api/orders?orderId=${orderId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      alert('Order successfully removed from history.');
      fetchUserOrders();
    } catch (err) {
      alert('Error removing order from history');
    }
  };

  const handleCancelCustomOrder = async (customOrderId: string) => {
    if (!confirm('Are you sure you want to cancel and remove this custom uniform request? This action is permanent.')) return;
    try {
      const res = await fetch(`/api/custom-orders?customOrderId=${customOrderId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Cancellation failed');
      alert('Custom uniform request successfully cancelled.');
      fetchCustomOrders();
    } catch (err) {
      alert('Error cancelling custom uniform request');
    }
  };

  const handleApproveCustomOrder = async (customOrderId: string) => {
    if (!confirm('Are you sure you want to approve this quote? This will notify our sales and manufacturing team to prepare your invoice.')) return;
    try {
      const res = await fetch(`/api/custom-orders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customOrderId,
          status: 'APPROVED'
        })
      });
      if (!res.ok) throw new Error('Approval failed');
      alert('Quote approved successfully! Our representative will call or email you shortly.');
      fetchCustomOrders();
    } catch (err) {
      alert('Error approving custom uniform quote');
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
      fetchCustomOrders();
    }
  }, [user]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(prev => (prev === orderId ? null : orderId));
  };

  const toggleExpandCustom = (orderId: string) => {
    setExpandedCustomOrder(prev => (prev === orderId ? null : orderId));
  };

  if (isAuthenticating) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
        <p className="text-sm font-semibold font-sans">Verifying security credentials...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-slate-100 p-8 rounded-2xl shadow-premium animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-teal-50 border border-teal-200 rounded-full flex items-center justify-center mx-auto text-primary">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Authentication Required</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Please sign in to view your order history and track shipments.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <Link 
              href="/" 
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              Back to Storefront
            </Link>
            <button
              onClick={() => {
                window.location.href = '/?showLogin=true';
              }}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 print:hidden">
        
        {/* Title Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-850 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-primary" /> My Order History
            </h1>
            <p className="text-xs text-slate-400 font-semibold font-sans">
              Track shipments, print tax invoices, and review past purchases for {user.name}
            </p>
          </div>
          <button 
            onClick={() => {
              fetchUserOrders();
              fetchCustomOrders();
            }}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-primary text-slate-700 hover:text-primary rounded-xl text-xs font-semibold bg-slate-50 transition-all shadow-sm"
            title="Refresh order logs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('retail')}
            className={`pb-3 font-bold text-sm transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'retail' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> B2C Retail Purchases ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 font-bold text-sm transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'custom' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className="w-4 h-4" /> B2B Custom Quotes ({customOrders.length})
          </button>
        </div>

        {/* Loading / Data States */}
        {activeTab === 'retail' ? (
          loading ? (
            <div className="text-center py-20 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm font-semibold font-sans">Loading your purchases history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-premium max-w-lg mx-auto space-y-6">
              <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">No Orders Placed Yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Looks like you haven't bought any products from the ZAXO scrubs inventory. Check out our catalog to customize scrubs with name and brand logo embroidery.
                </p>
              </div>
              <Link 
                href="/shop"
                className="inline-block px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Shop ZAXO catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const shipping = JSON.parse(order.shippingAddress);
                const items = JSON.parse(order.items);
                const isExpanded = expandedOrder === order.id;
                
                return (
                  <div 
                    key={order.id} 
                    className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden transition-all duration-200"
                  >
                    {/* Card Header Summary */}
                    <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 border-b border-slate-100">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date Placed</p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order Reference</p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5 truncate max-w-[100px]" title={order.id}>
                            {order.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Grand Total</p>
                          <p className="text-xs font-extrabold text-primary mt-0.5">₹{order.totalAmount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shipment Status</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 ${
                            order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status === 'DELIVERED' && <CheckCircle2 className="w-2.5 h-2.5" />}
                            {order.status === 'SHIPPED' && <Truck className="w-2.5 h-2.5" />}
                            {order.status === 'PENDING' && <Clock className="w-2.5 h-2.5" />}
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto justify-end border-t pt-3 md:border-t-0 md:pt-0">
                        <button
                          onClick={() => setSelectedPrintOrder(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-655 bg-white transition-all shadow-sm"
                          title="Download tax receipt"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-400" /> Print Receipt
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 border border-slate-200 hover:border-rose-350 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all flex items-center justify-center"
                          title="Remove Order from History"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="p-1.5 border border-slate-200 hover:border-slate-350 bg-white rounded-xl text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick summary of items */}
                    {!isExpanded && (
                      <div className="p-5 flex justify-between items-center text-xs text-slate-500 font-medium">
                        <p className="truncate max-w-[80%]">
                          {items.map((i: any) => `${i.product.name} (${i.variant.color}, Size ${i.variant.size}) x${i.quantity}`).join(', ')}
                        </p>
                        <button 
                          onClick={() => toggleExpand(order.id)}
                          className="text-primary hover:underline font-bold text-[11px] shrink-0"
                        >
                          View Details
                        </button>
                      </div>
                    )}

                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <div className="p-5 border-t border-slate-100 space-y-5 animate-in fade-in duration-200">
                        {/* Shipping info */}
                        <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shipping Destination</p>
                            <p className="font-bold text-slate-800 text-sm">{shipping.name}</p>
                            <p>{shipping.address}</p>
                            <p>{shipping.city} - {shipping.postalCode}, {shipping.state || 'India'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact Info & payment</p>
                            <p><span className="text-slate-400 font-medium">Phone:</span> <strong className="text-slate-700">{shipping.phone}</strong></p>
                            <p><span className="text-slate-400 font-medium">Email:</span> <strong className="text-slate-700">{shipping.email || user.email}</strong></p>
                            <p className="pt-1">
                              <span className="text-slate-400 font-medium">Payment Mode:</span>{' '}
                              <span className={`font-bold uppercase ${order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {order.paymentStatus}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Items table */}
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Items in Order</p>
                          <div className="divide-y divide-slate-100">
                            {items.map((item: any, idx: number) => {
                              const getPriceFallback = (name: string) => {
                                const n = name.toLowerCase();
                                if (n.includes('pants')) return 999;
                                if (n.includes('coat')) return 1299;
                                if (n.includes('gown')) return 899;
                                return 1599;
                              };
                              const unitPrice = item.product.discountPrice || item.product.basePrice || getPriceFallback(item.product.name);
                              const itemTotal = (unitPrice + (item.customization?.priceCharge || 0)) * item.quantity;
                              return (
                                <div key={idx} className="py-3 flex justify-between items-start text-xs">
                                  <div className="space-y-1">
                                    <h4 className="font-bold text-slate-800 text-sm">{item.product.name}</h4>
                                    <div className="flex gap-4 text-[10px] text-slate-500">
                                      <span>Color: <strong>{item.variant.color}</strong></span>
                                      <span>Size: <strong>{item.variant.size}</strong></span>
                                      <span>Qty: <strong>{item.quantity}</strong></span>
                                    </div>
                                    {item.customization && (
                                      <div className="p-2.5 bg-teal-50/25 border border-teal-100/50 rounded-lg text-[10px] text-slate-500 mt-1 max-w-lg space-y-1">
                                        {item.customization.nameText && (
                                          <p>• Name: <strong className="text-slate-700">"{item.customization.nameText}"</strong> ({item.customization.nameFont} Font, {item.customization.nameColor} Placement)</p>
                                        )}
                                        {item.customization.logoFile && <p>• Brand Logo Embroidery included</p>}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-extrabold text-slate-800">₹{itemTotal}</p>
                                    <p className="text-[9px] text-slate-400">₹{unitPrice + (item.customization?.priceCharge || 0)} each</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* B2B Custom Quotes List */
          loadingCustom ? (
            <div className="text-center py-20 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm font-semibold font-sans">Loading your custom uniform quotes...</p>
            </div>
          ) : customOrders.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-premium max-w-lg mx-auto space-y-6">
              <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">No Custom Quotes Yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Design bespoke, hospital-branded apparel using our interactive Uniform Customizer tool. Select colors, add logos, and upload custom measurement sheets.
                </p>
              </div>
              <Link 
                href="/customize"
                className="inline-block px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Open Custom Builder
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {customOrders.map((order) => {
                let measurementsObj: any = null;
                try {
                  if (order.measurements) {
                    measurementsObj = typeof order.measurements === 'string' 
                      ? JSON.parse(order.measurements) 
                      : order.measurements;
                  }
                } catch(e) {
                  console.error("Error parsing measurements:", e);
                }

                const isExpanded = expandedCustomOrder === order.id;

                return (
                  <div 
                    key={order.id} 
                    className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden transition-all duration-200"
                  >
                    {/* B2B Card Header */}
                    <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 border-b border-slate-100">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date Requested</p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quote Reference</p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5 truncate max-w-[100px]" title={order.id}>
                            {order.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Price</p>
                          <p className="text-xs font-extrabold text-primary mt-0.5">
                            {order.priceQuote ? `₹${order.priceQuote}` : 'Awaiting Quote'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quote Status</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 ${
                            order.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'QUOTED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status === 'APPROVED' && <CheckCircle2 className="w-2.5 h-2.5" />}
                            {order.status === 'QUOTED' && <ThumbsUp className="w-2.5 h-2.5" />}
                            {order.status === 'REJECTED' && <XCircle className="w-2.5 h-2.5" />}
                            {order.status === 'PENDING' && <Clock className="w-2.5 h-2.5" />}
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto justify-end border-t pt-3 md:border-t-0 md:pt-0">
                        {order.status === 'QUOTED' && (
                          <button
                            onClick={() => handleApproveCustomOrder(order.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve Quote
                          </button>
                        )}
                        {order.status !== 'APPROVED' && order.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleCancelCustomOrder(order.id)}
                            className="p-1.5 border border-slate-200 hover:border-rose-350 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all flex items-center justify-center"
                            title="Cancel Design Quote Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleExpandCustom(order.id)}
                          className="p-1.5 border border-slate-200 hover:border-slate-350 bg-white rounded-xl text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick description of custom builder request */}
                    {!isExpanded && (
                      <div className="p-5 flex justify-between items-center text-xs text-slate-500 font-medium">
                        <p className="truncate max-w-[80%] flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.hospitalName} • <strong>{order.productType} ({order.color})</strong> x{order.quantity} sets</span>
                        </p>
                        <button 
                          onClick={() => toggleExpandCustom(order.id)}
                          className="text-primary hover:underline font-bold text-[11px] shrink-0"
                        >
                          View Specs
                        </button>
                      </div>
                    )}

                    {/* Expanded Custom Order Details */}
                    {isExpanded && (
                      <div className="p-5 border-t border-slate-100 space-y-5 animate-in fade-in duration-200">
                        {/* Custom order information grid */}
                        <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hospital & Design Specifications</p>
                            <p className="font-bold text-slate-800 text-sm">{order.hospitalName}</p>
                            <p><span className="text-slate-400 font-medium">Apparel Template:</span> <strong className="text-slate-700">{order.productType}</strong></p>
                            <p><span className="text-slate-400 font-medium">Primary Color:</span> <strong className="text-slate-700">{order.color}</strong></p>
                            <p><span className="text-slate-400 font-medium">Order Quantity:</span> <strong className="text-slate-700">{order.quantity} sets (MOQ active)</strong></p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Branding & Customizations</p>
                            <p>
                              <span className="text-slate-400 font-medium">Embroidery Name:</span>{' '}
                              {order.customName ? (
                                <strong className="text-teal-700 font-serif">"{order.customName}"</strong>
                              ) : (
                                <span className="text-slate-400 italic">None requested</span>
                              )}
                            </p>
                            <div className="flex items-start gap-2 pt-1">
                              <span className="text-slate-400 font-medium shrink-0">Hospital Logo:</span>
                              {order.logoUrl ? (
                                <div className="space-y-1">
                                  <a href={order.logoUrl} target="_blank" rel="noreferrer" className="block w-12 h-12 rounded border border-slate-200 bg-white overflow-hidden hover:opacity-80 transition-opacity">
                                    <img src={order.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                  </a>
                                  <span className="text-[9px] text-slate-400 font-semibold block">Click to expand logo</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">None uploaded</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Sizing Breakdown Details */}
                        {measurementsObj && (
                          <div className="space-y-2 border-t border-slate-100 pt-4">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Ruler className="w-3.5 h-3.5 text-slate-400" /> Sizing & Measurement Sheet
                            </p>
                            
                            {measurementsObj.type === 'standard-mix' ? (
                              <div className="grid grid-cols-4 gap-4 p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl text-center">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Small (S)</p>
                                  <p className="text-sm font-extrabold text-slate-700 mt-0.5">{measurementsObj.sizes?.S || 0} pcs</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Medium (M)</p>
                                  <p className="text-sm font-extrabold text-slate-700 mt-0.5">{measurementsObj.sizes?.M || 0} pcs</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Large (L)</p>
                                  <p className="text-sm font-extrabold text-slate-700 mt-0.5">{measurementsObj.sizes?.L || 0} pcs</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">X-Large (XL)</p>
                                  <p className="text-sm font-extrabold text-slate-700 mt-0.5">{measurementsObj.sizes?.XL || 0} pcs</p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2 text-xs">
                                <p><span className="text-slate-400">Staff Member:</span> <strong className="text-slate-800">{measurementsObj.staffName || 'N/A'}</strong></p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600 mt-1">
                                  <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-bold">Chest (Inches)</p>
                                    <p className="font-semibold text-slate-800 mt-0.5">{measurementsObj.measurements?.chest || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-bold">Waist (Inches)</p>
                                    <p className="font-semibold text-slate-800 mt-0.5">{measurementsObj.measurements?.waist || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-bold">Hip (Inches)</p>
                                    <p className="font-semibold text-slate-800 mt-0.5">{measurementsObj.measurements?.hip || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-bold">Height</p>
                                    <p className="font-semibold text-slate-800 mt-0.5">{measurementsObj.measurements?.height || '-'}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Order status message alerts */}
                        <div className="border-t border-slate-100 pt-4 flex items-start gap-2 text-xs">
                          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div className="space-y-1 text-slate-500">
                            {order.status === 'PENDING' && (
                              <p>Our design team is reviewing your logo alignment and customized specifications. A custom price quote will be assigned here shortly.</p>
                            )}
                            {order.status === 'REVIEWED' && (
                              <p>Review complete. We are finalizing standard or bespoke pricing options for your clinic.</p>
                            )}
                            {order.status === 'QUOTED' && (
                              <div className="space-y-1">
                                <p className="text-slate-700 font-bold">A custom price quote of <span className="text-primary font-extrabold text-sm">₹{order.priceQuote}</span> has been set for this bulk configuration.</p>
                                <p>Click <strong>Approve Quote</strong> to confirm the order specs. Once approved, the ZAXO production and logistics desk will contact you to send a formal proforma tax invoice.</p>
                              </div>
                            )}
                            {order.status === 'APPROVED' && (
                              <div className="space-y-1">
                                <p className="text-emerald-750 font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Quote Approved! Total Value: ₹{order.priceQuote}
                                </p>
                                <p className="text-slate-650">The manufacturing request is now active. Our accounts representative will email you standard invoicing and payment link instructions shortly.</p>
                              </div>
                            )}
                            {order.status === 'REJECTED' && (
                              <p className="text-rose-600 font-semibold">This custom builder request has been cancelled or rejected.</p>
                            )}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

      </div>

      {/* Printable Invoice Container - only visible when printing */}
      {selectedPrintOrder && (
        <div id="printable-invoice" className="hidden print:block bg-white p-8 text-black text-xs max-w-2xl mx-auto font-sans leading-relaxed">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4 mb-6">
            <div>
              <img src="/images/logo.png" alt="ZAXO Clothing" className="h-10 w-auto object-contain mb-2" />
              <p className="text-[10px] text-slate-500 max-w-[200px]">
                446/1, Ist Floor, RvR Store, Athipalayam Road, Ganapathy, Coimbatore - 641006, Tamil Nadu
              </p>
              <p className="text-[10px] text-slate-500">Phone: +91 98940 12345</p>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold uppercase tracking-wider text-slate-800">Tax Invoice</h1>
              <p className="text-xs text-slate-500 mt-1">Invoice No: <strong>{selectedPrintOrder.id}</strong></p>
              <p className="text-xs text-slate-500">Date: {new Date(selectedPrintOrder.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">Bill To / Deliver To</h3>
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-sm text-slate-900">{JSON.parse(selectedPrintOrder.shippingAddress).name}</p>
              <p>{JSON.parse(selectedPrintOrder.shippingAddress).address}</p>
              <p>{JSON.parse(selectedPrintOrder.shippingAddress).city} - {JSON.parse(selectedPrintOrder.shippingAddress).postalCode}</p>
              <p>{JSON.parse(selectedPrintOrder.shippingAddress).state}</p>
              <p className="pt-1">Phone: {JSON.parse(selectedPrintOrder.shippingAddress).phone}</p>
              <p>Email: {JSON.parse(selectedPrintOrder.shippingAddress).email}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50 font-bold text-slate-700">
                  <th className="py-2 px-1">S.No</th>
                  <th className="py-2 px-1">Apparel Item & Specifications</th>
                  <th className="py-2 px-1 text-center">Size</th>
                  <th className="py-2 px-1 text-center">Color</th>
                  <th className="py-2 px-1 text-center">Qty</th>
                  <th className="py-2 px-1 text-right">Unit Price</th>
                  <th className="py-2 px-1 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {JSON.parse(selectedPrintOrder.items).map((item: any, idx: number) => {
                  const getPriceFallback = (name: string) => {
                    const n = name.toLowerCase();
                    if (n.includes('pants')) return 999;
                    if (n.includes('coat')) return 1299;
                    if (n.includes('gown')) return 899;
                    return 1599;
                  };
                  const unitPrice = item.product.discountPrice || item.product.basePrice || getPriceFallback(item.product.name);
                  const itemTotal = (unitPrice + (item.customization?.priceCharge || 0)) * item.quantity;
                  return (
                    <tr key={idx} className="text-slate-700">
                      <td className="py-2.5 px-1">{idx + 1}</td>
                      <td className="py-2.5 px-1">
                        <p className="font-bold text-slate-900">{item.product.name}</p>
                        {item.customization && (
                          <div className="text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                            {item.customization.nameText && (
                              <p>• Name: "{item.customization.nameText}" ({item.customization.nameFont} Font, {item.customization.nameColor} Thread)</p>
                            )}
                            {item.customization.logoFile && <p>• Brand Logo Embroidery included</p>}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-1 text-center font-semibold">{item.variant.size}</td>
                      <td className="py-2.5 px-1 text-center">{item.variant.color}</td>
                      <td className="py-2.5 px-1 text-center">{item.quantity}</td>
                      <td className="py-2.5 px-1 text-right">₹{unitPrice + (item.customization?.priceCharge || 0)}</td>
                      <td className="py-2.5 px-1 text-right font-bold text-slate-900">₹{itemTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals */}
          <div className="grid grid-cols-2 gap-4 items-start border-t pt-4">
            <div className="text-[10px] text-slate-500 space-y-1">
              <p><strong>Payment Status:</strong> <span className="text-emerald-700 font-bold uppercase">{selectedPrintOrder.paymentStatus}</span></p>
              <p><strong>Payment Method:</strong> UPI or Card</p>
              <p className="pt-2 font-medium">Terms & Conditions:</p>
              <p>1. Goods once sold are not returnable unless defective.</p>
              <p>2. Customized embroidery products cannot be exchanged.</p>
            </div>
            <div className="space-y-1.5 text-xs text-right font-medium text-slate-600">
              <div className="flex justify-between max-w-[200px] ml-auto">
                <span>Subtotal:</span>
                <span>₹{selectedPrintOrder.totalAmount}</span>
              </div>
              <div className="flex justify-between max-w-[200px] ml-auto">
                <span>Shipping:</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between max-w-[200px] ml-auto border-t pt-2 text-sm font-extrabold text-slate-900">
                <span>Total Amount:</span>
                <span>₹{selectedPrintOrder.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Invoice Footer message */}
          <div className="text-center mt-12 border-t pt-4 text-xs text-slate-400 font-medium italic">
            Thank you for choosing ZAXO Clothing!
          </div>
        </div>
      )}
    </>
  );
}
