import React, { useState, useEffect, useCallback } from 'react';
import {
  Edit3, ArrowRight, ShoppingBag, X, Loader2, Save, Settings,
  Star, Image as ImageIcon, Heart, Plus, Quote, MapPin, Clock, 
  Phone, MessageCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

// --- API Config & Axios ---
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';

// --- Components ---
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const Home = ({ userData }) => {
  const navigate = useNavigate();

  // --- States ---
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [homeData, setHomeData] = useState({
    hero_title: 'SOOO GUICHAI',
    hero_subtitle: 'PREMIUM GUICHAI RECIPE',
    hero_description: '',
    hero_image_url: '',
    promotion_text: '',
    address: 'กำลังโหลดข้อมูลที่อยู่ร้าน...'
  });

  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // ตรวจสอบสิทธิ์
  const isAdminManager = userData && [1, 2].includes(Number(userData.role_level));
  const isStaff = userData && [1, 2, 3].includes(Number(userData.role_level));

  // 1. ดึงข้อมูลหน้าเว็บ
  const initPage = useCallback(async () => {
    try {
      setLoading(true);
      const [homeRes, prodRes, publicRes, reviewRes] = await Promise.allSettled([
        axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/home`),
        axiosInstance.get(API_ENDPOINTS.ADMIN.PRODUCTS),
        axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`),
        axiosInstance.get(API_ENDPOINTS.REVIEWS)
      ]);

      if (homeRes.status === 'fulfilled' && homeRes.value.success) setHomeData(prev => ({ ...prev, ...homeRes.value.data }));
      
      if (prodRes.status === 'fulfilled' && prodRes.value.success) {
        const pData = prodRes.value.data || prodRes.value;
        setProducts(Array.isArray(pData) ? pData.slice(0, 4) : []);
      }

      if (publicRes.status === 'fulfilled' && publicRes.value.success) setHomeData(prev => ({ ...prev, address: publicRes.value.data.address }));

      if (reviewRes.status === 'fulfilled' && reviewRes.value.success) {
        const rData = reviewRes.value.data || reviewRes.value;
        setReviews(Array.isArray(rData) ? rData.slice(0, 3) : []);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { initPage(); }, [initPage]);

  // 2. ระบบจัดการตะกร้าสินค้า
  const addToCart = (product) => {
    if (product.stock_quantity <= 0) return toast.error("ขออภัย สินค้าหมดชั่วคราว");
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.product_id === product.product_id);
    
    if (existing) {
        if (existing.quantity + 1 > product.stock_quantity) return toast.error("สินค้าในสต็อกไม่พอ");
        existing.quantity += 1;
    } else {
        cart.push({ 
            product_id: product.product_id, 
            name: product.product_name, 
            price: product.unit_price, 
            image: product.images?.[0]?.image_url || '/placeholder.png', 
            quantity: 1 
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage')); 
    toast.success(`เพิ่ม ${product.product_name} ลงตะกร้าแล้ว`);
  };

  // 3. Admin Actions
  const handleSavePromotion = async () => {
    setIsUpdating(true);
    try {
      await axiosInstance.put(API_ENDPOINTS.ADMIN.SHOP_SETTINGS, { promotion_text: homeData.promotion_text });
      toast.success("บันทึกประกาศสำเร็จ!");
    } catch (err) { toast.error("ล้มเหลว"); }
    finally { setIsUpdating(false); }
  };

  const handleHeroUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('hero_title', homeData.hero_title);
    formData.append('hero_subtitle', homeData.hero_subtitle);
    formData.append('hero_description', homeData.hero_description);
    if (selectedFile) formData.append('image', selectedFile);

    try {
      const res = await axiosInstance.put(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/home`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.success) {
        setIsEditModalOpen(false);
        initPage();
        Swal.fire({ title: 'สำเร็จ!', text: 'อัปเดตหน้าแรกเรียบร้อย', icon: 'success' });
      }
    } catch (err) { toast.error("เกิดข้อผิดพลาด"); }
    finally { setIsUpdating(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-900" size={60} /></div>;

  return (
    <div className="min-h-screen bg-white font-['Kanit'] text-slate-900 selection:bg-slate-100">
      <Toaster position="top-right" />
      <HeaderHome userData={userData} />

      {/* --- 1. Admin Control Bar (Light Mode) --- */}
      {isAdminManager && (
        <div className="bg-white/90 backdrop-blur-lg py-4 px-6 sticky top-[72px] z-40 border-b border-slate-100 shadow-sm">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400"><Settings size={18} /> Shop Manager</div>
            <input 
              type="text" 
              className="flex-1 max-w-xl px-5 py-3 rounded-xl bg-slate-50 text-slate-900 text-base outline-none focus:bg-white border border-slate-100 focus:border-slate-300 transition-all" 
              placeholder="ประกาศด่วนถึงลูกค้า..." 
              value={homeData.promotion_text || ''} 
              onChange={(e) => setHomeData({...homeData, promotion_text: e.target.value})} 
            />
            <button onClick={handleSavePromotion} disabled={isUpdating} className="bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
               {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} บันทึก
            </button>
          </div>
        </div>
      )}

      {/* --- 2. Promotion Banner (ตัวอักษรใหญ่ชัดเจน) --- */}
      {homeData.promotion_text && (
        <div className="bg-slate-50 py-5 px-4 text-center font-bold text-2xl border-b border-slate-100 text-slate-700">
          <span className="inline-block animate-pulse mr-3 text-slate-900">📢</span> {homeData.promotion_text}
        </div>
      )}

      {/* --- 3. Hero Section (Modern White & Large Font) --- */}
      <section className="relative pt-16 pb-24 lg:pt-28 lg:pb-36 px-6 bg-white">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
          <div className="lg:w-[50%] text-center lg:text-left space-y-12 order-2 lg:order-1">
            {isStaff && (
              <button onClick={() => setIsEditModalOpen(true)} className="inline-flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-full text-sm font-bold text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                <Edit3 size={18} /> ปรับแต่งหน้าเว็บไซต์
              </button>
            )}
            <div className="space-y-8">
              <span className="text-slate-400 font-bold text-lg tracking-[0.5em] uppercase block">{homeData.hero_subtitle}</span>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.95] tracking-tighter text-slate-900">
                {homeData.hero_title.split(' ')[0]} <br />
                <span className="text-slate-200 italic">{homeData.hero_title.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-slate-500 text-2xl md:text-3xl max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                {homeData.hero_description || 'พรีเมียมกุยช่าย สูตรดั้งเดิมที่ถูกยกระดับความอร่อยเพื่อคุณ ส่งตรงความสดใหม่ทุกวัน'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-6">
              {/* ปุ่มสีขาวใส่เงาขนาดใหญ่ */}
              <button onClick={() => navigate('/products')} className="bg-white text-slate-900 border border-slate-100 px-14 py-7 rounded-[2.5rem] font-black text-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all active:scale-95 w-full sm:w-auto">
                เริ่มสั่งซื้อเลย
              </button>
              <button onClick={() => navigate('/products')} className="flex items-center gap-4 font-black text-2xl text-slate-900 hover:gap-6 transition-all group">
                ดูเมนูทั้งหมด <ArrowRight size={32} className="text-slate-300" />
              </button>
            </div>
          </div>

          {/* Hero Image - จัดรูปภาพให้พอดีกรอบเสมอ */}
          <div className="lg:w-[50%] flex justify-center order-1 lg:order-2 w-full">
            <div className="relative w-full max-w-[700px]">
              <div className="absolute -inset-10 bg-slate-50 rounded-full blur-3xl opacity-60"></div>
              <div className="relative overflow-hidden rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-50 aspect-[16/11] bg-slate-100">
                <img 
                  src={homeData.hero_image_url || "/placeholder-hero.png"} 
                  alt="Hero" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000 ease-out" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. Best Sellers (แสดงสต็อกสินค้าและตัวอักษรใหญ่) --- */}
      <section className="py-32 border-t border-slate-50 bg-[#FBFBFC]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-24 gap-8 text-center md:text-left">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 uppercase">เมนูยอดนิยม</h2>
              <div className="h-2 w-24 bg-slate-900 mx-auto md:mx-0 rounded-full"></div>
            </div>
            <button onClick={() => navigate('/products')} className="flex items-center gap-3 text-slate-400 font-bold hover:text-slate-900 transition-all group uppercase text-lg tracking-[0.2em]">
              ดูสินค้าทั้งหมด <Plus size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {products.map((product) => (
              <div key={product.product_id} className="group bg-white rounded-[3.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 flex flex-col h-full">
                {/* Image & Stock Info */}
                <div className="relative aspect-square overflow-hidden rounded-[2.5rem] mb-8 bg-slate-50">
                  <img src={product.images[0]?.image_url || '/placeholder.png'} alt={product.product_name} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ${product.stock_quantity <= 0 ? 'grayscale opacity-50' : ''}`} />
                  
                  {/* Stock Status Badge */}
                  <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                    <span className="bg-white/90 backdrop-blur text-slate-900 text-[10px] font-black px-4 py-2 rounded-full shadow-sm tracking-widest">TOP SELLER</span>
                    <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-md border ${
                        product.stock_quantity > 10 
                        ? 'bg-white text-slate-900 border-slate-100' 
                        : product.stock_quantity > 0 
                        ? 'bg-amber-500 text-white border-amber-400' 
                        : 'bg-red-600 text-white border-red-500'
                    }`}>
                        {product.stock_quantity > 0 ? `คงเหลือ: ${product.stock_quantity}` : 'สินค้าหมด'}
                    </span>
                  </div>
                </div>

                <div className="px-2 flex flex-col flex-grow">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">{product.category?.category_name || 'Signature'}</span>
                  <h3 className="text-3xl font-black text-slate-900 mb-6 line-clamp-1">{product.product_name}</h3>
                  
                  <div className="mt-auto flex justify-between items-center pt-8 border-t border-slate-50">
                    <span className="text-4xl font-black text-slate-900">฿{product.unit_price}</span>
                    {/* ปุ่มขาวเงา เส้นดำ */}
                    <button 
                        onClick={() => addToCart(product)} 
                        disabled={product.stock_quantity <= 0}
                        className="bg-white border-2 border-slate-100 text-slate-900 p-6 rounded-2xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-90 shadow-md group/btn"
                    >
                      <ShoppingBag size={28} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 5. Customer Reviews (ตัวอักษรใหญ่พิเศษ) --- */}
      <section className="py-32 bg-white border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">เสียงจากลูกค้าจริง</h2>
            <p className="text-slate-400 text-2xl font-light">ความประทับใจที่คุณวางใจได้</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {reviews.length > 0 ? reviews.map((review, idx) => (
              <div key={idx} className="bg-slate-50/50 p-12 rounded-[4rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
                <div className="flex gap-2 mb-10 text-slate-900">
                  {[...Array(5)].map((_, i) => <Star key={i} size={24} fill={i < review.rating_score ? "currentColor" : "none"} className={i < review.rating_score ? "" : "text-slate-200"} />)}
                </div>
                <p className="text-slate-600 mb-12 leading-relaxed font-light italic text-2xl">"{review.comment || 'อร่อย แป้งบาง ไส้เยอะมากครับ แนะนำเลย'}"</p>
                <div className="flex items-center gap-6 pt-8 border-t border-slate-200">
                  <div className="w-16 h-16 bg-white text-slate-900 rounded-3xl border border-slate-100 flex items-center justify-center font-black text-xl shadow-sm">
                    {review.user?.first_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block text-xl">{review.user?.first_name ? `${review.user.first_name} ${review.user.last_name}` : 'ลูกค้าผู้ใช้งาน'}</span>
                    <span className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">Verified Purchase</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center text-slate-300 text-2xl font-light">ยังไม่มีข้อมูลรีวิวในขณะนี้</div>
            )}
          </div>
        </div>
      </section>

      {/* --- 6. Contact & Map --- */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-28 items-center">
            <div className="lg:w-5/12 space-y-16 w-full text-center lg:text-left">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase">มาหาเราได้ที่ร้าน</h2>
                <p className="text-slate-400 leading-relaxed font-light text-2xl">เรายินดีต้อนรับทุกท่านสู่หน้าร้านกุยช่ายพรีเมียม <br/>สดใหม่จากเตาทุกวัน</p>
              </div>
              
              <div className="space-y-12">
                <div className="flex items-start gap-8 group justify-center lg:justify-start">
                  <div className="p-6 bg-white rounded-3xl text-slate-900 border border-slate-100 shadow-sm transition-all group-hover:bg-slate-900 group-hover:text-white"><MapPin size={40}/></div>
                  <div className="text-left">
                    <h4 className="font-black text-slate-900 text-2xl uppercase tracking-tight">ที่อยู่ร้าน</h4>
                    <p className="text-xl text-slate-400 mt-2 leading-relaxed max-w-[350px] font-light">{homeData.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-8 group justify-center lg:justify-start">
                  <div className="p-6 bg-white rounded-3xl text-slate-900 border border-slate-100 shadow-sm transition-all group-hover:bg-slate-900 group-hover:text-white"><Clock size={40}/></div>
                  <div className="text-left">
                    <h4 className="font-black text-slate-900 text-2xl uppercase tracking-tight">เวลาทำการ</h4>
                    <p className="text-xl text-slate-400 mt-2 font-light">เปิดทุกวัน: 08:00 น. - 18:00 น.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 pt-10">
                <button className="flex-1 py-7 bg-white border border-slate-200 text-slate-900 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 hover:bg-slate-50 shadow-lg transition-all active:scale-95">
                  <Phone size={30} /> โทรติดต่อเรา
                </button>
                <button className="flex-1 py-7 bg-white border border-slate-200 text-slate-900 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 hover:bg-slate-50 shadow-lg transition-all active:scale-95">
                  <MessageCircle size={30} /> ไลน์ของร้าน
                </button>
              </div>
            </div>

            {/* Google Map - Grayscale Look */}
            <div className="lg:w-7/12 w-full">
              <div className="rounded-[5rem] overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.15)] border-8 border-white h-[600px] relative group">
                <iframe
                  title="Shop Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.559134958046!2d100.52845071533385!3d13.744726401135205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ0JzQxLjAiTiAxMDDCsDMxJzUwLjQiRQ!5e0!3m2!1sen!2sth!4v1625000000000!5m2!1sen!2sth"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                  className="grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer userData={userData} />

      {/* --- Edit Modal (Modern White Style) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/10 backdrop-blur-md p-4">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl p-14 shadow-[0_50px_100px_rgba(0,0,0,0.2)] relative border border-slate-50 animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-12 right-12 p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-colors"><X size={32} /></button>
            <h2 className="text-4xl font-black mb-12 flex items-center gap-5 text-slate-900 tracking-tighter">
              <Settings size={40} className="text-slate-200" /> 
              จัดการเนื้อหา
            </h2>
            <form onSubmit={handleHeroUpdate} className="space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">หัวข้อหลัก</label>
                  <input type="text" value={homeData.hero_title} onChange={(e) => setHomeData({...homeData, hero_title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-slate-300 outline-none transition-all text-xl font-medium" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">หัวข้อรอง</label>
                  <input type="text" value={homeData.hero_subtitle} onChange={(e) => setHomeData({...homeData, hero_subtitle: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-slate-300 outline-none transition-all text-xl font-medium" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">คำอธิบาย</label>
                <textarea value={homeData.hero_description} onChange={(e) => setHomeData({...homeData, hero_description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-slate-300 outline-none transition-all text-xl h-32 resize-none" />
              </div>
              <div className="border-4 border-dashed border-slate-100 rounded-[3rem] aspect-video flex items-center justify-center relative bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden">
                {previewUrl || homeData.hero_image_url ? (
                  <div className="relative w-full h-full">
                    <img src={previewUrl || homeData.hero_image_url} className="w-full h-full object-cover" alt="Preview" />
                    <label className="absolute inset-0 bg-slate-900/10 opacity-0 hover:opacity-100 transition-all flex items-center justify-center text-white cursor-pointer">
                      <ImageIcon size={48} />
                      <input type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer text-slate-300 flex flex-col items-center">
                    <ImageIcon size={60} />
                    <span className="text-lg font-bold mt-5 uppercase">อัปโหลดรูปภาพ Banner</span>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
              <button type="submit" disabled={isUpdating} className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black text-2xl shadow-xl hover:bg-slate-800 transition-all flex justify-center gap-5 active:scale-95 uppercase tracking-widest">
                {isUpdating ? <Loader2 className="animate-spin" size={32} /> : <Save size={32} />} บันทึกข้อมูล
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;