import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowLeft, MapPin, CreditCard, Upload,
    Loader2, ChevronRight, CheckCircle2, ShoppingBasket, Info
} from 'lucide-react';

import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const Checkout = ({ userData }) => {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopSettings, setShopSettings] = useState({ delivery_fee: 180, min_free_shipping: 20 });
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [savedAddresses, setSavedAddresses] = useState([]);

    const [isAddingNew, setIsAddingNew] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({ recipient_name: '', phone_number: '', address_detail: '' });

    const [selectedMethod, setSelectedMethod] = useState(null);
    const [slipFile, setSlipFile] = useState(null);
    const [slipPreview, setSlipPreview] = useState(null);

    const formatAccountNumber = (number) => {
        if (!number) return '';
        const cleaned = number.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4, 9)}-${cleaned.slice(9, 10)}`;
        }
        return number;
    };

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
                    return { ...dbProduct, quantity: li.quantity, image_url: dbProduct?.images?.find(img => img.is_main)?.image_url || dbProduct?.images?.[0]?.image_url };
                }).filter(i => i.product_id);
                setCartItems(merged);
            }

            if (settingsRes.success) setShopSettings({ delivery_fee: Number(settingsRes.data.delivery_fee), min_free_shipping: Number(settingsRes.data.min_free_shipping) });
            if (paymentRes.success && paymentRes.data.length > 0) {
                setPaymentMethods(paymentRes.data);
                setSelectedMethod(paymentRes.data[0]);
            }
            if (addrRes.success) {
                setSavedAddresses(addrRes.data);
                if (addrRes.data.length > 0) setSelectedAddressId(addrRes.data[0].address_id);
                else setIsAddingNew(true);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [navigate]);

    useEffect(() => { initCheckout(); }, [initCheckout]);

    const subtotal = cartItems.reduce((acc, i) => acc + (i.unit_price * i.quantity), 0);
    const shippingCost = cartItems.reduce((acc, i) => acc + i.quantity, 0) >= shopSettings.min_free_shipping ? 0 : shopSettings.delivery_fee;
    const totalAmount = subtotal + shippingCost;

    const handleSubmitOrder = async () => {
        if (!slipFile) return Swal.fire('กรุณาแนบสลิป', 'โปรดแนบหลักฐานการโอนเงิน', 'warning');
        try {
            Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
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
            const res = await axiosInstance.post(API_ENDPOINTS.ORDERS, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.success) {
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('storage'));
                Swal.fire({ icon: 'success', title: 'สั่งซื้อสำเร็จ!', confirmButtonColor: '#0f172a' }).then(() => navigate('/profile/orders'));
            }
        } catch (err) { Swal.fire('ผิดพลาด', 'ลองใหม่อีกครั้ง', 'error'); }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-900" size={60} /></div>;

    return (
        <div className="min-h-screen bg-white font-['Kanit'] text-slate-900">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            <main className="w-full max-w-[1440px] mx-auto px-4 md:px-8 pb-10 pt-16 md:pt-20 lg:pt-24">
                <div className="mb-10 text-center lg:text-left">
                    <button onClick={() => navigate('/cart')} className="inline-flex items-center gap-2 text-base font-bold text-slate-400 hover:text-slate-900 mb-4 transition-all">
                        <ArrowLeft size={18} /> ย้อนกลับ
                    </button>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-slate-900">ชำระเงิน <span className="text-slate-200">&</span> จัดส่ง</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    {/* Left Column */}
                    <div className="w-full lg:w-[65%] space-y-10">
                        {/* 1. ที่อยู่ */}
                        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-[0_10px_50px_rgba(0,0,0,0.05)] border border-slate-100">
                            <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8 border-b pb-6">
                                <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3"><MapPin className="text-slate-400" /> 1. ที่อยู่จัดส่ง</h2>
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl self-start">
                                    <button onClick={() => setIsAddingNew(false)} className={`px-6 py-3 rounded-xl text-lg font-black transition-all ${!isAddingNew ? 'bg-white shadow-md text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>ที่อยู่เดิม</button>
                                    <button onClick={() => setIsAddingNew(true)} className={`px-6 py-3 rounded-xl text-lg font-black transition-all ${isAddingNew ? 'bg-white shadow-md text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>เพิ่มใหม่</button>
                                </div>
                            </div>
                            {!isAddingNew ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {savedAddresses.map(addr => (
                                        <div key={addr.address_id} onClick={() => setSelectedAddressId(addr.address_id)} className={`p-6 rounded-[2rem] border-2 cursor-pointer relative transition-all ${selectedAddressId === addr.address_id ? 'border-slate-900 bg-slate-50' : 'border-slate-50 bg-gray-50/50 hover:border-slate-200'}`}>
                                            {selectedAddressId === addr.address_id && <CheckCircle2 size={24} className="absolute top-4 right-4 text-slate-900" />}
                                            <p className="font-black text-xl mb-1">{addr.recipient_name}</p>
                                            <p className="text-slate-500 text-sm mb-4 leading-relaxed">{addr.address_detail}</p>
                                            <p className="font-bold text-slate-900">{addr.phone_number}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="ชื่อผู้รับ" className="w-full p-5 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-slate-900 font-bold text-lg" onChange={e => setAddressForm({ ...addressForm, recipient_name: e.target.value })} />
                                        <input type="text" placeholder="เบอร์โทรศัพท์" className="w-full p-5 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-slate-900 font-bold text-lg" onChange={e => setAddressForm({ ...addressForm, phone_number: e.target.value })} />
                                    </div>
                                    <textarea placeholder="ที่อยู่ละเอียด" className="w-full p-5 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-slate-900 font-medium text-lg" rows="3" onChange={e => setAddressForm({ ...addressForm, address_detail: e.target.value })} />
                                </div>
                            )}
                        </section>

                        {/* 2. การชำระเงิน */}
                        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-[0_10px_50px_rgba(0,0,0,0.05)] border border-slate-100">
                            <h2 className="text-2xl md:text-3xl font-black mb-8 border-b pb-6 flex items-center gap-3"><CreditCard className="text-slate-400" /> 2. การชำระเงิน</h2>

                            <div className="flex flex-wrap gap-3 mb-10">
                                {paymentMethods.map(m => (
                                    <button
                                        key={m.method_id}
                                        onClick={() => setSelectedMethod(m)}
                                        className={`
        relative px-10 py-6 rounded-[2rem] border-2 transition-all duration-300 group
        ${selectedMethod?.method_id === m.method_id
                                                ? 'border-slate-900 bg-white text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.12)] -translate-y-1.5'
                                                : 'border-slate-50 bg-white text-slate-400 shadow-sm hover:shadow-xl hover:border-slate-200 hover:-translate-y-1'
                                            }
    `}
                                    >
                                        {/* ไอคอน Checkmark แสดงเมื่อเลือก */}
                                        {selectedMethod?.method_id === m.method_id && (
                                            <div className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1.5 shadow-lg animate-in zoom-in-50 duration-300">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        )}

                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`text-xs font-black uppercase tracking-[0.2em] mb-1 transition-colors ${selectedMethod?.method_id === m.method_id ? 'text-slate-400' : 'text-slate-300'}`}>
                                                Payment Option
                                            </span>
                                            <span className="text-2xl font-black tracking-tight uppercase">
                                                {m.bank_name}
                                            </span>
                                        </div>

                                        {/* แถบสีด้านล่างปุ่มเพื่อเพิ่มมิติเมื่อเลือก */}
                                        {selectedMethod?.method_id === m.method_id && (
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-900 rounded-full opacity-20"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {selectedMethod && (
                                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10">
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">ชื่อบัญชี</h4>
                                            <p className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">{selectedMethod.account_name}</p>
                                        </div>
                                        <div className="pt-8 border-t border-slate-50">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">เลขที่บัญชี</h4>
                                            <p className="text-4xl md:text-6xl font-black text-slate-900 tracking-widest leading-none">
                                                {formatAccountNumber(selectedMethod.account_number)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <label className="block mt-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 text-center cursor-pointer hover:bg-slate-50 group transition-all relative">
                                <input type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setSlipFile(f); setSlipPreview(URL.createObjectURL(f)); } }} />
                                {slipPreview ? (
                                    <div className="relative inline-block">
                                        <img src={slipPreview} className="max-h-80 rounded-2xl shadow-xl" alt="Slip" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl text-white font-black text-xl">คลิกเพื่อเปลี่ยนรูป</div>
                                    </div>
                                ) : (
                                    <div className="text-slate-400 py-6">
                                        <Upload size={54} className="mx-auto mb-4 opacity-40 group-hover:scale-110 transition-transform" />
                                        <p className="text-2xl font-black uppercase tracking-tight text-slate-600">แนบสลิปหลักฐานการโอนเงิน</p>
                                        <p className="text-base font-medium mt-1">คลิกเพื่อเลือกไฟล์ภาพจากเครื่อง</p>
                                    </div>
                                )}
                            </label>
                        </section>
                    </div>

                    {/* ✅ Right Column: สรุปรายการ */}
                    <div className="w-full lg:w-[35%] lg:sticky lg:top-32">
                        <div className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.06)] border border-slate-100">
                            <h2 className="text-3xl font-black mb-10 border-b pb-8 flex items-center gap-4"><ShoppingBasket size={32} /> สรุปการสั่งซื้อ</h2>

                            <div className="space-y-8 mb-10 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map(i => (
                                    <div key={i.product_id} className="flex gap-5 items-center group">
                                        <div className="relative w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 group-hover:scale-105 transition-transform">
                                            <img src={i.image_url || '/placeholder.png'} className="w-full h-full object-cover" alt={i.product_name} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black truncate text-xl mb-1 text-slate-900">{i.product_name}</p>
                                            {/* ✅ ราคาและจำนวนขนาดใหญ่ (text-2xl) */}
                                            <div className="flex justify-between items-center text-slate-500">
                                                <span className="text-2xl font-bold">x {i.quantity}</span>
                                                <span className="text-2xl font-black text-slate-900">฿{(i.unit_price * i.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6 pt-10 border-t-2 border-slate-50 font-bold">
                                <div className="flex justify-between text-slate-900">
                                    <span className="text-xl">ยอดรวมสินค้า</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">฿{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-900">
                                    <span className="text-xl">ค่าจัดส่ง</span>
                                    {shippingCost === 0 ? (
                                        <span className="text-2xl font-black text-green-500 italic underline decoration-4 decoration-green-100">ฟรี!</span>
                                    ) : (
                                        <span className="text-2xl font-black text-slate-900 tracking-tight">฿{shippingCost.toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="pt-10 border-t-4 border-slate-900 mt-10 text-right">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] block mb-2">Grand Total</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="text-2xl font-black text-slate-900">ยอดชำระสุทธิ</p>
                                        <span className="text-4xl font-black tracking-tighter italic text-slate-900 leading-none">฿{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSubmitOrder} className="w-full mt-12 py-7 bg-slate-100 text-black rounded-[2.2rem] font-black text-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-2xl uppercase tracking-[0.1em] flex items-center justify-center gap-4 group">
                                ยืนยันการสั่งซื้อ <ChevronRight size={30} className="group-hover:translate-x-2 transition-transform" />
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