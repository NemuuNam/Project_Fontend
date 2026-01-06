import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowLeft, 
  CreditCard, Loader2, Info 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const Cart = ({ userData }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopSettings, setShopSettings] = useState({ delivery_fee: 0, min_free_shipping: 0 });

  const fetchSettings = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/home`);
      if (res.success) {
        setShopSettings({
          delivery_fee: Number(res.data.delivery_fee) || 0,
          min_free_shipping: Number(res.data.min_free_shipping) || 0
        });
      }
    } catch (err) { console.error(err); }
  }, []);

  const syncCartWithDatabase = useCallback(async () => {
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (localCart.length === 0) { setCartItems([]); return; }
    try {
      const productIds = localCart.map(item => item.product_id);
      const res = await axiosInstance.post(`${API_ENDPOINTS.PRODUCTS}/sync-cart`, { ids: productIds });
      if (res.success) {
        const mergedCart = localCart.map(localItem => {
          const latestInfo = res.data.find(p => p.product_id === localItem.product_id);
          if (!latestInfo) return null;
          return {
            ...latestInfo,
            quantity: Math.min(localItem.quantity, latestInfo.stock_quantity),
            image_url: latestInfo.images?.find(img => img.is_main)?.image_url || latestInfo.images?.[0]?.image_url
          };
        }).filter(Boolean);
        setCartItems(mergedCart);
        localStorage.setItem('cart', JSON.stringify(mergedCart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))));
      }
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const initCart = async () => {
      setLoading(true);
      await Promise.all([syncCartWithDatabase(), fetchSettings()]);
      setLoading(false);
    };
    initCart();
  }, [syncCartWithDatabase, fetchSettings]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isFreeShipping = totalItemsCount >= shopSettings.min_free_shipping;
  const currentShipping = isFreeShipping ? 0 : shopSettings.delivery_fee;
  const finalTotal = subtotal + currentShipping;

  const updateQuantity = (id, delta) => {
    const updated = cartItems.map(item => {
      if (item.product_id === id) {
        const newQty = Math.max(1, Math.min(item.quantity + delta, item.stock_quantity));
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated.map(i => ({ product_id: i.product_id, quantity: i.quantity }))));
    window.dispatchEvent(new Event('storage'));
  };

  const removeItem = (id) => {
    Swal.fire({
      title: 'ลบสินค้า?',
      text: "คุณต้องการนำสินค้าชิ้นนี้ออกจากตะกร้าใช่หรือไม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      confirmButtonText: 'ลบออก',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = cartItems.filter(item => item.product_id !== id);
        setCartItems(updated);
        localStorage.setItem('cart', JSON.stringify(updated.map(i => ({ product_id: i.product_id, quantity: i.quantity }))));
        window.dispatchEvent(new Event('storage'));
        toast.success("ลบสินค้าเรียบร้อยแล้ว");
      }
    });
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-900" size={60} />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white font-['Kanit'] text-slate-900">
      <Toaster position="bottom-right" />
      <HeaderHome userData={userData} />
      
      {/* ปรับแก้ส่วน Main ให้ขยายเต็มพื้นที่ iPad Pro (1024px) */}
      <main className="flex-grow w-full max-w-[1366px] mx-auto px-4 sm:px-8 lg:px-10 py-10 md:py-16">
        
        {/* Header */}
        <div className="mb-10">
          <button 
            onClick={() => navigate('/products')} 
            className="inline-flex items-center gap-2 text-base font-bold text-slate-400 hover:text-slate-900 mb-4 transition-all"
          >
            <ArrowLeft size={20} /> เลือกเมนูเพิ่มเติม
          </button>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
            ตะกร้าของฉัน <span className="text-red-500">({cartItems.length})</span>
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <ShoppingBag size={80} className="mx-auto text-slate-200 mb-6" />
            <h2 className="text-2xl font-bold text-slate-400">ยังไม่มีสินค้าในตะกร้า</h2>
            <button onClick={() => navigate('/products')} className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black">
              ดูเมนูอาหารทั้งหมด
            </button>
          </div>
        ) : (
          /* ปรับ Grid ให้แบ่งพื้นที่ฝั่งขวาให้กว้างขึ้นสำหรับ iPad Pro */
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
            
            {/* รายการสินค้า (ซ้าย) */}
            <div className="w-full lg:w-[60%] xl:w-[65%] space-y-6">
              {cartItems.map((item) => (
                <div key={item.product_id} className="bg-white p-6 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-slate-100 hover:border-slate-300 transition-all">
                  <div className="w-40 h-40 shrink-0 overflow-hidden rounded-[2rem] bg-slate-50">
                    <img src={item.image_url || '/placeholder.png'} alt={item.product_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.category?.category_name}</span>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">{item.product_name}</h3>
                    <p className="text-3xl font-black text-slate-900 mt-1">฿{item.unit_price.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-center sm:items-end gap-5">
                    <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-full border border-slate-200">
                      <button onClick={() => updateQuantity(item.product_id, -1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-90 transition-all"><Minus size={18} /></button>
                      <span className="text-lg font-black w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-90 transition-all"><Plus size={18} /></button>
                    </div>
                    <button onClick={() => removeItem(item.product_id)} className="text-slate-300 hover:text-red-500 text-sm font-bold flex items-center gap-1">
                      <Trash2 size={14} /> ลบออก
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* สรุปการสั่งซื้อ (ขวา - พื้นหลังขาว Premium) */}
            <div className="w-full lg:w-[40%] xl:w-[35%] lg:sticky lg:top-28">
              <div className="bg-white text-slate-900 p-8 md:p-10 rounded-[3.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden">
                
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full" />

                <h2 className="text-3xl font-black mb-10 border-b border-slate-50 pb-6 relative z-10">สรุปการสั่งซื้อ</h2>

                <div className="space-y-6 mb-10 relative z-10">
                  <div className="flex justify-between text-lg font-bold text-slate-400">
                    <span>ยอดรวม ({totalItemsCount} ชิ้น)</span>
                    <span className="text-slate-900 text-2xl font-black">฿{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-400">
                    <span>ค่าจัดส่ง</span>
                    {isFreeShipping ? <span className="text-green-500 font-black text-2xl italic">ฟรี!</span> : <span className="text-slate-900 text-2xl font-black">฿{shopSettings.delivery_fee.toLocaleString()}</span>}
                  </div>

                  {!isFreeShipping && shopSettings.min_free_shipping > 0 && (
                    <div className="bg-slate-50 p-5 rounded-[2rem] flex gap-4 items-center border border-slate-100 shadow-inner">
                      <Info size={24} className="text-blue-500 shrink-0" />
                      <p className="text-sm font-bold text-slate-600">
                        สั่งเพิ่มอีก <span className="text-red-500 text-lg font-black">{shopSettings.min_free_shipping - totalItemsCount} ชิ้น</span> เพื่อ <span className="text-green-500 font-black">ส่งฟรี!</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-8 border-t border-slate-100 mb-10 relative z-10">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Grand Total</span>
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-bold text-slate-400">ยอดชำระสุทธิ</span>
                    <span className="text-6xl xl:text-7xl font-black text-slate-900 tracking-tighter italic leading-none">฿{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/checkout')} 
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all shadow-xl relative z-10"
                >
                  <CreditCard size={28} /> ชำระเงินเลย
                </button>
              </div>
              
              <button onClick={() => navigate('/products')} className="w-full mt-6 py-2 text-slate-400 font-bold hover:text-slate-900 transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> เลือกสินค้าเพิ่มเติม
              </button>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;