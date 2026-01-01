import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { 
    ArrowLeft, MapPin, CreditCard, Upload, 
    Loader2, ChevronRight, CheckCircle2, Plus, History, ShoppingBasket, Info
} from 'lucide-react';

// --- เชื่อมต่อ API ผ่านระบบส่วนกลาง ---
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';

import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const Checkout = ({ userData }) => {
    const navigate = useNavigate();
    
    // --- States ข้อมูล ---
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopSettings, setShopSettings] = useState({ delivery_fee: 180, min_free_shipping: 20 });
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [savedAddresses, setSavedAddresses] = useState([]);

    // --- States การเลือกที่อยู่ ---
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        recipient_name: '', phone_number: '', address_detail: ''
    });

    // --- States การชำระเงิน ---
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [slipFile, setSlipFile] = useState(null); 
    const [slipPreview, setSlipPreview] = useState(null);

    // 1. ดึงข้อมูลเริ่มต้นทั้งหมด
    const initCheckout = useCallback(async () => {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (localCart.length === 0) return navigate('/cart');
        
        try {
            setLoading(true);
            const [prodRes, settingsRes, paymentRes, addrRes] = await Promise.all([
                axiosInstance.post(`${API_ENDPOINTS.PRODUCTS}/sync-cart`, { ids: localCart.map(i => i.product_id) }),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/home`),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments`),
                axiosInstance.get(API_ENDPOINTS.ADDRESSES)
            ]);
            
            if (prodRes.success) {
                const merged = localCart.map(li => {
                    const dbProduct = prodRes.data.find(p => p.product_id === li.product_id);
                    return {
                        ...dbProduct,
                        quantity: li.quantity,
                        image_url: dbProduct?.images?.find(img => img.is_main)?.image_url || dbProduct?.images?.[0]?.image_url
                    };
                }).filter(i => i.product_id);
                setCartItems(merged);
            }

            if (settingsRes.success) {
                setShopSettings({
                    delivery_fee: Number(settingsRes.data.delivery_fee) || 180,
                    min_free_shipping: Number(settingsRes.data.min_free_shipping) || 20
                });
            }

            if (paymentRes.success) {
                setPaymentMethods(paymentRes.data);
                if (paymentRes.data.length > 0) setSelectedMethod(paymentRes.data[0]);
            }

            if (addrRes.success) {
                setSavedAddresses(addrRes.data);
                if (addrRes.data.length > 0) {
                    setSelectedAddressId(addrRes.data[0].address_id);
                } else {
                    setIsAddingNew(true);
                }
            }
        } catch (err) {
            console.error("Initialization error:", err);
            toast.error("ดึงข้อมูลการสั่งซื้อไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => { initCheckout(); }, [initCheckout]);

    // --- การคำนวณยอดเงิน ---
    const subtotal = cartItems.reduce((acc, i) => acc + (i.unit_price * i.quantity), 0);
    const totalQty = cartItems.reduce((acc, i) => acc + i.quantity, 0);
    const shippingCost = totalQty >= shopSettings.min_free_shipping ? 0 : shopSettings.delivery_fee;
    const totalAmount = subtotal + shippingCost;

    // --- บันทึกคำสั่งซื้อ ---
    const handleSubmitOrder = async () => {
        if (!slipFile) return Swal.fire('กรุณาแนบสลิป', 'โปรดแนบหลักฐานการโอนเงินเพื่อดำเนินการต่อ', 'warning');
        
        if (isAddingNew) {
            if (!addressForm.recipient_name || !addressForm.phone_number || !addressForm.address_detail) {
                return Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วน', 'warning');
            }
            if (addressForm.phone_number.length < 9) {
                return Swal.fire('เบอร์โทรศัพท์ไม่ถูกต้อง', 'กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก', 'warning');
            }
        } else {
            if (!selectedAddressId) return Swal.fire('กรุณาเลือกที่อยู่', 'โปรดเลือกที่อยู่ที่ต้องการจัดส่ง', 'warning');
        }

        try {
            Swal.fire({ title: 'กำลังบันทึกข้อมูล...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

            const formData = new FormData();
            formData.append('slip', slipFile);
            formData.append('order_data', JSON.stringify({
                address_id: isAddingNew ? null : selectedAddressId,
                new_address: isAddingNew ? addressForm : null,
                items: cartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.unit_price })),
                payment_method_id: selectedMethod.method_id,
                total_amount: totalAmount,
                shipping_cost: shippingCost
            }));

            const res = await axiosInstance.post(API_ENDPOINTS.ORDERS, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.success) {
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('storage'));
                Swal.fire({ icon: 'success', title: 'สั่งซื้อสำเร็จ!', text: 'ขอบคุณที่เลือกใช้บริการ SOOO GUICHAI', confirmButtonColor: '#1b2559' })
                .then(() => navigate('/profile/orders'));
            }
        } catch (err) { 
            Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกคำสั่งซื้อได้ โปรดลองอีกครั้ง', 'error'); 
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#fdfbf2]">
            <Loader2 className="animate-spin text-[#1b2559] mb-4" size={50} />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">กำลังเตรียมขั้นตอนการชำระเงิน...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fdfbf2]/40 font-['Kanit'] text-[#1b2559]">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />
            
            <main className="container mx-auto px-4 md:px-8 pt-32 pb-20 max-w-7xl">
                <div className="mb-10 text-center md:text-left">
                    <button onClick={() => navigate('/cart')} className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#1b2559] transition-all group mb-4">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> ย้อนกลับไปตะกร้าสินค้า
                    </button>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight">
                        ชำระเงิน <span className="text-[#e8c4a0]">&</span> จัดส่ง
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                        {/* --- ส่วนที่ 1: ที่อยู่จัดส่ง --- */}
                        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-gray-50 pb-6">
                                <h2 className="text-xl md:text-2xl font-black flex items-center gap-3">
                                    <MapPin className="text-[#e8c4a0]" /> 1. ที่อยู่จัดส่ง
                                </h2>
                                <div className="flex bg-gray-100 p-1.5 rounded-2xl self-start">
                                    <button onClick={() => setIsAddingNew(false)} className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${!isAddingNew ? 'bg-white shadow-sm text-[#1b2559]' : 'text-gray-400'}`}>ที่อยู่เดิม</button>
                                    <button onClick={() => setIsAddingNew(true)} className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${isAddingNew ? 'bg-white shadow-sm text-[#1b2559]' : 'text-gray-400'}`}>เพิ่มใหม่</button>
                                </div>
                            </div>

                            {!isAddingNew ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {savedAddresses.map(addr => (
                                        <div key={addr.address_id} onClick={() => setSelectedAddressId(addr.address_id)} className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all relative ${selectedAddressId === addr.address_id ? 'border-[#1b2559] bg-[#1b2559]/5' : 'border-gray-50 bg-gray-50/30'}`}>
                                            {selectedAddressId === addr.address_id && <CheckCircle2 size={24} className="absolute top-5 right-5 text-[#1b2559]" />}
                                            <p className="font-bold text-base mb-2">{addr.recipient_name}</p>
                                            <p className="text-sm text-gray-500 leading-relaxed mb-4">{addr.address_detail}</p>
                                            <p className="text-sm font-black text-[#1b2559]">{addr.phone_number}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-gray-400 ml-2">ชื่อผู้รับสินค้า</label>
                                            <input type="text" placeholder="ระบุชื่อ-นามสกุล" className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#e8c4a0] font-bold text-base" onChange={e => setAddressForm({...addressForm, recipient_name: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-gray-400 ml-2">เบอร์โทรศัพท์ติดต่อ (10 หลัก)</label>
                                            <input 
                                                type="text" 
                                                placeholder="08XXXXXXXX" 
                                                maxLength={10} // ✅ จำกัดความยาว 10 ตัวอักษรตาม Database
                                                className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#e8c4a0] font-bold text-base" 
                                                value={addressForm.phone_number}
                                                onChange={e => {
                                                    // ✅ อนุญาตเฉพาะตัวเลขเท่านั้น
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    setAddressForm({...addressForm, phone_number: val});
                                                }} 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 ml-2">ที่อยู่จัดส่งโดยละเอียด</label>
                                        <textarea placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด และรหัสไปรษณีย์" className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#e8c4a0] font-medium text-base" rows="3" onChange={e => setAddressForm({...addressForm, address_detail: e.target.value})} />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* --- ส่วนที่ 2: การชำระเงิน --- */}
                        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <h2 className="text-xl md:text-2xl font-black mb-8 flex items-center gap-3 border-b border-gray-50 pb-6">
                                <CreditCard className="text-[#e8c4a0]" /> 2. การชำระเงิน
                            </h2>
                            
                            <div className="flex flex-wrap gap-4 mb-8">
                                {paymentMethods.map(m => (
                                    <button key={m.method_id} onClick={() => setSelectedMethod(m)} className={`px-8 py-3.5 rounded-2xl border-2 font-bold text-sm transition-all ${selectedMethod?.method_id === m.method_id ? 'border-[#1b2559] bg-[#1b2559] text-white shadow-lg' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}>
                                        {m.bank_name}
                                    </button>
                                ))}
                            </div>

                            {selectedMethod && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-gray-50/50 p-8 md:p-10 rounded-[2.5rem]">
                                    <div className="space-y-6">
                                        <div className="bg-[#1b2559] text-white px-5 py-2.5 rounded-xl inline-block text-xs font-black uppercase tracking-widest">{selectedMethod.bank_name}</div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">ชื่อบัญชีรับโอน</p>
                                            <p className="text-xl md:text-2xl font-black text-[#1b2559]">{selectedMethod.account_name || 'บจก. โซกุยช่าย'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">เลขที่บัญชี</p>
                                            <p className="text-2xl md:text-3xl font-black tracking-widest text-[#1b2559]">{selectedMethod.account_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-5">
                                        <div className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-gray-100">
                                            <img src={`https://promptpay.io/${selectedMethod.account_number}/${totalAmount}.png`} className="w-56 h-56 md:w-64 md:h-64" alt="QR Code" />
                                        </div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-tighter text-center leading-relaxed italic">สแกน QR Code เพื่อชำระเงิน<br/>ยอดสุทธิ: ฿{totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                            )}

                            <label className="block mt-10 border-2 border-dashed border-gray-200 rounded-[3rem] p-10 text-center cursor-pointer hover:bg-gray-50 transition-all relative overflow-hidden group">
                                <input type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files[0]; if(f){ setSlipFile(f); setSlipPreview(URL.createObjectURL(f)); } }} />
                                {slipPreview ? (
                                    <div className="relative inline-block">
                                        <img src={slipPreview} className="max-h-80 rounded-2xl shadow-2xl animate-in zoom-in-95" alt="Slip" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                            <p className="text-white text-sm font-black uppercase">คลิกเพื่อเปลี่ยนรูป</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-5 text-gray-300 py-6">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform shadow-inner"><Upload size={32} /></div>
                                        <div className="space-y-1.5">
                                            <p className="text-base font-black text-gray-600 uppercase">แนบสลิปการโอนเงิน</p>
                                            <p className="text-sm font-medium">รองรับไฟล์ภาพ JPG, PNG (ขนาดไม่เกิน 5MB)</p>
                                        </div>
                                    </div>
                                )}
                            </label>
                        </section>
                    </div>

                    {/* --- ส่วนขวา: สรุปยอดเงิน (4/12) --- */}
                    <div className="lg:col-span-4 lg:sticky lg:top-28">
                        <div className="bg-[#1b2559] text-white p-8 md:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8c4a0]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            
                            <h2 className="text-xl font-black mb-8 border-b border-white/10 pb-5 flex items-center gap-3">
                                <ShoppingBasket className="text-[#e8c4a0]" size={22} /> รายการสั่งซื้อ
                            </h2>
                            
                            <div className="space-y-6 mb-10 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map(i => (
                                    <div key={i.product_id} className="flex gap-4 items-center group">
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl overflow-hidden shrink-0 border border-white/5 group-hover:scale-105 transition-transform">
                                            <img src={i.image_url || '/placeholder.png'} className="w-full h-full object-cover" alt={i.product_name} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{i.product_name}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs opacity-60">จำนวน {i.quantity} ชิ้น</span>
                                                <span className="text-base font-black text-[#e8c4a0]">฿{(i.unit_price * i.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-8 border-t border-white/10 mt-6">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-60">
                                    <span>ราคารวมสินค้า</span>
                                    <span>฿{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-60">
                                    <span>ค่าจัดส่งสินค้า</span>
                                    <span>{shippingCost === 0 ? <b className="text-green-400">ฟรีจัดส่ง!</b> : `฿${shippingCost.toLocaleString()}`}</span>
                                </div>
                                {!shippingCost && (
                                    <div className="bg-green-400/10 p-3.5 rounded-2xl flex items-center gap-3 border border-green-400/20 animate-in fade-in">
                                        <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                                        <p className="text-[11px] font-black uppercase text-green-400 tracking-tighter">จัดส่งฟรีแบบพรีเมียมให้คุณ!</p>
                                    </div>
                                )}
                                <div className="pt-8 border-t border-white/10 mt-8">
                                    <span className="text-[11px] font-black opacity-30 uppercase tracking-[0.4em]">Grand Total</span>
                                    <div className="flex justify-between items-end mt-1.5">
                                        <p className="text-base font-bold opacity-60">ยอดชำระสุทธิ</p>
                                        <span className="text-4xl md:text-5xl font-black text-[#e8c4a0] tracking-tighter">฿{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button onClick={handleSubmitOrder} className="w-full mt-10 py-5.5 bg-[#e8c4a0] text-[#1b2559] rounded-[2.5rem] font-black text-xl hover:bg-white transition-all shadow-xl active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3 group">
                                ยืนยันการสั่งซื้อ <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Checkout;