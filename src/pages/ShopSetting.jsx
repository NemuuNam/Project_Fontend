import React, { useEffect, useState, useCallback } from 'react';
import {
    Store, Truck, Save, Loader2, Trash2, Plus, X,
    CreditCard, Landmark, Globe, Phone, Mail, Edit3,
    Coins, MessageCircle, User, MapPin // ✅ เพิ่ม MapPin เรียบร้อย
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

// --- นำเข้าระบบ API ส่วนกลาง ---
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// --- กำหนดค่าจำกัดความยาวตาม Schema ฐานข้อมูล ---
const LIMITS = {
    SHOP_NAME: 100,
    EMAIL: 100,
    PHONE: 10,
    ADDRESS: 500,
    SOCIAL_URL: 255,
    PROVIDER_NAME: 100,
    BANK_NAME: 100,
    ACCOUNT_NAME: 100, // ✅ รองรับชื่อบัญชีใหม่
    ACCOUNT_NUMBER: 15
};

const ShopSetting = () => {
    // --- States ข้อมูลหลัก ---
    const [formData, setFormData] = useState({
        shop_name: '', address: '', phone: '', email: '',
        hero_description: '', delivery_fee: 0, min_free_shipping: 0,
        facebook_url: '', instagram_url: '', line_url: ''
    });
    const [providers, setProviders] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- States ระบบ UI ---
    const [activeModal, setActiveModal] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // --- States สำหรับข้อมูลใหม่ ---
    const [newProvider, setNewProvider] = useState('');
    const [newPayment, setNewPayment] = useState({ 
        bank_name: '', 
        account_name: '', // ✅ ฟิลด์ชื่อบัญชี
        account_number: '' 
    });

    // 1. ดึงข้อมูลทั้งหมดจาก API
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
            toast.error("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // 2. ฟังก์ชันอัปเดตข้อมูล (General / Social / Shipping)
    const handleUpdate = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        const loadToast = toast.loading("กำลังอัปเดตข้อมูล...");
        try {
            const res = await axiosInstance.put(API_ENDPOINTS.ADMIN.SHOP_SETTINGS, formData);
            if (res.success) {
                toast.success("บันทึกสำเร็จ", { id: loadToast });
                setActiveModal(null);
                fetchData();
            }
        } catch (err) {
            toast.error("บันทึกล้มเหลว", { id: loadToast });
        } finally {
            setIsSaving(false);
        }
    };

    // 3. ฟังก์ชันเพิ่มบัญชีธนาคาร (account_name)
    const handleAddPayment = async () => {
        if (!newPayment.bank_name || !newPayment.account_name || !newPayment.account_number) {
            return toast.error("กรุณากรอกข้อมูลบัญชีให้ครบถ้วน");
        }
        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments`, newPayment);
            if (res.success) {
                setPaymentMethods(prev => [...prev, res.data]);
                setNewPayment({ bank_name: '', account_name: '', account_number: '' });
                toast.success("เพิ่มบัญชีธนาคารแล้ว");
                setActiveModal(null);
            }
        } catch (err) { toast.error("เพิ่มบัญชีล้มเหลว"); }
    };

    // 4. ฟังก์ชันเพิ่มบริษัทขนส่ง
    const handleAddProvider = async () => {
        if (!newProvider) return toast.error("กรุณาระบุชื่อบริษัทขนส่ง");
        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/providers`, { provider_name: newProvider });
            if (res.success) {
                setProviders(prev => [...prev, res.data]);
                setNewProvider('');
                toast.success("เพิ่มข้อมูลขนส่งสำเร็จ");
                setActiveModal(null);
            }
        } catch (err) { toast.error("เพิ่มขนส่งล้มเหลว"); }
    };

    // 5. ฟังก์ชันลบข้อมูล
    const handleDelete = async (type, id) => {
        const result = await Swal.fire({
            title: 'คุณต้องการลบข้อมูลนี้?',
            text: "ข้อมูลจะหายไปจากระบบอย่างถาวร",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4318ff',
            confirmButtonText: 'ยืนยันการลบ',
            cancelButtonText: 'ยกเลิก',
            borderRadius: '30px'
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
        <div className="flex h-screen items-center justify-center bg-[#f4f7fe]">
            <Loader2 className="animate-spin text-[#4318ff]" size={50} />
        </div>
    );

    return (
        <div className="shop-layout">
            <Toaster position="top-right" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                .shop-layout { display: flex; min-height: 100vh; background: #f4f7fe; font-family: 'Kanit', sans-serif; color: #1b2559; }
                .main-content { flex: 1; margin-left: ${isCollapsed ? '80px' : '260px'}; padding: 30px; transition: all 0.3s ease; width: 100%; box-sizing: border-box; }
                @media (max-width: 1024px) { .main-content { margin-left: 0 !important; padding: 20px; } }

                .premium-card { background: white; padding: 25px; border-radius: 35px; border: 1px solid #f1f5f9; box-shadow: 0 10px 40px rgba(0,0,0,0.02); display: flex; flex-direction: column; height: 100%; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); display: flex; justify-content: center; align-items: center; z-index: 3000; padding: 15px; }
                .modal-box { background: white; width: 100%; max-width: 550px; border-radius: 40px; padding: 40px; position: relative; max-height: 90vh; overflow-y: auto; box-shadow: 0 30px 60px -12px rgba(0,0,0,0.25); }
                .input-field { width: 100%; padding: 18px 22px; border-radius: 20px; border: 1.5px solid #eef2f6; outline: none; background: #fcfdfe; transition: 0.2s; font-family: 'Kanit'; font-size: 15px; font-weight: 500; }
                .input-field:focus { border-color: #4318ff; box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.05); }
            `}</style>

            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} activePage="settings" />

            <main className="main-content">
                <Header title="การตั้งค่าร้านค้า" />

                {/* --- สรุปสถานะ 4 ช่อง --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8 mt-5">
                    <StatBox title="ชื่อร้านค้า" value={formData.shop_name} icon={<Globe size={22} />} color="#4318ff" />
                    <StatBox title="ค่าส่งสินค้า" value={`฿${formData.delivery_fee}`} icon={<Truck size={22} />} color="#ffb547" />
                    <StatBox title="ส่งฟรีขั้นต่ำ" value={`${formData.min_free_shipping} ชิ้น`} icon={<Coins size={22} />} color="#05cd99" />
                    <StatBox title="ช่องทางโอน" value={`${paymentMethods.length} บัญชี`} icon={<Landmark size={22} />} color="#4318ff" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* 🏠 ข้อมูลติดต่อร้าน (Fixed Icon MapPin) */}
                    <div className="premium-card">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-[#eef2ff] rounded-2xl text-[#4318ff]"><Store size={24} /></div>
                            <button onClick={() => setActiveModal('general')} className="p-2.5 bg-[#f4f7fe] text-[#4318ff] rounded-xl hover:bg-blue-100 transition-colors border-none cursor-pointer"><Edit3 size={16} /></button>
                        </div>
                        <h2 className="text-lg font-bold mb-4">ข้อมูลติดต่อร้าน</h2>
                        <div className="space-y-4 text-sm font-medium">
                            <p className="flex items-center gap-3 text-slate-600"><Phone size={16} className="text-slate-400"/> {formData.phone || '-'}</p>
                            <p className="flex items-center gap-3 text-slate-600"><Mail size={16} className="text-slate-400"/> {formData.email || '-'}</p>
                            {/* ✅ คืนค่า Icon MapPin เรียบร้อย */}
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-slate-400 mt-1 shrink-0" />
                                <p className="text-slate-400 leading-relaxed line-clamp-3">{formData.address || 'ยังไม่ระบุที่อยู่ร้าน'}</p>
                            </div>
                        </div>
                    </div>

                    {/* 📱 โซเชียลมีเดีย */}
                    <div className="premium-card">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-[#ecfdf5] rounded-2xl text-[#05cd99]"><MessageCircle size={24} /></div>
                            <button onClick={() => setActiveModal('social')} className="p-2.5 bg-[#f4f7fe] text-[#4318ff] rounded-xl hover:bg-blue-100 border-none cursor-pointer"><Edit3 size={16} /></button>
                        </div>
                        <h2 className="text-lg font-bold mb-4">โซเชียลมีเดีย</h2>
                        <div className="space-y-3 text-sm text-slate-500 font-medium">
                            <p className="truncate text-slate-600"><strong>Facebook:</strong> {formData.facebook_url || '-'}</p>
                            <p className="truncate text-slate-600"><strong>Instagram:</strong> {formData.instagram_url || '-'}</p>
                            <p className="truncate text-slate-600"><strong>Line:</strong> {formData.line_url || '-'}</p>
                        </div>
                    </div>

                    {/* 🚚 ระบบขนส่ง */}
                    <div className="premium-card">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-[#fff7ed] rounded-2xl text-[#ffb547]"><Truck size={24} /></div>
                            <button onClick={() => setActiveModal('providers')} className="bg-[#4318ff] text-white px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer flex items-center gap-1 hover:shadow-lg transition-all"><Plus size={14} /> เพิ่ม</button>
                        </div>
                        <h2 className="text-lg font-bold mb-4">ขนส่งที่ใช้งาน</h2>
                        <div className="space-y-2 overflow-y-auto max-h-36 pr-1 custom-scrollbar">
                            {providers.map(p => (
                                <div key={p.provider_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 group">
                                    <span className="text-xs font-bold text-[#1b2559]">{p.provider_name}</span>
                                    <Trash2 size={14} className="text-red-300 cursor-pointer hover:text-red-500 transition-colors" onClick={() => handleDelete('provider', p.provider_id)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- อัตราค่าจัดส่ง & บัญชีธนาคาร --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* 💰 อัตราค่าจัดส่ง */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-3"><Coins size={24} className="text-[#05cd99]" /> อัตราค่าจัดส่ง</h2>
                            <button onClick={() => setActiveModal('shipping_cost')} className="p-2.5 bg-[#f4f7fe] text-[#4318ff] rounded-xl border-none cursor-pointer"><Edit3 size={16} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="p-7 bg-orange-50 rounded-[30px] text-center border border-orange-100">
                                <p className="text-xs text-orange-400 font-bold mb-1 uppercase tracking-widest">ค่าส่งเริ่มต้น</p>
                                <p className="text-3xl font-black text-[#1b2559]">฿{formData.delivery_fee}</p>
                            </div>
                            <div className="p-7 bg-green-50 rounded-[30px] text-center border border-green-100">
                                <p className="text-xs text-green-400 font-bold mb-1 uppercase tracking-widest">ส่งฟรีเมื่อยอดครบ</p>
                                <p className="text-3xl font-black text-[#1b2559]">{formData.min_free_shipping} ชิ้น</p>
                            </div>
                        </div>
                    </div>

                    {/* 💳 บัญชีธนาคาร */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-3"><Landmark size={24} className="text-[#4318ff]" /> บัญชีรับชำระเงิน</h2>
                            <button onClick={() => setActiveModal('payments')} className="bg-[#4318ff] text-white px-5 py-2.5 rounded-2xl font-bold border-none cursor-pointer shadow-md flex items-center gap-2 transition-transform active:scale-95"><Plus size={16} /> เพิ่มบัญชี</button>
                        </div>
                        <div className="space-y-4">
                            {paymentMethods.length > 0 ? paymentMethods.map(m => (
                                <div key={m.method_id} className="flex justify-between items-center p-5 bg-gray-50 rounded-[28px] border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm text-[#4318ff]"><CreditCard size={20}/></div>
                                        <div>
                                            <div className="font-bold text-sm text-[#1b2559]">{m.bank_name}</div>
                                            {/* ✅ แสดงชื่อบัญชี */}
                                            <div className="text-xs font-bold text-[#e8c4a0]">{m.account_name || 'ไม่ระบุชื่อบัญชี'}</div>
                                            <div className="text-xs text-slate-400 mt-1 tracking-widest">{m.account_number}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete('payment', m.method_id)} className="p-2 text-red-300 hover:text-red-500 bg-transparent border-none cursor-pointer"><Trash2 size={18} /></button>
                                </div>
                            )) : <p className="text-center text-gray-400 italic py-5">ยังไม่มีข้อมูลบัญชีธนาคาร</p>}
                        </div>
                    </div>
                </div>

                {/* --- 📝 MODALS (ทุกอันต้องมีโค้ดชุดนี้เพื่อให้เปิดได้) --- */}
                
                {/* 1. Modal แก้ไขข้อมูลร้าน */}
                {activeModal === 'general' && (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal-box" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setActiveModal(null)} className="absolute top-8 right-8 text-gray-400 border-none bg-transparent cursor-pointer"><X size={24} /></button>
                            <h2 className="text-2xl font-black mb-10 text-[#1b2559] flex items-center gap-3"><Edit3 className="text-[#4318ff]"/> ข้อมูลหน้าร้าน</h2>
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">ชื่อร้าน</label>
                                <input className="input-field mt-2" maxLength={LIMITS.SHOP_NAME} value={formData.shop_name} onChange={e => setFormData({...formData, shop_name: e.target.value})} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">อีเมล</label>
                                    <input className="input-field mt-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                                    <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">เบอร์โทร</label>
                                    <input className="input-field mt-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                                </div>
                                <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">ที่อยู่ร้าน</label>
                                <textarea className="input-field mt-2 h-28" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                                <button type="submit" disabled={isSaving} className="w-full bg-[#4318ff] text-white py-5 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all flex justify-center items-center gap-2">
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20}/>} บันทึกข้อมูล
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* 2. Modal เพิ่มบัญชีใหม่ (รองรับ account_name) */}
                {activeModal === 'payments' && (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal-box" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setActiveModal(null)} className="absolute top-8 right-8 text-gray-400 border-none bg-transparent cursor-pointer"><X size={24} /></button>
                            <h2 className="text-2xl font-black mb-10 text-[#1b2559]">💳 เพิ่มบัญชี</h2>
                            <div className="space-y-6">
                                <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">ธนาคาร</label>
                                <input className="input-field mt-2" placeholder="เช่น กสิกรไทย" value={newPayment.bank_name} onChange={e => setNewPayment({...newPayment, bank_name: e.target.value})} /></div>
                                
                                <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">ชื่อเจ้าของบัญชี</label>
                                <input className="input-field mt-2" placeholder="ระบุชื่อบัญชี" value={newPayment.account_name} onChange={e => setNewPayment({...newPayment, account_name: e.target.value})} /></div>
                                
                                <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">เลขที่บัญชี</label>
                                <input className="input-field mt-2" placeholder="X-XXX-XXXXX-X" value={newPayment.account_number} onChange={e => setNewPayment({...newPayment, account_number: e.target.value.replace(/\D/g, '')})} /></div>
                                
                                <button onClick={handleAddPayment} className="w-full bg-[#1b2559] text-white py-5 rounded-2xl font-black shadow-lg hover:bg-black transition-all">บันทึกบัญชี</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Modal โซเชียลมีเดีย */}
                {activeModal === 'social' && (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal-box" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setActiveModal(null)} className="absolute top-8 right-8 text-gray-400 border-none bg-transparent cursor-pointer"><X size={24} /></button>
                            <h2 className="text-2xl font-black mb-8 text-[#1b2559]">🔗 ลิงก์โซเชียล</h2>
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">Facebook URL</label>
                                <input className="input-field mt-2" value={formData.facebook_url} onChange={e => setFormData({...formData, facebook_url: e.target.value})} /></div>
                                <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">Instagram URL</label>
                                <input className="input-field mt-2" value={formData.instagram_url} onChange={e => setFormData({...formData, instagram_url: e.target.value})} /></div>
                                <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">Line URL</label>
                                <input className="input-field mt-2" value={formData.line_url} onChange={e => setFormData({...formData, line_url: e.target.value})} /></div>
                                <button type="submit" className="w-full bg-[#05cd99] text-white py-5 rounded-2xl font-black shadow-lg">บันทึกโซเชียล</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* 4. Modal ค่าส่งสินค้า */}
                {activeModal === 'shipping_cost' && (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal-box" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setActiveModal(null)} className="absolute top-8 right-8 text-gray-400 border-none bg-transparent cursor-pointer"><X size={24} /></button>
                            <h2 className="text-2xl font-black mb-10 text-[#1b2559]">💰 อัตราค่าจัดส่ง</h2>
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">ค่าจัดส่งเริ่มต้น (฿)</label>
                                <input type="number" className="input-field mt-2" value={formData.delivery_fee} onChange={e => setFormData({...formData, delivery_fee: e.target.value})} /></div>
                                <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">ส่งฟรีเมื่อครบ (ชิ้น)</label>
                                <input type="number" className="input-field mt-2" value={formData.min_free_shipping} onChange={e => setFormData({...formData, min_free_shipping: e.target.value})} /></div>
                                <button type="submit" className="w-full bg-[#ffb547] text-white py-5 rounded-2xl font-black shadow-lg">บันทึกค่าส่ง</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* 5. Modal เพิ่มบริษัทขนส่ง */}
                {activeModal === 'providers' && (
                    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                        <div className="modal-box" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setActiveModal(null)} className="absolute top-8 right-8 text-gray-400 border-none bg-transparent cursor-pointer"><X size={24} /></button>
                            <h2 className="text-2xl font-black mb-10 text-[#1b2559]">🚚 เพิ่มบริษัทขนส่ง</h2>
                            <div className="space-y-6">
                                <div><label className="text-sm font-black text-gray-400 ml-2 uppercase">ชื่อบริษัทขนส่ง</label>
                                <input className="input-field mt-2" placeholder="เช่น Kerry, Flash" value={newProvider} onChange={e => setNewProvider(e.target.value)} /></div>
                                <button onClick={handleAddProvider} className="w-full bg-[#4318ff] text-white py-5 rounded-2xl font-black shadow-lg">เพิ่มข้อมูล</button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

// StatBox คอมโพเนนต์
const StatBox = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-[35px] flex justify-between items-center border border-white shadow-sm hover:shadow-md transition-all group">
        <div className="min-w-0">
            <p className="text-[#a3aed0] text-xs font-bold mb-1 uppercase tracking-widest truncate">{title}</p>
            <h2 className="text-xl font-black text-[#1b2559] truncate">{value || '-'}</h2>
        </div>
        <div style={{ background: `${color}10`, color: color }} className="p-4 rounded-2xl transition-transform group-hover:scale-110">
            {icon}
        </div>
    </div>
);

export default ShopSetting;