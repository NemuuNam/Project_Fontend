import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowLeft, MapPin, CreditCard, Upload,
    Loader2, ChevronRight, CheckCircle2, 
    Landmark, Smile, Leaf, Cookie, Sparkles, Receipt,
    User, Home, Plus, X, ShoppingBag, Copy, Heart, Info, AlertCircle
} from 'lucide-react';

import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const Checkout = ({ userData }) => {
    const navigate = useNavigate();
    const addressSectionRef = useRef(null);

    // --- 📦 สเตทข้อมูล ---
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopSettings, setShopSettings] = useState({ delivery_fee: 0, min_free_shipping: 0 });
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [savedAddresses, setSavedAddresses] = useState([]);

    const [isAddingNew, setIsAddingNew] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({ recipient_name: '', phone_number: '', address_detail: '' });
    
    const [errors, setErrors] = useState({});
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [slipFile, setSlipFile] = useState(null);
    const [slipPreview, setSlipPreview] = useState(null);

    // --- 🛠️ ระบบจัดรูปแบบอัตโนมัติ ---
    const formatBankNumber = (num) => {
        if (!num) return '';
        const cleaned = num.toString().replace(/\D/g, '');
        return cleaned.length === 10 ? `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4, 9)}-${cleaned.slice(9)}` : cleaned;
    };

    const formatPhoneNumber = (val) => {
        const cleaned = val.replace(/\D/g, '');
        if (cleaned.length <= 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
        return cleaned;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("คัดลอกเลขบัญชีแล้ว", { style: { borderRadius: '15px', background: '#2D241E', color: '#fff' } });
    };

    // --- 🧮 การคำนวณยอดรวม ---
    const { subtotal, shippingCost, isFreeShipping, totalAmount, totalItemsCount } = useMemo(() => {
        const sub = cartItems.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0);
        const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        const fee = Number(shopSettings.delivery_fee) || 0;
        const minItems = Number(shopSettings.min_free_shipping) || 0;
        const free = minItems > 0 && count >= minItems;
        const ship = free ? 0 : fee;
        return { subtotal: sub, shippingCost: ship, isFreeShipping: free, totalAmount: sub + ship, totalItemsCount: count };
    }, [cartItems, shopSettings]);

    // --- 🔄 การดึงข้อมูล ---
    const initCheckout = useCallback(async () => {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (localCart.length === 0) return navigate('/cart');
        try {
            setLoading(true);
            const [prodRes, settingsRes, paymentRes, addrRes] = await Promise.all([
                axiosInstance.post(`${API_ENDPOINTS.PRODUCTS}/sync-cart`, { ids: localCart.map(i => i.product_id) }),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments`),
                axiosInstance.get(API_ENDPOINTS.ADDRESSES)
            ]);

            if (prodRes.success) {
                setCartItems(localCart.map(li => {
                    const dbProduct = prodRes.data.find(p => p.product_id === li.product_id);
                    return { ...dbProduct, quantity: li.quantity, image_url: dbProduct?.images?.find(img => img.is_main)?.image_url || dbProduct?.images?.[0]?.image_url };
                }).filter(i => i.product_id));
            }
            if (settingsRes.success) {
                setShopSettings({ 
                    delivery_fee: parseFloat(settingsRes.data.delivery_fee) || 0, 
                    min_free_shipping: parseInt(settingsRes.data.min_free_shipping, 10) || 0 
                });
            }
            if (paymentRes.success && paymentRes.data.length > 0) {
                setPaymentMethods(paymentRes.data);
                setSelectedMethod(paymentRes.data[0]);
            }
            if (addrRes.success) {
                setSavedAddresses(addrRes.data);
                if (addrRes.data.length > 0) setSelectedAddressId(addrRes.data[0].address_id);
                else setIsAddingNew(true);
            }
        } catch (err) { toast.error("การเชื่อมต่อระบบขัดข้อง"); } 
        finally { setLoading(false); }
    }, [navigate]);

    useEffect(() => { initCheckout(); }, [initCheckout]);

    // --- ✅ Form Validation ---
    const validateForm = () => {
        let newErrors = {};
        if (isAddingNew) {
            if (!addressForm.recipient_name.trim()) newErrors.recipient_name = "กรุณาระบุชื่อผู้รับ";
            if (addressForm.phone_number.replace(/\D/g, '').length !== 10) newErrors.phone_number = "เบอร์โทรศัพท์ต้องครบ 10 หลัก";
            if (!addressForm.address_detail.trim()) newErrors.address_detail = "กรุณาระบุที่อยู่";
        } else if (!selectedAddressId) {
            newErrors.address = "กรุณาเลือกที่อยู่จัดส่ง";
        }
        if (!slipFile) newErrors.slip = "กรุณาแนบสลิปโอนเงิน";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { 
            setSlipFile(file); 
            setSlipPreview(URL.createObjectURL(file)); 
            setErrors(prev => ({ ...prev, slip: null })); 
        }
    };

    // --- 🚀 แก้ไขฟังก์ชัน handleSubmitOrder ---
    const handleSubmitOrder = async () => {
        if (!validateForm()) {
            toast.error("กรุณาตรวจสอบข้อมูลให้ถูกต้อง");
            return;
        }
        try {
            Swal.fire({ title: 'กำลังประมวลผล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            let finalAddressId = selectedAddressId;

            // ✨ แก้ไขจุด Error 500: Clean ข้อมูลที่อยู่ก่อนส่ง
            if (isAddingNew) {
                const cleanedAddressData = {
                    recipient_name: addressForm.recipient_name.trim(),
                    phone_number: addressForm.phone_number.replace(/\D/g, ''), // ลบขีดออกให้เหลือ 10 หลัก
                    address_detail: addressForm.address_detail.trim()
                };

                const addrRes = await axiosInstance.post(API_ENDPOINTS.ADDRESSES, cleanedAddressData);
                
                if (addrRes.success) {
                    finalAddressId = addrRes.data.address_id;
                } else {
                    throw new Error(addrRes.message || "ไม่สามารถบันทึกที่อยู่ได้");
                }
            }

            const formData = new FormData();
            formData.append('slip', slipFile);
            formData.append('order_data', JSON.stringify({
                address_id: finalAddressId,
                total_amount: totalAmount,
                shipping_cost: shippingCost,
                items: cartItems.map(i => ({ 
                    product_id: i.product_id, 
                    quantity: i.quantity, 
                    price: i.unit_price 
                }))
            }));

            const res = await axiosInstance.post(API_ENDPOINTS.ORDERS, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });

            if (res.success) {
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('storage'));
                Swal.fire({ 
                    icon: 'success', 
                    title: 'สั่งซื้อสำเร็จ!', 
                    text: 'เราได้รับออเดอร์ของคุณเรียบร้อยแล้ว',
                    confirmButtonColor: '#2D241E',
                    customClass: { popup: 'rounded-[3rem] font-["Kanit"]' }
                }).then(() => navigate('/my-orders'));
            }
        } catch (err) {
            console.error("Order Error:", err);
            Swal.fire({ 
                icon: 'error', 
                title: 'ขออภัย!', 
                text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง',
                confirmButtonColor: '#2D241E',
                customClass: { popup: 'rounded-[3rem] font-["Kanit"]' }
            });
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={48} /></div>;

    return (
        <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden selection:bg-[#F3E9DC] relative">
            <Toaster position="bottom-center" />
            <HeaderHome userData={userData} />

            {/* --- ☁️ Cozy Patterns Background --- */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0 overflow-hidden">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12" size={200} />
                <Cookie className="absolute bottom-[20%] right-[5%] -rotate-12" size={180} />
                <Sparkles className="absolute top-[30%] right-[15%]" size={150} />
                <Smile className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 opacity-[0.1]" size={400} />
            </div>

            <main className="relative z-10 max-w-[1366px] mx-auto px-6 md:px-10 pt-28 md:pt-40 pb-32">
                <div className="mb-16 text-left">
                    <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-xs md:text-sm font-black text-[#C2B8A3] hover:text-[#2D241E] mb-6 uppercase tracking-widest transition-all group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> ย้อนกลับไปตะกร้า
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-12 bg-[#D97706] rounded-full"></div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">ยืนยันการสั่งซื้อ</h1>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 md:gap-20 items-start">
                    <div className="flex-1 space-y-12 w-full text-left">
                        
                        {/* 1. ที่อยู่จัดส่ง - Pearl White Style */}
                        <section ref={addressSectionRef} className="bg-white p-8 md:p-14 rounded-[4rem] shadow-sm border border-slate-100 relative">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-12">
                                <h2 className="text-2xl md:text-3xl font-black italic uppercase flex items-center gap-5">
                                    <span className="text-[#C2B8A3] text-xl not-italic">01.</span> ที่อยู่จัดส่ง
                                </h2>
                                <div className="flex bg-white p-1 rounded-full border border-slate-100 shadow-inner">
                                    <button onClick={() => setIsAddingNew(false)} className={`flex-1 sm:px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!isAddingNew ? 'bg-white shadow-md text-[#2D241E] border border-slate-100' : 'text-[#C2B8A3]'}`}>เลือกที่อยู่เดิม</button>
                                    <button onClick={() => setIsAddingNew(true)} className={`flex-1 sm:px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isAddingNew ? 'bg-white shadow-md text-[#2D241E] border border-slate-100' : 'text-[#C2B8A3]'}`}>+ เพิ่มใหม่</button>
                                </div>
                            </div>

                            {isAddingNew ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-[#C2B8A3] ml-4 tracking-widest">ชื่อผู้รับ</label>
                                        <input placeholder="ชื่อ-นามสกุล" className={`w-full px-8 py-5 rounded-[2rem] bg-white border-2 transition-all text-lg font-bold outline-none ${errors.recipient_name ? 'border-red-100' : 'border-slate-100 focus:border-[#F3E9DC]'}`} value={addressForm.recipient_name} onChange={e => setAddressForm({...addressForm, recipient_name: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-[#C2B8A3] ml-4 tracking-widest">เบอร์โทรศัพท์</label>
                                        <input placeholder="08X-XXX-XXXX" className={`w-full px-8 py-5 rounded-[2rem] bg-white border-2 transition-all text-lg font-bold outline-none ${errors.phone_number ? 'border-red-100' : 'border-slate-100 focus:border-[#F3E9DC]'}`} value={addressForm.phone_number} onChange={e => setAddressForm({...addressForm, phone_number: formatPhoneNumber(e.target.value)})} maxLength={12} />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase text-[#C2B8A3] ml-4 tracking-widest">รายละเอียดที่อยู่</label>
                                        <textarea placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, รหัสไปรษณีย์" className={`w-full px-8 py-6 rounded-[2.5rem] bg-white border-2 transition-all text-lg font-medium outline-none resize-none ${errors.address_detail ? 'border-red-100' : 'border-slate-100 focus:border-[#F3E9DC]'}`} rows="3" value={addressForm.address_detail} onChange={e => setAddressForm({...addressForm, address_detail: e.target.value})} />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {savedAddresses.map(addr => (
                                        <div key={addr.address_id} onClick={() => setSelectedAddressId(addr.address_id)} className={`p-8 rounded-[3rem] border-2 cursor-pointer transition-all duration-500 relative group ${selectedAddressId === addr.address_id ? 'border-[#F3E9DC] bg-white shadow-lg' : 'border-slate-100 bg-white hover:shadow-md'}`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-3 rounded-2xl ${selectedAddressId === addr.address_id ? 'bg-[#2D241E] text-white' : 'bg-slate-50 text-[#C2B8A3]'}`}><Home size={20} /></div>
                                                {selectedAddressId === addr.address_id && <CheckCircle2 size={24} className="text-[#D97706]" />}
                                            </div>
                                            <p className="font-black text-xl uppercase italic leading-none mb-3">{addr.recipient_name}</p>
                                            <p className="text-sm text-[#A8A294] font-medium line-clamp-2 mb-6">{addr.address_detail}</p>
                                            <p className="text-base font-black border-t border-slate-100 pt-5">{formatPhoneNumber(addr.phone_number)}</p>
                                        </div>
                                    ))}
                                    <button onClick={() => setIsAddingNew(true)} className="flex flex-col items-center justify-center p-10 rounded-[3rem] border-2 border-dashed border-slate-100 text-[#C2B8A3] hover:border-[#2D241E] hover:text-[#2D241E] transition-all bg-white group">
                                        <Plus size={32} />
                                        <span className="text-[10px] font-black uppercase mt-4 tracking-widest">เพิ่มข้อมูลใหม่</span>
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* 2. การชำระเงิน - Pearl White Style */}
                        <section className="bg-white p-8 md:p-14 rounded-[4rem] shadow-sm border border-slate-100">
                            <h2 className="text-2xl md:text-3xl font-black italic uppercase flex items-center gap-5 mb-12">
                                <span className="text-[#C2B8A3] text-xl not-italic">02.</span> ชำระเงิน
                            </h2>
                            <div className="flex flex-wrap gap-3 mb-10">
                                {paymentMethods.map(m => (
                                    <button key={m.method_id} onClick={() => setSelectedMethod(m)} className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedMethod?.method_id === m.method_id ? 'bg-[#2D241E] text-white border-[#2D241E] shadow-xl' : 'bg-white text-[#C2B8A3] border-slate-200 hover:border-slate-300'}`}>{m.bank_name}</button>
                                ))}
                            </div>

                            {selectedMethod && (
                                <div className="space-y-10">
                                    <div className="group relative bg-white p-10 md:p-14 rounded-[3.5rem] border border-[#F3E9DC] shadow-sm overflow-hidden">
                                        <Landmark className="absolute -left-10 -bottom-10 opacity-[0.03] -rotate-12" size={200} />
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10 text-center md:text-left">
                                            <div>
                                                <p className="text-[10px] font-black text-[#C2B8A3] uppercase tracking-[0.4em] mb-3">บัญชีธนาคาร</p>
                                                <p className="text-2xl md:text-3xl font-black italic uppercase leading-none">{selectedMethod.account_name}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-4xl md:text-6xl font-black italic tracking-tighter">{formatBankNumber(selectedMethod.account_number)}</p>
                                                <button onClick={() => copyToClipboard(selectedMethod.account_number)} className="p-4 bg-slate-50 hover:bg-[#2D241E] hover:text-white rounded-2xl transition-all shadow-sm"><Copy size={18}/></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`relative border-4 border-dashed rounded-[3.5rem] p-12 md:p-16 flex flex-col items-center justify-center transition-all duration-700 group ${slipPreview ? 'border-emerald-100' : errors.slip ? 'border-red-100 bg-red-50/5' : 'border-slate-100 bg-white hover:border-[#F3E9DC]'}`}>
                                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={handleFileChange} />
                                        {slipPreview ? (
                                            <div className="relative z-30">
                                                <img src={slipPreview} className="w-56 h-72 object-cover rounded-[2rem] shadow-2xl border-8 border-white mx-auto" alt="สลิปโอนเงิน" />
                                                <button onClick={(e) => {e.stopPropagation(); setSlipFile(null); setSlipPreview(null);}} className="absolute -top-4 -right-4 bg-white text-red-500 rounded-full p-4 shadow-xl border border-slate-50 transition-all"><X size={18}/></button>
                                            </div>
                                        ) : (
                                            <div className="text-center pointer-events-none">
                                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform"><Upload className="text-[#C2B8A3]" size={32} /></div>
                                                <p className="text-[10px] font-black uppercase tracking-widest mb-2">อัปโหลดสลิปการโอน</p>
                                                <p className="text-[#C2B8A3] text-[9px] font-bold italic uppercase">รองรับไฟล์รูปภาพเท่านั้น</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* ฝั่งขวา: สรุปรายการสินค้า */}
                    <div className="w-full lg:w-[420px] xl:w-[480px] lg:sticky lg:top-36">
                        <div className="bg-white p-10 md:p-14 rounded-[4.5rem] shadow-lg border border-slate-100 relative overflow-hidden group text-left">
                            <Receipt className="absolute -top-16 -right-16 opacity-[0.02] -rotate-12" size={300} />
                            <h3 className="text-3xl font-black italic uppercase mb-12 pb-6 border-b border-slate-100 relative z-10">รายการขนม</h3>
                            <div className="space-y-8 mb-14 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                                {cartItems.map(item => (
                                    <div key={item.product_id} className="flex gap-6 items-center">
                                        <img src={item.image_url} className="w-16 h-16 rounded-2xl border border-slate-100 shadow-sm shrink-0 object-cover" alt={item.product_name} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-xs uppercase truncate italic">{item.product_name}</p>
                                            <p className="text-[10px] text-[#C2B8A3] font-black uppercase tracking-widest">{item.quantity} ชิ้น — ฿{Number(item.unit_price).toLocaleString()}</p>
                                        </div>
                                        <p className="font-black text-lg italic tracking-tight text-[#2D241E]">฿{(item.unit_price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-5 mb-14 relative z-10 border-t border-slate-100 pt-8 ">
                                <div className="flex justify-between text-xs font-black uppercase text-[#C2B8A3] tracking-widest">
                                    <span className="text-2xl font-black uppercase text-[#C2B8A3] tracking-tighter italic">ยอดรวมสินค้า</span>
                                    <span className="text-[#2D241E] text-2xl">฿{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase text-[#C2B8A3] tracking-widest">
                                    <span className="text-2xl font-black uppercase text-[#C2B8A3] tracking-tighter italic">ค่าจัดส่ง</span>
                                    {isFreeShipping ? <span className="text-emerald-500 italic text-2xl">ฟรีจัดส่ง</span> : <span className="text-[#2D241E] text-2xl">฿{shippingCost.toLocaleString()}</span>}
                                </div>
                                {!isFreeShipping && shopSettings.min_free_shipping > 0 && (
                                    <div className="p-4 bg-white border border-[#F3E9DC] rounded-2xl flex gap-3 items-center text-[#8B7E66] shadow-sm">
                                        <Info size={16} className="text-[#D97706] shrink-0" />
                                        <p className="text-[20px] font-bold uppercase tracking-wider">
                                            ซื้อเพิ่มอีก <span className="text-[#D97706]">{shopSettings.min_free_shipping - totalItemsCount} ชิ้น</span> เพื่อส่งฟรี!
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-10 border-t-4 border-[#2D241E] mb-14 relative z-10">
                                <div className="flex justify-between items-end">
                                    <div><p className="text-xs font-black text-[#D97706] uppercase tracking-[0.4em] mb-2">ยอดสุทธิ</p><span className="text-3xl font-black uppercase text-[#C2B8A3] tracking-tighter italic">Net total</span></div>
                                    <p className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none">฿{totalAmount.toLocaleString()}</p>
                                </div>
                            </div>

                            <button onClick={handleSubmitOrder} className="w-full bg-white text-[#2D241E] border border-slate-200 py-7 md:py-9 rounded-full font-black uppercase tracking-[0.4em] text-[10px] md:text-xs shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4 relative z-10 group overflow-hidden">
                                <span className="relative z-10">ยืนยันการสั่งซื้อ</span>
                                <ChevronRight size={18} className="text-[#D97706] relative z-10 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #F3E9DC; border-radius: 10px; }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
            `}} />
        </div>
    );
};

export default Checkout;