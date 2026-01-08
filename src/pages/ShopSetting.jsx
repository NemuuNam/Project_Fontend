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

    // --- 🛠️ Helper: Validation & Formatting Logic ---
    
    const validateEmail = (email) => {
        return String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    // ระบบจัดรูปแบบเบอร์โทรศัพท์อัตโนมัติ (0xx-xxx-xxxx)
    const formatPhoneNumber = (value) => {
        const val = value.replace(/\D/g, '');
        if (val.length <= 3) return val;
        if (val.length <= 6) return `${val.slice(0, 3)}-${val.slice(3)}`;
        return `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6, 10)}`;
    };

    // ระบบจัดรูปแบบเลขบัญชีอัตโนมัติ (เช่น xxx-x-xxxxx-x)
    const formatAccountNumber = (value) => {
        const val = value.replace(/\D/g, '');
        if (val.length <= 3) return val;
        if (val.length <= 4) return `${val.slice(0, 3)}-${val.slice(3)}`;
        if (val.length <= 9) return `${val.slice(0, 3)}-${val.slice(3, 4)}-${val.slice(4)}`;
        return `${val.slice(0, 3)}-${val.slice(3, 4)}-${val.slice(4, 9)}-${val.slice(9, 10)}`;
    };

    const handlePhoneInput = (value) => {
        const formatted = formatPhoneNumber(value);
        setFormData(prev => ({ ...prev, phone: formatted }));
    };

    const handleNumberInput = (field, value) => {
        const num = Math.max(0, parseInt(value) || 0);
        setFormData(prev => ({ ...prev, [field]: num }));
    };

    // ------------------------------------------

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
                    phone: formatPhoneNumber(clean(s.phone)),
                    email: clean(s.email),
                    hero_description: clean(s.hero_description),
                    delivery_fee: Number(s.delivery_fee || 0),
                    min_free_shipping: Number(s.min_free_shipping || 0)
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

        // --- Validation ---
        if (!formData.shop_name.trim()) return toast.error("กรุณาระบุชื่อร้านค้า");
        if (formData.email && !validateEmail(formData.email)) return toast.error("รูปแบบอีเมลไม่ถูกต้อง");
        const rawPhone = formData.phone.replace(/\D/g, '');
        if (formData.phone && rawPhone.length < 9) return toast.error("เบอร์โทรศัพท์ต้องมี 9-10 หลัก");

        setIsSaving(true);
        const loadToast = toast.loading("กำลังบันทึกข้อมูลร้านค้า...");
        try {
            const sanitizedData = {
                ...formData,
                phone: rawPhone, // ส่งเฉพาะตัวเลขไป Backend
                shop_name: formData.shop_name.trim(),
                email: formData.email.trim(),
                address: formData.address.trim()
            };

            const res = await axiosInstance.put(API_ENDPOINTS.ADMIN.SHOP_SETTINGS, sanitizedData);
            if (res.success) {
                toast.success("บันทึกการตั้งค่าเรียบร้อย", { id: loadToast });
                setActiveModal(null);
                fetchData();
            }
        } catch (err) { toast.error("ล้มเหลวในการบันทึก", { id: loadToast }); }
        finally { setIsSaving(false); }
    };

    const handleAddPayment = async () => {
        const { bank_name, account_name, account_number } = newPayment;
        const rawAcc = account_number.replace(/\D/g, '');
        
        if (!bank_name.trim() || !account_name.trim() || !rawAcc) {
            return toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
        }
        if (rawAcc.length < 10) return toast.error("เลขบัญชีต้องมีอย่างน้อย 10 หลัก");

        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments`, {
                bank_name: bank_name.trim(),
                account_name: account_name.trim(),
                account_number: rawAcc
            });
            if (res.success) {
                setPaymentMethods(prev => [...prev, res.data]);
                setNewPayment({ bank_name: '', account_name: '', account_number: '' });
                toast.success("เพิ่มบัญชีธนาคารสำเร็จ");
                setActiveModal(null);
            }
        } catch (err) { toast.error("ไม่สามารถเพิ่มบัญชีได้"); }
    };

    const handleAddProvider = async () => {
        if (!newProvider.trim()) return toast.error("กรุณาระบุบริษัทขนส่ง");
        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/providers`, { 
                provider_name: newProvider.trim() 
            });
            if (res.success) {
                setProviders(prev => [...prev, res.data]);
                setNewProvider('');
                toast.success("เพิ่มรายชื่อขนส่งสำเร็จ");
                setActiveModal(null);
            }
        } catch (err) { toast.error("ล้มเหลว"); }
    };

    const handleDelete = async (type, id) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "ข้อมูลนี้จะถูกลบทิ้งถาวรจากระบบ",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2D241E',
            confirmButtonText: 'ยืนยัน ลบข้อมูล',
            cancelButtonText: 'ยกเลิก',
            background: '#ffffff',
            color: '#2D241E',
            customClass: { popup: 'rounded-[3rem] font-["Kanit"] border border-slate-50 shadow-2xl' }
        });
        if (result.isConfirmed) {
            try {
                const url = type === 'provider' ? `${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/providers/${id}` : `${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments/${id}`;
                const res = await axiosInstance.delete(url);
                if (res.success) {
                    if (type === 'provider') setProviders(prev => prev.filter(i => i.provider_id !== id));
                    else setPaymentMethods(prev => prev.filter(i => i.method_id !== id));
                    toast.success("ลบข้อมูลสำเร็จ");
                }
            } catch (err) { toast.error("ไม่สามารถลบได้ในขณะนี้"); }
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative selection:bg-[#F3E9DC]">
            
            {/* ☁️ Global Cozy Patterns (Opacity 0.02) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 opacity-[0.02] text-[#2D241E]" size={200} />
                <Cookie className="absolute bottom-[10%] right-[10%] -rotate-12 opacity-[0.02] text-[#2D241E]" size={180} />
                <Smile className="absolute top-[40%] right-[30%] opacity-[0.015] text-[#2D241E]" size={400} />
                <Sparkles className="absolute top-[15%] left-[45%] text-[#2D241E] opacity-[0.02]" size={100} />
            </div>

            <Toaster position="bottom-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="shop-setting" />

            <main className={`flex-1 p-4 md:p-10 lg:p-14 transition-all duration-500 ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[280px]'} w-full relative z-10 text-left`}>
                
                <div className="mb-12 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-2xl text-[#2D241E] shadow-sm border border-slate-100 active:scale-95 transition-all"><Menu size={24} /></button>
                    <Header title="การจัดการร้านค้า" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 px-2">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-100 animate-bounce-slow">
                            <Sparkles size={14} className="text-[#D97706]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B7E66]">ตั้งค่าร้านค้าทั่วไป</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">
                            Settings<span className="opacity-10">.</span>
                        </h1>
                    </div>
                    <button onClick={fetchData} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-90 group">
                        <RefreshCw size={24} className={`text-[#2D241E]/40 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                    </button>
                </div>

                {/* 📊 สรุปข้อมูล (Stat Cards - Pearl Style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 px-2">
                    <StatCardWhite title="แบรนด์ร้านค้า" value={formData.shop_name} icon={<Building2 size={24} />} color="#2D241E" />
                    <StatCardWhite title="ค่าส่งเริ่มต้น" value={`฿${formData.delivery_fee}`} icon={<Truck size={24} />} color="#2D241E" />
                    <StatCardWhite title="ส่งฟรีเมื่อสั่งครบ" value={`${formData.min_free_shipping} ชิ้น`} icon={<Coins size={24} />} color="#2D241E" />
                    <StatCardWhite title="บัญชีธนาคาร" value={`${paymentMethods.length} บัญชี`} icon={<Landmark size={24} />} color="#2D241E" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
                    
                    {/* ข้อมูลพื้นฐาน */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="bg-white p-8 md:p-14 rounded-[3rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.01] group-hover:rotate-12 transition-transform duration-700"><Store size={250} /></div>
                            
                            <div className="flex justify-between items-start mb-16 relative z-10">
                                <div className="space-y-1">
                                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic text-[#2D241E]">ข้อมูล <span className="opacity-20 font-light">พื้นฐานร้านค้า</span></h2>
                                    <p className="text-[15px] font-black text-[#C2B8A3] uppercase tracking-[0.4em]">ข้อมูลหลักที่จะแสดงผลบนหน้าเว็บไซต์</p>
                                </div>
                                <button onClick={() => setActiveModal('general')} className="w-12 h-12 md:w-14 md:h-14 bg-white text-[#2D241E] border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90 shadow-sm group/btn">
                                    <Edit3 size={20} className="group-hover/btn:text-[#D97706] transition-colors" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 relative z-10">
                                <InfoBlock label="ชื่อร้านค้าอย่างเป็นทางการ" value={formData.shop_name} icon={<Globe size={20}/>} />
                                <InfoBlock label="อีเมลสำหรับติดต่อลูกค้า" value={formData.email} icon={<Mail size={20}/>} />
                                <InfoBlock label="เบอร์โทรศัพท์ที่ใช้ในระบบ" value={formData.phone} icon={<Phone size={20}/>} />
                                <InfoBlock label="ที่ตั้งสำนักงาน/จุดกระจายสินค้า" value={formData.address || 'ยังไม่ได้ระบุที่อยู่ของร้าน'} icon={<MapPin size={20}/>} isFull />
                            </div>
                        </div>

                        {/* การจัดการบัญชีธนาคาร */}
                        <div className="bg-white p-8 md:p-14 rounded-[3rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-md">
                            <div className="flex justify-between items-center mb-16">
                                <div className="space-y-1">
                                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic flex items-center gap-4 text-[#2D241E]"><Landmark size={28} className="opacity-20" /> ช่องทางรับชำระเงิน</h2>
                                    <p className="text-[15px] font-black text-[#C2B8A3] uppercase tracking-[0.4em]">จัดการเลขบัญชีธนาคารสำหรับโอนเงิน</p>
                                </div>
                                <button onClick={() => setActiveModal('payments')} className="w-12 h-12 md:w-14 md:h-14 bg-white text-[#2D241E] border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-50 active:scale-95 shadow-sm group/add">
                                    <Plus size={26} className="group-hover/add:rotate-90 transition-transform" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {paymentMethods.map(m => (
                                    <div key={m.method_id} className="p-8 md:p-10 bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 group relative hover:shadow-lg transition-all duration-700">
                                        <button onClick={() => handleDelete('payment', m.method_id)} className="absolute top-8 right-8 p-2 text-[#C2B8A3] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20} /></button>
                                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-[#2D241E]/40 mb-8 shadow-inner"><CreditCard size={24}/></div>
                                        <p className="font-black text-[#2D241E] text-2xl uppercase mb-1 tracking-tighter italic leading-none">{m.bank_name}</p>
                                        <p className="text-[#8B7E66] font-bold text-[20px] uppercase tracking-[0.3em] mb-10">{m.account_name}</p>
                                        <div className="pt-6 border-t border-slate-50">
                                            <p className="text-2xl md:text-3xl font-black text-[#2D241E] tracking-[0.1em] italic">{m.account_number.replace(/(\d{3})(\d{1})(\d{5})(\d{1})/, '$1-$2-$3-$4')}</p>
                                        </div>
                                    </div>
                                ))}
                                {paymentMethods.length === 0 && (
                                    <div className="md:col-span-2 py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center gap-6">
                                        <Landmark size={50} className="opacity-[0.05]" />
                                        <p className="text-[#C2B8A3] font-black uppercase tracking-[0.5em] italic text-xs">ยังไม่มีข้อมูลช่องทางรับเงิน</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ข้อมูลจัดส่ง */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="bg-white p-8 md:p-12 rounded-[3rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.01] group-hover:rotate-12 transition-transform duration-700"><Coins size={150} /></div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black mb-12 uppercase tracking-tighter italic text-[#2D241E]">เงื่อนไข <span className="opacity-20 font-light">ค่าขนส่ง</span></h3>
                                
                                <div className="space-y-6 mb-12">
                                    <div className="bg-slate-50/50 p-10 rounded-[3rem] border border-white hover:bg-white transition-all duration-500 shadow-inner hover:shadow-md text-center">
                                        <p className="text-[10px] font-black text-[#C2B8A3] uppercase tracking-[0.4em] mb-4 flex items-center justify-center gap-2 leading-none"><Truck size={12}/> ค่าส่งปกติ</p>
                                        <p className="text-4xl md:text-5xl font-black italic tracking-tighter text-[#2D241E] leading-none">฿{formData.delivery_fee}</p>
                                    </div>
                                    <div className="bg-slate-50/50 p-10 rounded-[3rem] border border-white hover:bg-white transition-all duration-500 shadow-inner hover:shadow-md text-center">
                                        <p className="text-[10px] font-black text-[#C2B8A3] uppercase tracking-[0.4em] mb-4 flex items-center justify-center gap-2 leading-none"><ShieldCheck size={12}/> ส่งฟรีเมื่อซื้อ</p>
                                        <p className="text-4xl md:text-5xl font-black italic tracking-tighter text-[#2D241E] leading-none">{formData.min_free_shipping} <span className="text-xl not-italic opacity-70">ชิ้น</span></p>
                                    </div>
                                </div>

                                <button onClick={() => setActiveModal('shipping_cost')} className="w-full py-6 bg-slate-100 text-black rounded-full font-black text-[15px] uppercase tracking-[0.5em] transition-all hover:bg-white shadow-xl active:scale-95">ตั้งค่าค่าส่ง</button>
                            </div>
                        </div>

                        <div className="bg-white p-8 md:p-12 rounded-[3rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm relative transition-all duration-500 hover:shadow-md">
                            <div className="flex justify-between items-center mb-12 px-2">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black uppercase tracking-tighter italic text-[#2D241E]">พาร์ทเนอร์ขนส่ง</h3>
                                    <p className="text-[15px] font-black text-[#C2B8A3] uppercase tracking-widest">บริษัทขนส่งที่เปิดใช้งาน</p>
                                </div>
                                <button onClick={() => setActiveModal('providers')} className="p-3 bg-white text-[#2D241E] rounded-2xl hover:bg-slate-50 active:scale-90 transition-all border border-slate-200 shadow-sm"><Plus size={20}/></button>
                            </div>
                            <div className="space-y-4">
                                {providers.map(p => (
                                    <div key={p.provider_id} className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-md transition-all group/prov">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#2D241E]/20 transition-all shadow-inner">
                                                <Truck size={18} />
                                            </div>
                                            <span className="font-black text-[#2D241E] uppercase text-xs tracking-widest italic leading-none">{p.provider_name}</span>
                                        </div>
                                        <button onClick={() => handleDelete('provider', p.provider_id)} className="text-[#C2B8A3] hover:text-rose-500 transition-colors p-2 active:scale-90"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- Modals (Pearl White Style) --- */}
            {activeModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-[#2D241E]/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setActiveModal(null)}>
                    <div className="bg-white w-full max-w-xl rounded-[3rem] md:rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-white" onClick={e => e.stopPropagation()}>
                        <div className="p-10 md:p-14 relative">
                            <button onClick={() => setActiveModal(null)} className="absolute top-8 right-8 p-3 bg-slate-50 text-[#2D241E]/20 hover:text-red-500 rounded-full transition-all active:scale-90 border border-white shadow-sm"><X size={20}/></button>
                            
                            <div className="mb-12 text-left">
                                <p className="text-[#D97706] font-bold text-[15px] uppercase tracking-[0.6em] mb-2 italic leading-none">Configuration Master</p>
                                <h2 className="text-3xl md:text-4xl font-black text-[#2D241E] uppercase tracking-tighter italic leading-none">ปรับแต่ง <span className="opacity-20 font-light">ข้อมูลระบบ</span></h2>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                                {activeModal === 'general' && (
                                    <form onSubmit={handleUpdate} className="space-y-8">
                                        <ModalInputField label="ชื่อร้านค้าทางกฎหมาย" value={formData.shop_name} onChange={v => setFormData({...formData, shop_name: v})} required />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <ModalInputField label="อีเมลบัญชีกลาง" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                                            <ModalInputField label="เบอร์โทรศัพท์ (Auto-format)" type="tel" value={formData.phone} onChange={handlePhoneInput} placeholder="0xx-xxx-xxxx" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#8B7E66] ml-6 tracking-[0.3em]">ที่อยู่สำนักงาน / ร้านค้า</label>
                                            <textarea className="w-full p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg h-32 resize-none focus:bg-white focus:border-[#2D241E]/10 transition-all shadow-inner text-[#2D241E] italic" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="ระบุบ้านเลขที่ ถนน แขวง/ตำบล..." />
                                        </div>
                                        <button type="submit" className="w-full py-6 bg-[#ffff] text-#2D241E rounded-full font-black text-xl uppercase tracking-[0.4em] shadow-sm hover:bg-slate-50 transition-all active:scale-95">บันทึกข้อมูลทั่วไป</button>
                                    </form>
                                )}

                                {activeModal === 'payments' && (
                                    <div className="space-y-8">
                                        <ModalInputField label="ชื่อธนาคาร" placeholder="เช่น กสิกรไทย, ไทยพาณิชย์" value={newPayment.bank_name} onChange={v => setNewPayment({...newPayment, bank_name: v})} />
                                        <ModalInputField label="ชื่อบัญชี (ภาษาไทย/อังกฤษ)" placeholder="ชื่อ-นามสกุล เจ้าของบัญชี" value={newPayment.account_name} onChange={v => setNewPayment({...newPayment, account_name: v})} />
                                        <ModalInputField label="เลขบัญชี (Auto-format)" placeholder="ระบุเฉพาะตัวเลข" value={newPayment.account_number} onChange={v => setNewPayment({...newPayment, account_number: formatAccountNumber(v)})} />
                                        <button onClick={handleAddPayment} className="w-full py-6 bg-[#ffff] text-#2D241E rounded-full font-black text-xl uppercase tracking-[0.4em] shadow-sm hover:bg-slate-50 transition-all active:scale-95">เพิ่มบัญชีธนาคาร</button>
                                    </div>
                                )}

                                {activeModal === 'shipping_cost' && (
                                    <form onSubmit={handleUpdate} className="space-y-10">
                                        <ModalInputField label="ราคาค่าจัดส่งต่อออเดอร์ (฿)" type="number" value={formData.delivery_fee} onChange={v => handleNumberInput('delivery_fee', v)} isHuge />
                                        <ModalInputField label="ยอดสั่งซื้อขั้นต่ำสำหรับส่งฟรี (ชิ้น)" type="number" value={formData.min_free_shipping} onChange={v => handleNumberInput('min_free_shipping', v)} isHuge />
                                        <button type="submit" className="w-full py-6 bg-[#ffff] text-#2D241E rounded-full font-black text-xl uppercase tracking-[0.4em] shadow-sm hover:bg-slate-50 transition-all active:scale-95">ยืนยันเงื่อนไขค่าส่ง</button>
                                    </form>
                                )}

                                {activeModal === 'providers' && (
                                    <div className="space-y-8">
                                        <ModalInputField label="ชื่อบริษัทขนส่ง" placeholder="เช่น Flash, Kerry, Nim Express" value={newProvider} onChange={v => setNewProvider(v)} />
                                        <button onClick={handleAddProvider} className="w-full py-6 bg-[#ffff] text-#2D241E rounded-full font-black text-xl uppercase tracking-[0.4em] shadow-sm hover:bg-slate-50 transition-all active:scale-95">เพิ่มรายชื่อขนส่ง</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E10; border-radius: 10px; }
            `}} />
        </div>
    );
};

// --- Balanced Component Helpers (Pearl White Style) ---

const StatCardWhite = ({ title, value, icon, color }) => (
    <div className="bg-white p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all hover:-translate-y-1.5 duration-500 group relative overflow-hidden">
        <div className="flex-1 text-left min-w-0 pr-4 relative z-10">
            <p className="text-[9px] font-black text-[#2D241E]/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 leading-none">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }}></span>
                {title}
            </p>
            <h2 className="text-[#2D241E] text-xl md:text-2xl xl:text-3xl font-black italic tracking-tighter leading-none truncate uppercase">{value || '—'}</h2>
        </div>
        <div style={{ color: color }} className="w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] flex items-center justify-center bg-white shadow-sm border border-slate-50 group-hover:scale-110 transition-transform duration-500 shrink-0 relative z-10">
            {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
        </div>
    </div>
);

const InfoBlock = ({ label, value, icon, isFull = false }) => (
    <div className={`space-y-3 ${isFull ? 'md:col-span-2' : ''} group/item`}>
        <label className="text-[15px] font-black text-[#C2B8A3] uppercase tracking-[0.4em] flex items-center gap-2 ml-2 transition-colors group-hover/item:text-[#2D241E]">{icon} {label}</label>
        <p className={`text-[#2D241E] font-black border-b border-slate-50 pb-5 leading-tight transition-all group-hover/item:border-[#2D241E]/20 ${isFull ? 'text-xl md:text-2xl italic font-light opacity-60' : 'text-2xl md:text-3xl tracking-tighter'}`}>{value || '—'}</p>
    </div>
);

const ModalInputField = ({ label, value, onChange, type = "text", placeholder = "", required = false, isHuge = false }) => (
    <div className="space-y-2 group/field">
        <label className="text-[10px] font-black uppercase text-[#8B7E66] ml-6 tracking-[0.3em] transition-colors group-focus-within/field:text-[#2D241E]">{label}</label>
        <input 
            type={type}
            className={`w-full p-6 rounded-full bg-slate-50/50 border border-slate-100 outline-none font-bold transition-all shadow-inner focus:bg-white focus:border-[#2D241E]/10 text-[#2D241E] italic ${isHuge ? 'text-6xl md:text-7xl text-center tracking-tighter' : 'text-xl'}`}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            onBlur={(e) => {
                if (type === "text" || type === "email") {
                    onChange(e.target.value.trim());
                }
            }}
        />
    </div>
);

export default ShopSetting;