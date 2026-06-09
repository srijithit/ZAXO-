'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Shield, 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Sparkles, 
  RefreshCw, 
  Check, 
  ArrowRight, 
  X, 
  Phone, 
  Mail, 
  Award, 
  Download, 
  Printer, 
  Building, 
  FileImage, 
  PlusSquare, 
  Trash2, 
  Edit, 
  FileCheck,
  Lock
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useApp();
  
  // Print Invoice State
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

  // Dashboard Tabs: 'overview', 'orders', 'leads', 'customs', 'products'
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [customs, setCustoms] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active pricing quote state
  const [quoteInput, setQuoteInput] = useState<Record<string, string>>({});

  // Product Form States (Add/Edit Modal)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('V-Neck Scrubs');
  const [formGender, setFormGender] = useState('Unisex');
  const [formBasePrice, setFormBasePrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formFabric, setFormFabric] = useState('72% Polyester, 21% Rayon, 7% Spandex (4-Way Stretch)');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);

  const categories = [
    'V-Neck Scrubs',
    'Round Neck Scrubs',
    'Overlap Neck Scrubs',
    'Mandarin Collar Scrubs',
    'Full Sleeve Scrubs',
    'Basic Pants',
    'Cargo Pants',
    'Jogger Pants',
    'Flare Pants',
    'Doctor Coats',
    'Surgical Gowns'
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const ordersRes = await fetch('/api/orders');
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      const leadsRes = await fetch('/api/bulk-leads');
      const leadsData = await leadsRes.json();
      setLeads(leadsData);

      const customsRes = await fetch('/api/custom-orders');
      const customsData = await customsRes.json();
      setCustoms(customsData);

      const productsRes = await fetch('/api/products');
      const productsData = await productsRes.json();
      setProducts(productsData);

    } catch (err) {
      console.error('Failed to fetch admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Retail Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      if (!res.ok) throw new Error('Update failed');
      
      fetchData();
    } catch (err) {
      alert('Error updating order status');
    }
  };

  // Update Bulk Lead Status
  const handleUpdateLeadStatus = async (leadId: string, status: string) => {
    try {
      const res = await fetch('/api/bulk-leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status })
      });
      if (!res.ok) throw new Error('Update failed');
      
      fetchData();
    } catch (err) {
      alert('Error updating lead status');
    }
  };

  // Submit Price Quote for Custom B2B order
  const handleSendCustomQuote = async (customOrderId: string) => {
    const quoteVal = quoteInput[customOrderId];
    if (!quoteVal) {
      alert('Please enter a quote price amount first.');
      return;
    }

    try {
      const res = await fetch('/api/custom-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customOrderId, 
          status: 'QUOTED', 
          priceQuote: quoteVal 
        })
      });
      if (!res.ok) throw new Error('Quote submission failed');
      
      alert('Quote price sent successfully to the hospital group!');
      setQuoteInput(prev => ({ ...prev, [customOrderId]: '' }));
      fetchData();
    } catch (err) {
      alert('Error submitting price quote');
    }
  };

  // Update Custom Order Status directly
  const handleUpdateCustomStatus = async (customOrderId: string, status: string) => {
    try {
      const res = await fetch('/api/custom-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customOrderId, status })
      });
      if (!res.ok) throw new Error('Update failed');
      
      fetchData();
    } catch (err) {
      alert('Error updating custom order status');
    }
  };

  // Open Form to Add New Product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('V-Neck Scrubs');
    setFormGender('Unisex');
    setFormBasePrice('');
    setFormDiscountPrice('');
    setFormFabric('72% Polyester, 21% Rayon, 7% Spandex (4-Way Stretch)');
    setFormDescription('');
    setFormImage('');
    setFormFeatured(false);
    setShowProductModal(true);
  };

  // Open Form to Edit Existing Product
  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormGender(prod.gender);
    setFormBasePrice(String(prod.basePrice));
    setFormDiscountPrice(prod.discountPrice ? String(prod.discountPrice) : '');
    setFormFabric(prod.fabric);
    setFormDescription(prod.description);
    
    // Parse images array
    try {
      const parsedImages = JSON.parse(prod.images);
      setFormImage(parsedImages[0] || '');
    } catch (e) {
      setFormImage(prod.images || '');
    }
    
    setFormFeatured(prod.featured);
    setShowProductModal(true);
  };

  // Handle Product Create / Update Form Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      id: editingProduct?.id,
      name: formName,
      description: formDescription,
      category: formCategory,
      gender: formGender,
      basePrice: parseFloat(formBasePrice),
      discountPrice: formDiscountPrice ? parseFloat(formDiscountPrice) : null,
      fabric: formFabric,
      images: formImage || '/images/scrubs-placeholder.jpg',
      featured: formFeatured
    };

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully with automatic size & color variants!');
      setShowProductModal(false);
      setEditingProduct(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this product? All corresponding size/color variants and reviews will also be removed.')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      alert('Product deleted successfully');
      fetchData();
    } catch (err) {
      alert('Error deleting product');
    }
  };

  // Delete Order Log
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order log? This action is permanent.')) return;
    try {
      const res = await fetch(`/api/orders?orderId=${orderId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      alert('Order log deleted successfully');
      fetchData();
    } catch (err) {
      alert('Error deleting order log');
    }
  };

  // Delete B2B Sales Lead
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this sales lead? This action is permanent.')) return;
    try {
      const res = await fetch(`/api/bulk-leads?leadId=${leadId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      alert('Sales lead deleted successfully');
      fetchData();
    } catch (err) {
      alert('Error deleting sales lead');
    }
  };

  // Delete B2B Bespoke Custom Quote Request
  const handleDeleteQuote = async (customOrderId: string) => {
    if (!confirm('Are you sure you want to delete this custom quote request? This action is permanent.')) return;
    try {
      const res = await fetch(`/api/custom-orders?customOrderId=${customOrderId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      alert('Quote request deleted successfully');
      fetchData();
    } catch (err) {
      alert('Error deleting custom quote request');
    }
  };

  // Handle local image file load as base64 representation
  const handleLocalImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculations for overview metrics
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;
  const newLeadsCount = leads.filter(l => l.status === 'NEW').length;
  const pendingCustomsCount = customs.filter(c => c.status === 'PENDING').length;

  const { isAuthenticating } = useApp();

  if (isAuthenticating) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
        <p className="text-sm font-semibold font-sans">Verifying security credentials...</p>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-slate-100 p-8 rounded-2xl shadow-premium animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto text-rose-500">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Access Denied</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              This workspace is restricted to ZAXO administrators. Please sign in with an administrator account to view order logs and manage inventory.
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
              Sign In as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
        <p className="text-sm font-semibold font-sans">Loading Admin CRM Workspace...</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:hidden">
      
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 p-6 rounded-2xl shadow-premium gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-500" /> ZAXO Admin Portal
          </h1>
          <p className="text-xs text-slate-500 font-semibold font-sans">
            Logged in as Admin: {user?.name || 'Administrator'} (admin@zaxo.com)
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-primary text-slate-700 hover:text-primary rounded-xl text-xs font-semibold bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Workspace
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-xs font-bold text-center border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
            activeTab === 'overview' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 text-xs font-bold text-center border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
            activeTab === 'orders' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> B2C Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-3 text-xs font-bold text-center border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
            activeTab === 'leads' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> B2B Leads ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab('customs')}
          className={`px-4 py-3 text-xs font-bold text-center border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
            activeTab === 'customs' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" /> B2B Quotes ({customs.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 text-xs font-bold text-center border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
            activeTab === 'products' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" /> Manage Products ({products.length})
        </button>
      </div>

      {/* Tab Contents: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-205">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium">
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Revenue (PAID)</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-2">₹{totalRevenue}</p>
              <div className="text-[10px] text-emerald-600 mt-1 font-semibold">Simulated sales receipts</div>
            </div>
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium">
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Pending Retail Orders</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-2">{pendingOrdersCount}</p>
              <div className="text-[10px] text-slate-500 mt-1">Requires packaging & shipping</div>
            </div>
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium">
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">New Bulk Leads (B2B)</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-2">{newLeadsCount}</p>
              <div className="text-[10px] text-slate-500 mt-1">Hospital sales pipeline</div>
            </div>
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium">
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Pending Custom Uniform Quotes</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-2">{pendingCustomsCount}</p>
              <div className="text-[10px] text-slate-500 mt-1">Requires price quoting</div>
            </div>
          </div>

          {/* Quick Pipeline Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* New Leads List */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm border-b pb-2">Active B2B Sales Leads</h3>
              {leads.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No sales leads recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {leads.slice(0, 4).map((lead) => (
                    <div key={lead.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{lead.hospitalName}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Quantity: {lead.quantity} sets ({lead.productType})</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        lead.status === 'NEW' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Custom Quotes List */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm border-b pb-2">Pending B2B Bespoke Quotes</h3>
              {customs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No custom orders logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {customs.slice(0, 4).map((cust) => (
                    <div key={cust.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{cust.hospitalName}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{cust.productType} ({cust.color}) - Qty: {cust.quantity}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        cust.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {cust.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Tab Contents: Retail Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4 animate-in fade-in duration-200">
          <h2 className="font-extrabold text-slate-800 text-base border-b pb-2">B2C Retail Orders Log</h2>
          
          {orders.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No retail orders logged in SQLite.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[9px]">
                    <th className="p-3 border-b">Order Reference</th>
                    <th className="p-3 border-b">Recipient Details</th>
                    <th className="p-3 border-b">Total Items</th>
                    <th className="p-3 border-b">Amount</th>
                    <th className="p-3 border-b">Payment</th>
                    <th className="p-3 border-b">Status</th>
                    <th className="p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-600 font-medium">
                  {orders.map((order) => {
                    const shipping = JSON.parse(order.shippingAddress);
                    const items = JSON.parse(order.items);
                    
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <p className="font-bold text-slate-800 truncate max-w-[80px]">{order.id}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{shipping.name}</p>
                          <p className="text-[10px] text-slate-400">{shipping.phone} | {shipping.city}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold">{items.length} items</p>
                          <p className="text-[9px] text-slate-400 truncate max-w-[150px]">
                            {items.map((i: any) => `${i.product.name} (x${i.quantity})`).join(', ')}
                          </p>
                        </td>
                        <td className="p-3 font-bold text-slate-800">₹{order.totalAmount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3 flex gap-2">
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPED')}
                              className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-[10px] font-bold"
                            >
                              Ship
                            </button>
                          )}
                          {order.status === 'SHIPPED' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                              className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold"
                            >
                              Deliver
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPrintOrder(order)}
                            className="p-1 border hover:border-slate-350 rounded text-slate-400 hover:text-slate-600 no-print"
                            title="Print Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1 border hover:border-rose-350 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 no-print transition-all"
                            title="Delete Order Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: B2B Leads */}
      {activeTab === 'leads' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4 animate-in fade-in duration-200">
          <h2 className="font-extrabold text-slate-800 text-base border-b pb-2">B2B Hospital Sales Leads</h2>

          {leads.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No procurement inquiries logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[9px]">
                    <th className="p-3 border-b">Date</th>
                    <th className="p-3 border-b">Hospital Details</th>
                    <th className="p-3 border-b">Contact Info</th>
                    <th className="p-3 border-b">Quantity / Style</th>
                    <th className="p-3 border-b">Logo & Notes</th>
                    <th className="p-3 border-b">Lead Status</th>
                    <th className="p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-600 font-medium">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-400 text-[10px]">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {lead.hospitalName}
                        </p>
                      </td>
                      <td className="p-3 space-y-0.5">
                        <p className="font-bold text-slate-800">{lead.contactName}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-extrabold text-slate-800">{lead.quantity} units</p>
                        <p className="text-[10px] text-slate-400">{lead.productType}</p>
                      </td>
                      <td className="p-3 space-y-1">
                        {lead.logoUrl && (
                          <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 text-primary text-[9px] px-1.5 py-0.5 rounded font-bold">
                            <FileImage className="w-3 h-3" /> Logo Attached
                          </span>
                        )}
                        {lead.notes ? (
                          <p className="text-[10px] text-slate-500 italic max-w-[180px] line-clamp-2">"{lead.notes}"</p>
                        ) : (
                          <span className="text-[10px] text-slate-400">No specs added</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          lead.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                          lead.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'CLOSED_WON' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        {lead.status === 'NEW' && (
                          <button
                            onClick={() => handleUpdateLeadStatus(lead.id, 'CONTACTED')}
                            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-[10px] font-bold"
                          >
                            Contact
                          </button>
                        )}
                        {lead.status === 'CONTACTED' && (
                          <button
                            onClick={() => handleUpdateLeadStatus(lead.id, 'CLOSED_WON')}
                            className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold"
                          >
                            Convert
                          </button>
                        )}
                        {lead.logoUrl && (
                          <a
                            href={lead.logoUrl}
                            download="hospital_logo.png"
                            className="p-1 border hover:border-slate-300 rounded text-slate-400 hover:text-slate-600"
                            title="Download Logo Image File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1 border hover:border-rose-350 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-all"
                          title="Delete Lead Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: B2B Custom Quotes */}
      {activeTab === 'customs' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4 animate-in fade-in duration-200">
          <h2 className="font-extrabold text-slate-800 text-base border-b pb-2">B2B Bespoke Custom Uniform Quotes</h2>

          {customs.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No custom orders requested yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[9px]">
                    <th className="p-3 border-b">Hospital Details</th>
                    <th className="p-3 border-b">Custom Config</th>
                    <th className="p-3 border-b">Sizing roster details</th>
                    <th className="p-3 border-b">Quote Amount</th>
                    <th className="p-3 border-b">Status</th>
                    <th className="p-3 border-b">Add Pricing Quote</th>
                    <th className="p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-600 font-medium">
                  {customs.map((cust) => {
                    const parsedMeasurements = cust.measurements ? JSON.parse(cust.measurements) : null;
                    
                    return (
                      <tr key={cust.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <p className="font-bold text-slate-800 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400" /> {cust.hospitalName}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Contact: {cust.user?.name || 'Guest Hospital Admin'}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{cust.productType} ({cust.color})</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Bulk Quantity: {cust.quantity} sets</p>
                          {cust.customName && (
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Text: "{cust.customName}"</p>
                          )}
                        </td>
                        <td className="p-3 max-w-[200px]">
                          {parsedMeasurements ? (
                            parsedMeasurements.type === 'standard-mix' ? (
                              <div className="text-[10px] text-slate-500 grid grid-cols-2 gap-x-2">
                                <span>S: {parsedMeasurements.sizes.S} sets</span>
                                <span>M: {parsedMeasurements.sizes.M} sets</span>
                                <span>L: {parsedMeasurements.sizes.L} sets</span>
                                <span>XL: {parsedMeasurements.sizes.XL} sets</span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-500 space-y-0.5">
                                <p className="font-bold text-slate-700">Staff: {parsedMeasurements.staffName}</p>
                                <p>Chest: {parsedMeasurements.measurements.chest}" | Waist: {parsedMeasurements.measurements.waist}"</p>
                                <p>Hip: {parsedMeasurements.measurements.hip}" | Height: {parsedMeasurements.measurements.height}</p>
                              </div>
                            )
                          ) : (
                            <span className="text-[10px] text-slate-400">No roster details</span>
                          )}
                        </td>
                        <td className="p-3 font-extrabold text-slate-800">
                          {cust.priceQuote ? `₹${cust.priceQuote}` : <span className="text-slate-400">Not Quoted</span>}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            cust.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            cust.status === 'QUOTED' ? 'bg-blue-100 text-blue-800' :
                            cust.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {cust.status}
                          </span>
                        </td>
                        
                        {/* Quote Input */}
                        <td className="p-3">
                          {cust.status === 'PENDING' && (
                            <div className="flex items-center gap-1.5 max-w-[120px]">
                              <span className="text-xs text-slate-400">₹</span>
                              <input
                                type="number"
                                placeholder="18500"
                                value={quoteInput[cust.id] || ''}
                                onChange={(e) => setQuoteInput(prev => ({ ...prev, [cust.id]: e.target.value }))}
                                className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                              />
                            </div>
                          )}
                        </td>

                        <td className="p-3 flex gap-2">
                          {cust.status === 'PENDING' && (
                            <button
                              onClick={() => handleSendCustomQuote(cust.id)}
                              className="px-2 py-1 bg-primary hover:bg-primary-hover text-white rounded text-[10px] font-bold"
                            >
                              Send Quote
                            </button>
                          )}
                          {cust.status === 'QUOTED' && (
                            <button
                              onClick={() => handleUpdateCustomStatus(cust.id, 'APPROVED')}
                              className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold"
                            >
                              Approve
                            </button>
                          )}
                          {cust.logoUrl && (
                            <a
                              href={cust.logoUrl}
                              download="custom_logo.png"
                              className="p-1 border hover:border-slate-300 rounded text-slate-400 hover:text-slate-600"
                              title="Download Brand Logo File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteQuote(cust.id)}
                            className="p-1 border hover:border-rose-350 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-all"
                            title="Delete Quote Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: Product Inventory Management (CRUD) */}
      {activeTab === 'products' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="font-extrabold text-slate-800 text-base">Product Inventory Management</h2>
            <button
              onClick={handleOpenAddProduct}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <PlusSquare className="w-4.5 h-4.5" /> Add New Product
            </button>
          </div>

          {products.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No products found in database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[9px]">
                    <th className="p-3 border-b">Product Info</th>
                    <th className="p-3 border-b">Category</th>
                    <th className="p-3 border-b">Gender</th>
                    <th className="p-3 border-b">Pricing</th>
                    <th className="p-3 border-b">Featured</th>
                    <th className="p-3 border-b">Fabric Specifications</th>
                    <th className="p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-600 font-medium">
                  {products.map((prod) => {
                    const hasDiscount = !!prod.discountPrice;
                    
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{prod.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Slug: {prod.slug}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{prod.category}</td>
                        <td className="p-3 text-slate-600">{prod.gender}</td>
                        <td className="p-3">
                          {hasDiscount ? (
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-slate-800">₹{prod.discountPrice}</p>
                              <p className="text-[9px] text-slate-400 line-through">₹{prod.basePrice}</p>
                            </div>
                          ) : (
                            <p className="font-extrabold text-slate-800">₹{prod.basePrice}</p>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            prod.featured ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {prod.featured ? 'Featured' : 'Standard'}
                          </span>
                        </td>
                        <td className="p-3 text-[10px] text-slate-500 max-w-[180px] truncate" title={prod.fabric}>
                          {prod.fabric}
                        </td>
                        <td className="p-3 flex gap-2 pt-4">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded text-slate-500 hover:text-primary transition-all"
                            title="Edit Product Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 border border-slate-200 hover:border-rose-350 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-all"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add/Edit Product Modal Dialog Overlay */}
          {showProductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-premium overflow-hidden my-8">
                
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-primary to-primary-dark p-5 text-white flex justify-between items-center">
                  <h3 className="text-lg font-bold tracking-tight">
                    {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Apparel Product'}
                  </h3>
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="text-white/80 hover:text-white font-bold"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleProductSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="E.g. Technical V-Neck Scrub Set"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category *</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gender Focus *</label>
                      <select
                        value={formGender}
                        onChange={(e) => setFormGender(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="Unisex">Unisex</option>
                        <option value="Men">Men Only</option>
                        <option value="Women">Women Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Base Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={formBasePrice}
                        onChange={(e) => setFormBasePrice(e.target.value)}
                        placeholder="1899"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Discount Price (₹) (Optional)</label>
                      <input
                        type="number"
                        value={formDiscountPrice}
                        onChange={(e) => setFormDiscountPrice(e.target.value)}
                        placeholder="1599"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fabric Blend</label>
                    <input
                      type="text"
                      value={formFabric}
                      onChange={(e) => setFormFabric(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Provide full description of fabric stretch, pockets count, and detailing..."
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>

                  {/* Image Selector */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Product Image Upload</label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* File Selector */}
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold mb-1">Upload Local File</span>
                        <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs cursor-pointer hover:bg-slate-100 text-slate-600 font-bold bg-white">
                          <FileImage className="w-4 h-4 text-slate-400" />
                          <span>Choose Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLocalImageSelect}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Manual text URL option */}
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold mb-1">Or Paste Image URL</span>
                        <input
                          type="text"
                          value={formImage.startsWith('data:image') ? '' : formImage}
                          onChange={(e) => setFormImage(e.target.value)}
                          placeholder="https://imgur.com/image.jpg"
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {formImage && (
                      <div className="flex items-center space-x-2 pt-1.5">
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Image Registered Successfully
                        </span>
                        {formImage.startsWith('data:image') && (
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">Base64 file</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Featured checkbox */}
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="rounded border-slate-350 text-primary focus:ring-primary w-4 h-4"
                    />
                    <label htmlFor="featured" className="text-xs font-semibold text-slate-700 select-none cursor-pointer">
                      Mark as Featured Product (Showcase on Homepage)
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
                    >
                      {loading ? 'Saving Product...' : editingProduct ? 'Save Updates' : 'Publish Product'}
                    </button>
                  </div>

                </form>

              </div>
            </div>
          )}

        </div>
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
