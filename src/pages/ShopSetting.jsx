import React, { useEffect, useState, useCallback } from 'react';
import {
    Store, Truck, Save, Loader2, Trash2, Plus, X,
    Landmark, Phone, Mail, Edit3,
    Coins, MapPin, Menu, Building2,
    Sparkles
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// ✅ Helpers 
const formatPhoneNumber = (value) => {
    if (!value) return "";
    const val = value.replace(/\D/g, '');
    if (val.length <= 3) return val;
    if (val.length <= 6) return `${val.slice(0, 3)}-${val.slice(3)}`;
    return `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6, 10)}`;
};

const formatAccountNumber = (value) => {
    if (!value) return "";
    const val = value.replace(/\D/g, '');
    if (val.length <= 3) return val;
    if (val.length <= 4) return `${val.slice(0, 3)}-${val.slice(3)}`;
    if (val.length <= 9) return `${val.slice(0, 3)}-${val.slice(3, 4)}-${val.slice(4)}`;
    return `${val.slice(0, 3)}-${val.slice(3, 4)}-${val.slice(4, 9)}-${val.slice(9, 10)}`;
};

const ShopSetting = () => {
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

    const fetchData = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const [settingsRes, provsRes, paymentsRes] = await Promise.all([
                axiosInstance.get(API_ENDPOINTS.ADMIN.SHOP_SETTINGS),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/providers`),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments`)
            ]);

            const s = settingsRes.data || settingsRes;
            if (s && (settingsRes.success || s.shop_name)) {
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
            const pData = provsRes.data || provsRes;
            setProviders(Array.isArray(pData) ? pData : (pData.data || []));
            const payData = paymentsRes.data || paymentsRes;
            setPaymentMethods(Array.isArray(payData) ? payData : (payData.data || []));

        } catch (err) { 
            toast.error("โหลดข้อมูลล้มเหลว"); 
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
            const rawPhone = formData.phone.replace(/\D/g, '');
            const res = await axiosInstance.put(API_ENDPOINTS.ADMIN.SHOP_SETTINGS, { ...formData, phone: rawPhone });
            if (res.success || res.status === 200) {
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
            if (res.success || res.status === 200) { 
                toast.success("เพิ่มบัญชีสำเร็จ"); 
                setNewPayment({ bank_name: '', account_name: '', account_number: '' }); 
                setActiveModal(null); 
                fetchData(true); 
            }
        } catch (err) { toast.error("ล้มเหลว"); }
    };

    const handleAddProvider = async () => {
        if (!newProvider.trim()) return toast.error("ระบุบริษัทขนส่ง");
        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/providers`, { provider_name: newProvider.trim() });
            if (res.success || res.status === 200) { 
                toast.success("เพิ่มขนส่งสำเร็จ"); 
                setNewProvider(''); 
                setActiveModal(null); 
                fetchData(true); 
            }
        } catch (err) { toast.error("ล้มเหลว"); }
    };

    const handleDelete = async (type, id) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#000000', confirmButtonText: 'ลบข้อมูล',
            customClass: { popup: 'rounded-[2.5rem] font-["Kanit"]' }
        });
        if (result.isConfirmed) {
            try {
                const url = type === 'provider' ? `${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/providers/${id}` : `${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments/${id}`;
                const res = await axiosInstance.delete(url);
                if (res.success || res.status === 200) { toast.success("ลบสำเร็จ"); fetchData(true); }
            } catch (err) { toast.error("ลบไม่สำเร็จ"); }
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-slate-800" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] overflow-x-hidden relative max-w-full">
            <Toaster position="top-right" containerStyle={{ zIndex: 9999 }} />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="shop-setting" />

            {/* 🚀 ปรับ Margin Left ตามความกว้าง 280px และลด Padding ขวา */}
            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[280px]'} p-4 md:p-5 lg:p-6 lg:pr-4 w-full relative z-10`}>
                <div className="mb-4 flex items-center gap-4 text-left">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-xl text-[#111827] border border-slate-300 shadow-sm"><Menu size={24} /></button>
                    <Header title="การจัดการร้านค้า" isCollapsed={isCollapsed} />
                </div>

                {/* 🚀 pt-24 หลบ Header ทึบ */}
                <div className="pt-24">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 px-2">
                        {/* 📊 StatCards: ปรับ p-6 และขอบบาง 1px */}
                        <StatCardSmall title="แบรนด์ร้านค้า" value={formData.shop_name || '—'} />
                        <StatCardSmall title="ค่าส่งเริ่มต้น" value={`฿${formData.delivery_fee}`} />
                        <StatCardSmall title="ส่งฟรีขั้นต่ำ" value={`${formData.min_free_shipping} ชิ้น`} />
                        <StatCardSmall title="บัญชีธนาคาร" value={`${paymentMethods.length} บัญชี`} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-2">
                        <div className="lg:col-span-8 space-y-6">
                            {/* ข้อมูลพื้นฐาน: border 1px */}
                            <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm text-left">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-medium uppercase italic text-[#000000] flex items-center gap-3"><Store size={28} /> ข้อมูลพื้นฐาน</h3>
                                    <button onClick={() => setActiveModal('general')} className="p-2.5 bg-white border border-slate-300 rounded-xl text-[#374151] hover:text-[#000000] transition-colors shadow-sm"><Edit3 size={22} /></button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <InfoBlock label="อีเมลติดต่อ" value={formData.email} />
                                    <InfoBlock label="เบอร์โทรศัพท์" value={formData.phone} />
                                    <InfoBlock label="ที่ตั้งร้านค้า" value={formData.address} isFull />
                                </div>
                            </div>

                            {/* ช่องทางชำระเงิน: border 1px */}
                            <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm text-left">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-medium uppercase italic text-[#000000] flex items-center gap-3"><Landmark size={28} /> ช่องทางชำระเงิน</h3>
                                    <button onClick={() => setActiveModal('payments')} className="p-2.5 bg-white border border-[#000000] text-[#000000] rounded-xl hover:bg-slate-50 transition-colors shadow-sm"><Plus size={22} /></button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {paymentMethods.map(m => (
                                        <div key={m.method_id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative group shadow-sm">
                                            <button onClick={() => handleDelete('payment', m.method_id)} className="absolute top-4 right-4 p-1.5 text-rose-300 hover:text-rose-600 transition-colors"><Trash2 size={20} /></button>
                                            <p className="text-lg font-medium text-[#374151] uppercase italic border-b border-slate-200 pb-1 mb-3">{m.bank_name}</p>
                                            <p className="text-xl font-medium text-[#000000] uppercase">{m.account_name}</p>
                                            <p className="text-2xl font-medium text-[#111827] mt-3 italic tracking-tighter">{m.account_number}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6 text-left">
                            {/* เงื่อนไขค่าส่ง: border 1px */}
                            <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm">
                                <h3 className="text-xl font-medium uppercase italic text-[#000000] mb-6 flex items-center gap-2 border-b border-slate-100 pb-3"><Truck size={24} /> เงื่อนไขค่าส่ง</h3>
                                <div className="space-y-4 mb-8">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                                        <p className="text-[10px] font-medium uppercase text-[#374151] mb-1">Delivery Fee</p>
                                        <p className="text-3xl font-medium italic text-[#000000]">฿{formData.delivery_fee}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                                        <p className="text-[10px] font-medium uppercase text-[#374151] mb-1">Units for Free</p>
                                        <p className="text-3xl font-medium italic text-[#000000]">{formData.min_free_shipping} ชิ้น</p>
                                    </div>
                                </div>
                                <button onClick={() => setActiveModal('shipping_cost')} className="w-full py-4 bg-white border border-[#000000] text-[#000000] rounded-full font-medium uppercase text-base shadow-sm hover:bg-slate-50 transition-colors italic">Update Rules</button>
                            </div>

                            {/* พาร์ทเนอร์ขนส่ง: border 1px */}
                            <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm">
                                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                                    <h3 className="text-xl font-medium uppercase italic text-[#000000]">Partners</h3>
                                    <button onClick={() => setActiveModal('providers')} className="p-1.5 bg-white border border-slate-300 rounded-lg text-[#374151] hover:text-[#000000] shadow-sm"><Plus size={18} /></button>
                                </div>
                                <div className="space-y-3">
                                    {providers.map(p => (
                                        <div key={p.provider_id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl group transition-all">
                                            <span className="text-lg font-medium text-[#111827] uppercase italic">{p.provider_name}</span>
                                            <button onClick={() => handleDelete('provider', p.provider_id)} className="p-1.5 text-rose-300 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- Modals (🚀 Compact & Thin Borders) --- */}
            {activeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in" onClick={() => setActiveModal(null)}>
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-8 border border-slate-300 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8 text-left border-b border-slate-100 pb-4">
                            <h2 className="text-2xl font-medium uppercase italic text-[#000000]">Update Details</h2>
                            <button onClick={() => setActiveModal(null)} className="p-2 bg-slate-50 text-[#111827] border border-slate-200 rounded-full hover:text-red-600 transition-colors"><X size={24} /></button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                            {activeModal === 'general' && (
                                <form onSubmit={handleUpdate} className="space-y-5">
                                    <ModalInputField label="Shop Brand Name" value={formData.shop_name} onChange={v => setFormData({ ...formData, shop_name: v })} required />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ModalInputField label="Email Address" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} />
                                        <ModalInputField label="Contact Number" value={formData.phone} onChange={v => setFormData({ ...formData, phone: formatPhoneNumber(v) })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-medium uppercase ml-2 text-[#374151] tracking-widest">Full Address</label>
                                        <textarea className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium text-lg italic text-[#111827] h-28 focus:bg-white" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-white border border-[#000000] text-[#000000] rounded-full font-medium uppercase text-xl shadow-md active:scale-95 italic">Save Changes</button>
                                </form>
                            )}

                            {activeModal === 'payments' && (
                                <div className="space-y-5">
                                    <ModalInputField label="Bank Name" value={newPayment.bank_name} onChange={v => setNewPayment({ ...newPayment, bank_name: v })} />
                                    <ModalInputField label="Account Holder Name" value={newPayment.account_name} onChange={v => setNewPayment({ ...newPayment, account_name: v })} />
                                    <ModalInputField label="Account Number" value={newPayment.account_number} onChange={v => setNewPayment({ ...newPayment, account_number: formatAccountNumber(v) })} />
                                    <button onClick={handleAddPayment} className="w-full py-5 bg-white border border-[#000000] text-[#000000] rounded-full font-medium uppercase text-xl shadow-md active:scale-95 italic">Add Account</button>
                                </div>
                            )}

                            {activeModal === 'shipping_cost' && (
                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <ModalInputField label="Delivery Fee (฿)" type="number" value={formData.delivery_fee} onChange={v => setFormData({ ...formData, delivery_fee: Number(v) })} />
                                    <ModalInputField label="Minimum Units for Free Shipping" type="number" value={formData.min_free_shipping} onChange={v => setFormData({ ...formData, min_free_shipping: Number(v) })} />
                                    <button type="submit" className="w-full py-5 bg-white border border-[#000000] text-[#000000] rounded-full font-medium uppercase text-xl shadow-md active:scale-95 italic">Update Costs</button>
                                </form>
                            )}

                            {activeModal === 'providers' && (
                                <div className="space-y-5">
                                    <ModalInputField label="Partner Provider Name" value={newProvider} onChange={v => setNewProvider(v)} />
                                    <button onClick={handleAddProvider} className="w-full py-5 bg-white border border-[#000000] text-[#000000] rounded-full font-medium uppercase text-xl shadow-md active:scale-95 italic">Register Partner</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 💎 Helpers UI Components: p-6 & border 1px
const StatCardSmall = ({ title, value }) => (
    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm flex flex-col gap-1 text-left">
        <p className="text-xl font-medium text-[#374151] uppercase tracking-widest italic leading-none">{title}</p>
        <h2 className="text-5xl font-medium italic tracking-tighter text-[#000000] leading-none mt-2 truncate">{value}</h2>
    </div>
);

const InfoBlock = ({ label, value, isFull = false }) => (
    <div className={`space-y-2 ${isFull ? 'md:col-span-2' : ''}`}>
        <label className="text-[10px] font-medium text-[#374151] uppercase tracking-widest block border-l border-[#000000] pl-2">{label}</label>
        <p className="text-xl font-medium text-[#111827] italic leading-tight">{value || '—'}</p>
    </div>
);

const ModalInputField = ({ label, value, onChange, type = "text", required = false }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-medium uppercase ml-2 text-[#374151] tracking-widest">{label}</label>
        <input type={type} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium text-xl italic text-[#111827] focus:bg-white" value={value} onChange={e => onChange(e.target.value)} required={required} />
    </div>
);

export default ShopSetting;