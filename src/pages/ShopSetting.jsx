import React, { useEffect, useState, useCallback } from 'react';
import {
    Store, Truck, Save, Loader2, Trash2, Plus, X,
    CreditCard, Landmark, Globe, Phone, Mail, Edit3,
    Coins, MessageCircle, MapPin, RefreshCw, Menu
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const LIMITS = {
    SHOP_NAME: 100, EMAIL: 100, PHONE: 10, ADDRESS: 500,
    SOCIAL_URL: 255, PROVIDER_NAME: 100, BANK_NAME: 100,
    ACCOUNT_NAME: 100, ACCOUNT_NUMBER: 15
};

const ShopSetting = () => {
    const [formData, setFormData] = useState({
        shop_name: '', address: '', phone: '', email: '',
        hero_description: '', delivery_fee: 0, min_free_shipping: 0,
        facebook_url: '', instagram_url: '', line_url: ''
    });
    const [providers, setProviders] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [newProvider, setNewProvider] = useState('');
    const [newPayment, setNewPayment] = useState({ bank_name: '', account_name: '', account_number: '' });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [settingsRes, provsRes, paymentsRes] = await Promise.all([
                axiosInstance.get(API_ENDPOINTS.ADMIN.SHOP_SETTINGS),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/providers`),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments`)
            ]);

            if (settingsRes.success) {
                const s = settingsRes.data;
                const clean = (v) => (v === "EMPTY" || !v ? "" : v);
                setFormData({
                    shop_name: clean(s.shop_name),
                    address: clean(s.address),
                    phone: clean(s.phone),
                    email: clean(s.email),
                    hero_description: clean(s.hero_description),
                    delivery_fee: Number(s.delivery_fee || 0),
                    min_free_shipping: Number(s.min_free_shipping || 0),
                    facebook_url: clean(s.facebook_url),
                    instagram_url: clean(s.instagram_url),
                    line_url: clean(s.line_url)
                });
            }
            if (provsRes.success) setProviders(provsRes.data || []);
            if (paymentsRes.success) setPaymentMethods(paymentsRes.data || []);
        } catch (err) {
            toast.error("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleUpdate = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        const loadToast = toast.loading("กำลังบันทึก...");
        try {
            const res = await axiosInstance.put(API_ENDPOINTS.ADMIN.SHOP_SETTINGS, formData);
            if (res.success) {
                toast.success("บันทึกข้อมูลเรียบร้อย", { id: loadToast });
                setActiveModal(null);
                fetchData();
            }
        } catch (err) { toast.error("บันทึกล้มเหลว", { id: loadToast }); }
        finally { setIsSaving(false); }
    };

    const handleAddPayment = async () => {
        if (!newPayment.bank_name || !newPayment.account_name || !newPayment.account_number) return toast.error("กรอกข้อมูลให้ครบถ้วน");
        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments`, newPayment);
            if (res.success) {
                setPaymentMethods(prev => [...prev, res.data]);
                setNewPayment({ bank_name: '', account_name: '', account_number: '' });
                toast.success("เพิ่มบัญชีธนาคารแล้ว");
                setActiveModal(null);
            }
        } catch (err) { toast.error("เพิ่มล้มเหลว"); }
    };

    const handleAddProvider = async () => {
        if (!newProvider) return toast.error("กรุณาระบุชื่อขนส่ง");
        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/providers`, { provider_name: newProvider });
            if (res.success) {
                setProviders(prev => [...prev, res.data]);
                setNewProvider('');
                toast.success("เพิ่มบริษัทขนส่งแล้ว");
                setActiveModal(null);
            }
        } catch (err) { toast.error("เพิ่มล้มเหลว"); }
    };

    const handleDelete = async (type, id) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e293b',
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก',
        });
        if (result.isConfirmed) {
            try {
                const url = type === 'provider' ? `${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/providers/${id}` : `${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments/${id}`;
                const res = await axiosInstance.delete(url);
                if (res.success) {
                    if (type === 'provider') setProviders(prev => prev.filter(i => i.provider_id !== id));
                    else setPaymentMethods(prev => prev.filter(i => i.method_id !== id));
                    toast.success("ลบเรียบร้อย");
                }
            } catch (err) { toast.error("ลบไม่สำเร็จ"); }
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-white text-slate-900">
            <Loader2 className="animate-spin" size={65} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-slate-900 overflow-x-hidden">
            <Toaster position="top-right" />
            <Sidebar 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                isMobileOpen={isSidebarOpen} 
                setIsMobileOpen={setIsSidebarOpen} 
                activePage="settings" 
            />

            <main className={`flex-1 p-4 md:p-8 lg:p-10 transition-all duration-300 ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[300px]'} w-full`}>
                
                {/* Mobile Menu Toggle & Header */}
                <div className="mb-6 md:mb-10 flex items-center gap-4">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-600"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex-1">
                        <Header title="Shop Settings" />
                    </div>
                </div>

                {/* Title Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
                    <div className="flex-1">
                        <p className="text-sm md:text-lg font-bold text-slate-400 mb-1 uppercase tracking-widest">ORGANIZATION SETTINGS</p>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">Settings</h1>
                    </div>
                    <button onClick={fetchData} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm hover:border-slate-900 transition-all group">
                        <RefreshCw size={24} className="text-slate-400 group-hover:text-slate-900" />
                    </button>
                </div>

                {/* KPI Section - Fixed Overlapping */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                    <StatCardWhite title="ชื่อร้านค้า" value={formData.shop_name} icon={<Globe size={24} />} color="#4318ff" />
                    <StatCardWhite title="ค่าส่งเริ่มต้น" value={`฿${formData.delivery_fee}`} icon={<Truck size={24} />} color="#ea580c" />
                    <StatCardWhite title="ส่งฟรีขั้นต่ำ" value={`${formData.min_free_shipping} ชิ้น`} icon={<Coins size={24} />} color="#10b981" />
                    <StatCardWhite title="ช่องทางชำระ" value={`${paymentMethods.length} บัญชี`} icon={<Landmark size={24} />} color="#4318ff" />
                </div>

                {/* Row 1: Contact / Social / Logistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
                    {/* Contact Card */}
                    <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50/50 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center border border-blue-100"><Store size={22} md:size={26} /></div>
                            <button onClick={() => setActiveModal('general')} className="p-2 md:p-3 bg-white text-slate-400 border border-slate-100 rounded-xl hover:text-blue-600 transition-all shadow-sm"><Edit3 size={18} /></button>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-slate-900 uppercase tracking-tight">Contact</h2>
                        <div className="space-y-3 md:space-y-4 font-bold text-slate-600 text-sm md:text-base">
                            <p className="flex items-center gap-3 truncate"><Phone size={18} className="text-slate-300 shrink-0"/> {formData.phone || '-'}</p>
                            <p className="flex items-center gap-3 truncate"><Mail size={18} className="text-slate-300 shrink-0"/> {formData.email || '-'}</p>
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-slate-300 mt-1 shrink-0" />
                                <p className="text-slate-400 font-medium leading-relaxed line-clamp-3">{formData.address || 'ยังไม่ระบุที่อยู่'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Socials Card */}
                    <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50/50 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center border border-emerald-100"><MessageCircle size={22} md:size={26} /></div>
                            <button onClick={() => setActiveModal('social')} className="p-2 md:p-3 bg-white text-slate-400 border border-slate-100 rounded-xl hover:text-emerald-600 transition-all shadow-sm"><Edit3 size={18} /></button>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-slate-900 uppercase tracking-tight">Socials</h2>
                        <div className="space-y-3 md:space-y-4 font-bold text-slate-600 text-sm md:text-base">
                            <p className="truncate"><span className="text-slate-300 mr-2">FB:</span> {formData.facebook_url || '-'}</p>
                            <p className="truncate"><span className="text-slate-300 mr-2">IG:</span> {formData.instagram_url || '-'}</p>
                            <p className="truncate"><span className="text-slate-300 mr-2">LINE:</span> {formData.line_url || '-'}</p>
                        </div>
                    </div>

                    {/* Logistics Card */}
                    <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50/50 flex flex-col md:col-span-2 lg:col-span-1">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-50 text-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center border border-orange-100"><Truck size={22} md:size={26} /></div>
                            <button onClick={() => setActiveModal('providers')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] md:text-xs font-black uppercase hover:bg-black transition-all shadow-lg">Add New</button>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-slate-900 uppercase tracking-tight">Logistics</h2>
                        <div className="space-y-2 overflow-y-auto max-h-40 pr-2 custom-scrollbar">
                            {providers.map(p => (
                                <div key={p.provider_id} className="flex justify-between items-center p-3 md:p-4 bg-slate-50 rounded-xl border border-white">
                                    <span className="text-xs md:text-sm font-black text-slate-700 uppercase tracking-wide truncate pr-2">{p.provider_name}</span>
                                    <button onClick={() => handleDelete('provider', p.provider_id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors shrink-0"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 2: Shipping Rates & Bank Accounts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* Shipping Rates */}
                    <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50/50">
                        <div className="flex justify-between items-center mb-8 md:mb-10">
                            <h2 className="text-xl md:text-3xl font-black text-slate-900 flex items-center gap-3 md:gap-4"><Coins size={28} md:size={32} className="text-emerald-500" /> Shipping</h2>
                            <button onClick={() => setActiveModal('shipping_cost')} className="p-2 md:p-3 bg-white text-slate-400 border border-slate-100 rounded-xl hover:text-emerald-600 transition-all shadow-sm"><Edit3 size={18} /></button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <div className="p-6 md:p-8 bg-slate-50 rounded-[25px] md:rounded-[35px] text-center border border-white">
                                <p className="text-[10px] md:text-xs text-slate-400 font-black mb-2 uppercase tracking-widest">Base Fee</p>
                                <p className="text-3xl md:text-5xl font-black text-slate-900 italic tracking-tight truncate">฿{formData.delivery_fee}</p>
                            </div>
                            <div className="p-6 md:p-8 bg-slate-50 rounded-[25px] md:rounded-[35px] text-center border border-white">
                                <p className="text-[10px] md:text-xs text-slate-400 font-black mb-2 uppercase tracking-widest">Free From</p>
                                <p className="text-3xl md:text-5xl font-black text-slate-900 italic tracking-tight truncate">
                                    {formData.min_free_shipping}
                                    <span className="text-sm md:text-lg ml-1 md:ml-2 font-bold not-italic">Qty</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bank Accounts */}
                    <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50/50">
                        <div className="flex justify-between items-center mb-8 md:mb-10">
                            <h2 className="text-xl md:text-3xl font-black text-slate-900 flex items-center gap-3 md:gap-4"><Landmark size={28} md:size={32} className="text-blue-600" /> Bank</h2>
                            <button onClick={() => setActiveModal('payments')} className="px-4 py-2 md:px-6 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg">New Account</button>
                        </div>
                        <div className="space-y-3 md:space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {paymentMethods.map(m => (
                                <div key={m.method_id} className="flex justify-between items-center p-4 md:p-6 bg-white rounded-[20px] md:rounded-[30px] border-2 border-slate-50 transition-all hover:border-blue-100">
                                    <div className="flex items-center gap-4 md:gap-6 min-w-0">
                                        <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 shrink-0"><CreditCard size={20} md:size={24}/></div>
                                        <div className="min-w-0">
                                            <div className="font-black text-base md:text-lg text-slate-900 uppercase tracking-tight truncate">{m.bank_name}</div>
                                            <div className="text-xs md:text-sm font-bold text-orange-400 truncate">{m.account_name}</div>
                                            <div className="text-sm md:text-md font-black text-slate-400 mt-1 tracking-widest truncate">{m.account_number}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete('payment', m.method_id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors shrink-0"><Trash2 size={20} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* --- Modals - Fully Responsive Optimized --- */}
            {activeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 bg-slate-900/40 backdrop-blur-md" onClick={() => setActiveModal(null)}>
                    <div className="bg-white w-full max-w-xl rounded-[30px] md:rounded-[50px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                        <div className="p-6 md:p-10">
                            <div className="flex justify-between items-center mb-6 md:mb-10">
                                <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Edit Settings</h2>
                                <button onClick={() => setActiveModal(null)} className="p-2 md:p-4 bg-slate-50 hover:bg-slate-100 rounded-xl md:rounded-2xl transition-all text-slate-400"><X size={20}/></button>
                            </div>

                            {/* Forms in Modals are now stacked for mobile */}
                            <div className="max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
                                {activeModal === 'general' && (
                                    <form onSubmit={handleUpdate} className="space-y-4 md:space-y-6">
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Shop Name</label><input className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg focus:ring-2 focus:ring-blue-100" value={formData.shop_name} onChange={e => setFormData({...formData, shop_name: e.target.value})} /></div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Email</label><input className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                                            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Phone</label><input className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                                        </div>
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Address</label><textarea className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg h-24 md:h-32" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                                        <button type="submit" className="w-full py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl md:rounded-[30px] font-black text-lg md:text-xl shadow-xl transition-all">Save Changes</button>
                                    </form>
                                )}

                                {activeModal === 'payments' && (
                                    <div className="space-y-4 md:space-y-6">
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Bank Name</label><input className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" placeholder="เช่น กสิกรไทย" value={newPayment.bank_name} onChange={e => setNewPayment({...newPayment, bank_name: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Account Name</label><input className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" placeholder="ชื่อ-นามสกุล" value={newPayment.account_name} onChange={e => setNewPayment({...newPayment, account_name: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Account No.</label><input className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" placeholder="เลขบัญชี" value={newPayment.account_number} onChange={e => setNewPayment({...newPayment, account_number: e.target.value.replace(/\D/g, '')})} /></div>
                                        <button onClick={handleAddPayment} className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-[30px] font-black text-lg md:text-xl shadow-xl transition-all">Confirm Add</button>
                                    </div>
                                )}

                                {activeModal === 'providers' && (
                                    <div className="space-y-4 md:space-y-6">
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Provider Name</label><input className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" placeholder="เช่น Kerry, Flash" value={newProvider} onChange={e => setNewProvider(e.target.value)} /></div>
                                        <button onClick={handleAddProvider} className="w-full py-4 md:py-5 bg-blue-600 text-white rounded-xl md:rounded-[30px] font-black text-lg md:text-xl shadow-xl transition-all">Confirm Add</button>
                                    </div>
                                )}

                                {activeModal === 'shipping_cost' && (
                                    <form onSubmit={handleUpdate} className="space-y-4 md:space-y-6">
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Delivery Fee (฿)</label><input type="number" className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" value={formData.delivery_fee} onChange={e => setFormData({...formData, delivery_fee: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Free From (Qty)</label><input type="number" className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" value={formData.min_free_shipping} onChange={e => setFormData({...formData, min_free_shipping: e.target.value})} /></div>
                                        <button type="submit" className="w-full py-4 md:py-5 bg-emerald-500 text-white rounded-xl md:rounded-[30px] font-black text-lg md:text-xl shadow-xl transition-all">Update Rates</button>
                                    </form>
                                )}

                                {activeModal === 'social' && (
                                    <form onSubmit={handleUpdate} className="space-y-4 md:space-y-6">
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Facebook</label><input className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" value={formData.facebook_url} onChange={e => setFormData({...formData, facebook_url: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Instagram</label><input className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" value={formData.instagram_url} onChange={e => setFormData({...formData, instagram_url: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Line Official</label><input className="w-full p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" value={formData.line_url} onChange={e => setFormData({...formData, line_url: e.target.value})} /></div>
                                        <button type="submit" className="w-full py-4 md:py-5 bg-emerald-500 text-white rounded-xl md:rounded-[30px] font-black text-lg md:text-xl shadow-xl transition-all">Save Socials</button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Stat Card Component (จุดที่แก้ไขเรื่องตัวหนังสือทับกัน) ---
const StatCardWhite = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 md:p-8 rounded-[25px] md:rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all hover:-translate-y-1 duration-300">
        <div className="flex-1 text-left min-w-0 pr-2 md:pr-4">
            <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-3 truncate">{title}</p>
            <h2 className="text-slate-900 text-2xl md:text-4xl font-black italic tracking-tight leading-none truncate">
                {value || '-'}
            </h2>
        </div>
        <div 
            style={{ background: `${color}08`, color: color }} 
            className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[22px] flex items-center justify-center border-2 md:border-4 border-white shadow-lg shadow-slate-50 shrink-0 ml-2"
        >
            {icon}
        </div>
    </div>
);

export default ShopSetting;