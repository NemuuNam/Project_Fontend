import React, { useEffect, useState, useCallback } from 'react';
import {
    Store, Truck, Save, Loader2, Trash2, Plus, X,
    CreditCard, Landmark, Phone, Mail, Edit3,
    Coins, MapPin, RefreshCw, Menu, Building2,
    Zap, ChevronRight, Globe, ShieldCheck, ArrowRight,
    Sparkles, Leaf, Cookie, Smile, Undo2, LayoutGrid, CheckCircle2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const ShopSetting = () => {
    // --- 🏗️ States ---
    const [formData, setFormData] = useState({
        shop_name: '', address: '', phone: '', email: '',
        hero_description: '', delivery_fee: 0, min_free_shipping: 0
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

    // --- 🛠️ Helper Logic ---
    const formatPhoneNumber = (value) => {
        const val = value.replace(/\D/g, '');
        if (val.length <= 3) return val;
        if (val.length <= 6) return `${val.slice(0, 3)}-${val.slice(3)}`;
        return `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6, 10)}`;
    };

    const formatAccountNumber = (value) => {
        const val = value.replace(/\D/g, '');
        if (val.length <= 3) return val;
        if (val.length <= 4) return `${val.slice(0, 3)}-${val.slice(3)}`;
        if (val.length <= 9) return `${val.slice(0, 3)}-${val.slice(3, 4)}-${val.slice(4)}`;
        return `${val.slice(0, 3)}-${val.slice(3, 4)}-${val.slice(4, 9)}-${val.slice(9, 10)}`;
    };

    const handleNumberInput = (field, value) => {
        const num = Math.max(0, parseInt(value) || 0);
        setFormData(prev => ({ ...prev, [field]: num }));
    };

    // --- 📦 Data Fetching ---
    const fetchData = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
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
                    phone: formatPhoneNumber(clean(s.phone)),
                    email: clean(s.email),
                    hero_description: clean(s.hero_description),
                    delivery_fee: Number(s.delivery_fee || 0),
                    min_free_shipping: Number(s.min_free_shipping || 0)
                });
            }
            if (provsRes.success) setProviders(provsRes.data || []);
            if (paymentsRes.success) setPaymentMethods(paymentsRes.data || []);
        } catch (err) { toast.error("โหลดข้อมูลล้มเหลว"); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- 💾 Action Handlers (Fixing ReferenceErrors) ---
    const handleUpdate = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        const loadToast = toast.loading("กำลังบันทึก...");
        try {
            const rawPhone = formData.phone.replace(/\D/g, '');
            const res = await axiosInstance.put(API_ENDPOINTS.ADMIN.SHOP_SETTINGS, { ...formData, phone: rawPhone });
            if (res.success) {
                toast.success("บันทึกสำเร็จ", { id: loadToast });
                setActiveModal(null);
                fetchData(true);
            }
        } catch (err) { toast.error("ล้มเหลว", { id: loadToast }); } finally { setIsSaving(false); }
    };

    const handleAddPayment = async () => {
        const { bank_name, account_name, account_number } = newPayment;
        const rawAcc = account_number.replace(/\D/g, '');
        if (!bank_name.trim() || !account_name.trim() || rawAcc.length < 10) return toast.error("ข้อมูลไม่ครบถ้วน");
        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments`, { bank_name, account_name, account_number: rawAcc });
            if (res.success) { toast.success("เพิ่มบัญชีสำเร็จ"); setNewPayment({ bank_name: '', account_name: '', account_number: '' }); setActiveModal(null); fetchData(true); }
        } catch (err) { toast.error("ล้มเหลว"); }
    };

    const handleAddProvider = async () => {
        if (!newProvider.trim()) return toast.error("ระบุบริษัทขนส่ง");
        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/providers`, { provider_name: newProvider.trim() });
            if (res.success) { toast.success("เพิ่มขนส่งสำเร็จ"); setNewProvider(''); setActiveModal(null); fetchData(true); }
        } catch (err) { toast.error("ล้มเหลว"); }
    };

    const handleDelete = async (type, id) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#2D241E', confirmButtonText: 'ลบข้อมูล',
            customClass: { popup: 'rounded-[2rem] font-["Kanit"] border-4 border-[#2D241E]' }
        });
        if (result.isConfirmed) {
            try {
                const url = type === 'provider' ? `${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/providers/${id}` : `${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments/${id}`;
                const res = await axiosInstance.delete(url);
                if (res.success) { toast.success("ลบสำเร็จ"); fetchData(true); }
            } catch (err) { toast.error("ลบไม่สำเร็จ"); }
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative max-w-[1920px] mx-auto shadow-2xl">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="shop-setting" />

            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[280px]'} p-4 md:p-8 lg:p-10 w-full relative z-10`}>
                <div className="mb-6 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-xl text-[#2D241E] shadow-sm border-2 border-[#2D241E] active:scale-90"><Menu size={24} /></button>
                    <Header title="การจัดการร้านค้า" />
                </div>

                {/* 🏷️ Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 px-2 text-left">
                    <div className="flex-1 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2D241E] rounded-full shadow-md animate-bounce-slow">
                            <Sparkles size={14} className="text-white" />
                            <span className="text-xs font-black uppercase tracking-widest text-white">Shop Configuration</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl 2xl:text-7xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">Settings</h1>
                    </div>
                    <button onClick={() => fetchData()} className="p-4 rounded-2xl bg-white border-2 border-[#2D241E] shadow-lg hover:rotate-180 transition-all active:scale-90 group shrink-0">
                        <RefreshCw size={24} className={`text-[#2D241E] ${loading ? 'animate-spin' : ''}`} strokeWidth={3} />
                    </button>
                </div>

                {/* 📊 Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 px-2">
                    <StatCardSmall title="แบรนด์ร้านค้า" value={formData.shop_name || '—'} icon={<Building2 />} />
                    <StatCardSmall title="ค่าส่งเริ่มต้น" value={`฿${formData.delivery_fee}`} icon={<Truck />} />
                    <StatCardSmall title="ส่งฟรีขั้นต่ำ" value={`${formData.min_free_shipping} ชิ้น`} icon={<Coins />} />
                    <StatCardSmall title="บัญชีธนาคาร" value={`${paymentMethods.length} บัญชี`} icon={<Landmark />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* ข้อมูลพื้นฐาน */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl text-left relative overflow-hidden group">
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <h3 className="text-xl font-black uppercase italic text-[#2D241E] flex items-center gap-3"><Store size={22} strokeWidth={3} /> ข้อมูลพื้นฐาน</h3>
                                <button onClick={() => setActiveModal('general')} className="p-2.5 bg-slate-50 text-[#2D241E] border-2 border-slate-100 rounded-xl hover:border-[#2D241E] transition-all shadow-sm"><Edit3 size={18} strokeWidth={3} /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InfoBlock label="อีเมลติดต่อ" value={formData.email} icon={<Mail size={16} strokeWidth={3} />} />
                                <InfoBlock label="เบอร์โทรศัพท์" value={formData.phone} icon={<Phone size={16} strokeWidth={3} />} />
                                <InfoBlock label="ที่ตั้งร้านค้า" value={formData.address} icon={<MapPin size={16} strokeWidth={3} />} isFull />
                            </div>
                        </div>

                        {/* บัญชีธนาคาร */}
                        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl text-left">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black uppercase italic text-[#2D241E] flex items-center gap-3"><Landmark size={22} strokeWidth={3} /> ช่องทางชำระเงิน</h3>
                                <button onClick={() => setActiveModal('payments')} className="p-2.5 bg-[#2D241E] text-white rounded-xl hover:bg-black transition-all shadow-lg"><Plus size={18} strokeWidth={3} /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {paymentMethods.map(m => (
                                    <div key={m.method_id} className="p-6 bg-slate-50 border-2 border-white rounded-[2rem] relative group hover:border-[#2D241E]/10 transition-all shadow-sm">
                                        <button onClick={() => handleDelete('payment', m.method_id)} className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} strokeWidth={3} /></button>
                                        <p className="font-black text-[#2D241E] text-sm uppercase italic">{m.bank_name}</p>
                                        <p className="text-xs font-black text-[#2D241E] uppercase mt-1">{m.account_name}</p>
                                        <p className="text-lg font-black text-[#2D241E] mt-4 italic">{m.account_number.replace(/(\d{3})(\d{1})(\d{5})(\d{1})/, '$1-$2-$3-$4')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ขนส่ง */}
                    <div className="lg:col-span-4 space-y-6 text-left">
                        <div className="bg-[#2D241E] p-6 md:p-8 rounded-[2.5rem] shadow-2xl text-white">
                            <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-3"><Truck size={20} strokeWidth={3} /> เงื่อนไขค่าส่ง</h3>
                            <div className="space-y-4 mb-8">
                                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-black uppercase opacity-60">Delivery Fee</p>
                                    <p className="text-3xl font-black italic">฿{formData.delivery_fee}</p>
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-black uppercase opacity-60">Units for Free</p>
                                    <p className="text-3xl font-black italic">{formData.min_free_shipping} ชิ้น</p>
                                </div>
                            </div>
                            <button onClick={() => setActiveModal('shipping_cost')} className="w-full py-4 bg-white text-[#2D241E] rounded-full font-black uppercase text-xs hover:bg-slate-100 transition-all italic">Update Cost</button>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black uppercase italic text-[#2D241E]">Partners</h3>
                                <button onClick={() => setActiveModal('providers')} className="p-2 bg-slate-50 text-[#2D241E] border-2 border-slate-100 rounded-lg hover:border-[#2D241E] transition-all"><Plus size={16} strokeWidth={3} /></button>
                            </div>
                            <div className="space-y-2">
                                {providers.map(p => (
                                    <div key={p.provider_id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl group/prov">
                                        <span className="font-black text-[#2D241E] uppercase text-xs italic">{p.provider_name}</span>
                                        <button onClick={() => handleDelete('provider', p.provider_id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"><X size={14} strokeWidth={3} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- Modals (Fixed handleAddPayment) --- */}
            {activeModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#2D241E]/30 backdrop-blur-sm animate-in fade-in" onClick={() => setActiveModal(null)}>
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-8 border-4 border-[#2D241E] animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 bg-slate-50 text-[#2D241E] rounded-full border-2 border-[#2D241E] hover:text-red-500 transition-all"><X size={20} strokeWidth={3} /></button>

                        <div className="mb-8 text-left">
                            <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest mb-1 italic">Config</p>
                            <h2 className="text-2xl font-black text-[#2D241E] uppercase italic">Update Details</h2>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left space-y-6">
                            {activeModal === 'general' && (
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <ModalInputField label="Shop Name" value={formData.shop_name} onChange={v => setFormData({ ...formData, shop_name: v })} required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <ModalInputField label="Email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} />
                                        <ModalInputField label="Phone" value={formData.phone} onChange={v => setFormData({ ...formData, phone: formatPhoneNumber(v) })} />
                                    </div>
                                    <textarea className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-[#2D241E]/10 focus:border-[#2D241E] outline-none font-black text-sm h-24 italic" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Shop Address..." />
                                    <button type="submit" className="w-full py-4 bg-[#2D241E] text-white rounded-full font-black uppercase text-sm tracking-widest shadow-xl hover:bg-black transition-all">Save Changes</button>
                                </form>
                            )}

                            {activeModal === 'payments' && (
                                <div className="space-y-4">
                                    <ModalInputField label="Bank Name" value={newPayment.bank_name} onChange={v => setNewPayment({ ...newPayment, bank_name: v })} />
                                    <ModalInputField label="Account Name" value={newPayment.account_name} onChange={v => setNewPayment({ ...newPayment, account_name: v })} />
                                    <ModalInputField label="Account Number" value={newPayment.account_number} onChange={v => setNewPayment({ ...newPayment, account_number: formatAccountNumber(v) })} />
                                    <button onClick={handleAddPayment} className="w-full py-4 bg-[#2D241E] text-white rounded-full font-black uppercase text-sm tracking-widest shadow-xl">Add Account</button>
                                </div>
                            )}

                            {activeModal === 'shipping_cost' && (
                                <form onSubmit={handleUpdate} className="space-y-6 text-center">
                                    <ModalInputField label="Delivery Fee (฿)" type="number" value={formData.delivery_fee} onChange={v => handleNumberInput('delivery_fee', v)} />
                                    <ModalInputField label="Min Units for Free" type="number" value={formData.min_free_shipping} onChange={v => handleNumberInput('min_free_shipping', v)} />
                                    <button type="submit" className="w-full py-4 bg-[#2D241E] text-white rounded-full font-black uppercase text-sm tracking-widest shadow-xl">Update Rules</button>
                                </form>
                            )}

                            {activeModal === 'providers' && (
                                <div className="space-y-4">
                                    <ModalInputField label="Provider Name" value={newProvider} onChange={v => setNewProvider(v)} />
                                    <button onClick={handleAddProvider} className="w-full py-4 bg-[#2D241E] text-white rounded-full font-black uppercase text-sm tracking-widest shadow-xl">Add Partner</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 💎 Helpers (เข้มจัด)
const StatCardSmall = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-2xl border-2 border-[#2D241E] shadow-lg flex items-center justify-between hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
        <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest mb-1 leading-none">{title}</p>
            <h2 className="text-[#2D241E] text-xl font-black italic leading-none uppercase truncate">{value}</h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#2D241E] border-2 border-[#2D241E] shadow-inner group-hover:bg-[#2D241E] group-hover:text-white transition-all duration-500">
            {React.cloneElement(icon, { size: 20, strokeWidth: 3 })}
        </div>
    </div>
);

const InfoBlock = ({ label, value, icon, isFull = false }) => (
    <div className={`space-y-1.5 ${isFull ? 'md:col-span-2' : ''}`}>
        <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest flex items-center gap-2">{icon} {label}</label>
        <p className="text-base font-black text-[#2D241E] border-b-2 border-slate-100 pb-2 italic truncate">{value || '—'}</p>
    </div>
);

const ModalInputField = ({ label, value, onChange, type = "text", required = false }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black uppercase text-[#2D241E] ml-2">{label}</label>
        <input type={type} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-[#2D241E]/10 focus:border-[#2D241E] outline-none font-black text-sm italic" value={value} onChange={e => onChange(e.target.value)} required={required} />
    </div>
);

export default ShopSetting;