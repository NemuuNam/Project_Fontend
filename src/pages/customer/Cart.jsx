import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowLeft, 
  CreditCard, Loader2, Info, ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';

// --- นำเข้า API Config และ Instance ---
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';

import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const Cart = ({ userData }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [shopSettings, setShopSettings] = useState({
    delivery_fee: 180,
    min_free_shipping: 20
  });

  const fetchSettings = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/home`);
      if (res.success) {
        setShopSettings({
          delivery_fee: Number(res.data.delivery_fee) || 180,
          min_free_shipping: Number(res.data.min_free_shipping) || 20
        });
      }
    } catch (err) { console.error(err); }
  }, []);

  const syncCartWithDatabase = useCallback(async () => {
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (localCart.length === 0) {
      setCartItems([]);
      return;
    }
    try {
      const productIds = localCart.map(item => item.product_id);
      const res = await axiosInstance.post(`${API_ENDPOINTS.PRODUCTS}/sync-cart`, { ids: productIds });
      if (res.success) {
        const dbProducts = res.data;
        const mergedCart = localCart.map(localItem => {
          const latestInfo = dbProducts.find(p => p.product_id === localItem.product_id);
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
  };

  const removeItem = (id) => {
    Swal.fire({
      title: 'ลบสินค้า?',
      text: "คุณต้องการนำสินค้าออกใช่หรือไม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1b2559',
      confirmButtonText: 'ลบออก',
      cancelButtonText: 'ยกเลิก',
      borderRadius: '20px'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = cartItems.filter(item => item.product_id !== id);
        setCartItems(updated);
        localStorage.setItem('cart', JSON.stringify(updated.map(i => ({ product_id: i.product_id, quantity: i.quantity }))));
        window.dispatchEvent(new Event('storage'));
        toast.success("ลบสินค้าเรียบร้อย");
      }
    });
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fdfbf2]">
      <Loader2 className="animate-spin text-[#1b2559]" size={50} />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf2]/40 font-['Kanit'] text-[#1b2559]">
      <Toaster position="bottom-right" />
      <HeaderHome userData={userData} />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#1b2559] mb-4 transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> เลือกเมนูเพิ่มเติม
          </button>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            ตะกร้าของฉัน <span className="text-[#e8c4a0]">({cartItems.length})</span>
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-dashed border-gray-200">
            <ShoppingBag size={60} className="mx-auto text-gray-200 mb-6" />
            <h2 className="text-xl font-bold text-gray-400 mb-8">ยังไม่มีสินค้าในตะกร้า</h2>
            <button onClick={() => navigate('/products')} className="bg-[#1b2559] text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-[#e8c4a0] transition-all">ดูเมนูอาหาร</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* List Section: 8 Columns on Desktop */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <div key={item.product_id} className="bg-white p-4 md:p-6 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-white hover:shadow-md transition-all relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 overflow-hidden rounded-[2rem] bg-gray-50">
                    <img src={item.image_url || '/placeholder.png'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-[10px] font-black text-[#e8c4a0] uppercase tracking-widest">{item.category?.category_name}</span>
                    <h3 className="text-lg md:text-xl font-bold mb-2">{item.product_name}</h3>
                    <p className="text-2xl font-black text-[#1b2559]">฿{item.unit_price.toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col items-center sm:items-end gap-4">
                    <div className="flex items-center gap-4 bg-[#fdfbf2] p-1.5 rounded-2xl border border-gray-100">
                      <button onClick={() => updateQuantity(item.product_id, -1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-500 transition-all"><Minus size={16} /></button>
                      <span className="text-lg font-black w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-[#e8c4a0] transition-all"><Plus size={16} /></button>
                    </div>
                    <button onClick={() => removeItem(item.product_id)} className="text-gray-300 hover:text-red-500 flex items-center gap-2 text-xs font-bold transition-colors">
                      <Trash2 size={16} /> ลบรายการ
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Section: 4 Columns on Desktop */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="bg-[#1b2559] text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8c4a0]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <h2 className="text-xl font-black mb-8 flex items-center gap-2 border-b border-white/10 pb-4">
                  <ChevronRight className="text-[#e8c4a0]" size={20} /> สรุปการสั่งซื้อ
                </h2>

                <div className="space-y-4 mb-10">
                  <div className="flex justify-between text-sm opacity-80 font-bold">
                    <span>ค่าอาหาร ({totalItemsCount} ชิ้น)</span>
                    <span>฿{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="opacity-80">ค่าจัดส่ง</span>
                    {isFreeShipping ? <span className="text-green-400">ฟรี!</span> : <span>฿{shopSettings.delivery_fee}</span>}
                  </div>
                  {!isFreeShipping && (
                    <div className="bg-white/5 p-4 rounded-2xl flex gap-3 items-center">
                      <Info size={16} className="text-[#e8c4a0]" />
                      <p className="text-[10px] leading-relaxed">ซื้อเพิ่มอีก <b className="text-[#e8c4a0]">{shopSettings.min_free_shipping - totalItemsCount} ชิ้น</b> เพื่อส่งฟรี!</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-between items-end mb-8">
                  <div>
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest block">Total Price</span>
                    <span className="text-sm font-bold opacity-60">ยอดสุทธิ</span>
                  </div>
                  <span className="text-4xl font-black text-[#e8c4a0]">฿{finalTotal.toLocaleString()}</span>
                </div>

                <button onClick={() => navigate('/checkout')} className="w-full py-5 bg-[#e8c4a0] text-[#1b2559] rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                  <CreditCard size={22} /> ชำระเงิน
                </button>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;