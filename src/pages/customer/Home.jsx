import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Loader2, Settings, Star, ImageIcon, Heart, Plus,
  Quote, MoveRight, Trash2, ChevronRight, Sparkles,
  Cookie, Send, Info, Camera, ShoppingCart, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const Home = ({ userData }) => {
  const navigate = useNavigate();

  // --- 📦 Data States ---
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [homeData, setHomeData] = useState({
    hero_title: 'เติมเต็มความหวานให้วันพิเศษของคุณ',
    hero_subtitle: 'รังสรรค์ด้วยความใส่ใจ',
    hero_description: 'คุกกี้โฮมเมด อบสดใหม่ทุกวัน เพื่อส่งมอบความสุขผ่านรสชาติที่กลมกล่อมและวัตถุดิบชั้นเลิศ',
    shop_address: 'กำลังโหลดข้อมูล...',
    shop_phone: '',
    line_url: ''
  });

  const [heroImages, setHeroImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- 🛠️ Admin States ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newHeroFiles, setNewHeroFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const isStaff = userData && [1, 2, 3].includes(Number(userData.role_level));

  // --- 🔄 1. ฟังก์ชันดึงข้อมูล (กู้คืนครบถ้วน) ---
  const initPage = useCallback(async () => {
    try {
      setLoading(true);
      const [homeRes, prodRes, publicRes, reviewRes, wishRes] = await Promise.allSettled([
        axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/home`),
        axiosInstance.get(API_ENDPOINTS.PRODUCTS),
        axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`),
        axiosInstance.get('/api/reviews/all'),
        userData ? axiosInstance.get('/api/wishlist') : Promise.resolve({ success: true, data: [] })
      ]);

      if (homeRes.status === 'fulfilled' && homeRes.value.success) {
        const data = homeRes.value.data;
        setHomeData(prev => ({ ...prev, ...data }));
        try {
          const parsed = JSON.parse(data.hero_image_url || '[]');
          setHeroImages(Array.isArray(parsed) ? parsed : []);
        } catch (e) { setHeroImages([]); }
      }
      if (prodRes.status === 'fulfilled' && prodRes.value.success) setProducts((prodRes.value.data || []).slice(0, 4));
      if (publicRes.status === 'fulfilled' && publicRes.value.success) {
        const d = publicRes.value.data;
        setHomeData(prev => ({ ...prev, shop_address: d.address, shop_phone: d.phone, line_url: d.line_url }));
      }
      if (reviewRes.status === 'fulfilled' && reviewRes.value.success) setReviews((reviewRes.value.data || []).slice(0, 3));
      if (wishRes.status === 'fulfilled' && wishRes.value.success) setWishlistedIds((wishRes.value.data || []).map(w => w.product_id));

      updateCartCount();
    } catch (err) { console.error("Initialization failed", err); }
    finally { setLoading(false); }
  }, [userData]);

  useEffect(() => { initPage(); }, [initPage]);

  // --- 🛒 2. ฟังก์ชันจัดการตะกร้าและรายการโปรด (กู้คืนครบถ้วน) ---
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  };

  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();
    if (!userData) return toast.error("กรุณาเข้าสู่ระบบก่อนครับ");
    try {
      const isExist = wishlistedIds.includes(productId);
      const res = await axiosInstance.post('/api/wishlist/toggle', { product_id: productId });
      if (res.success) {
        setWishlistedIds(prev => isExist ? prev.filter(id => id !== productId) : [...prev, productId]);
        toast.success(isExist ? "ลบจากรายการโปรด" : "เพิ่มในรายการโปรดแล้ว");
      }
    } catch (err) { toast.error("ดำเนินการไม่สำเร็จ"); }
  };

  const addToCart = (e, product) => {
    e.stopPropagation();
    if (product.stock_quantity <= 0) return toast.error("สินค้าหมดชั่วคราว");
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.product_id === product.product_id);
    if (existing) existing.quantity += 1;
    else cart.push({ product_id: product.product_id, product_name: product.product_name, price: product.unit_price, image_url: product.images?.[0]?.image_url, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    window.dispatchEvent(new Event('storage'));
    toast.success(`เพิ่ม ${product.product_name} ลงตะกร้าแล้ว ✨`);
  };

  // Slider Logic
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % heroImages.length), 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // --- 📸 3. ฟังก์ชัน Admin (กู้คืนครบถ้วน) ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setNewHeroFiles(prev => [...prev, ...files]);
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeNewPreview = (index) => {
    setNewHeroFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateContent = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('hero_title', homeData.hero_title);
    formData.append('hero_subtitle', homeData.hero_subtitle);
    formData.append('hero_description', homeData.hero_description);
    formData.append('images_to_delete', JSON.stringify(imagesToDelete));
    newHeroFiles.forEach(file => formData.append('hero_image_url', file));

    try {
      const res = await axiosInstance.put(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/home`, formData);
      if (res.success) {
        toast.success('อัปเดตข้อมูลเรียบร้อย ✨');
        setImagesToDelete([]); setNewHeroFiles([]); setNewPreviews([]);
        setIsEditModalOpen(false); initPage();
      }
    } catch (err) { toast.error("บันทึกไม่สำเร็จ"); }
    finally { setIsUpdating(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-[#000000]" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] overflow-x-hidden selection:bg-slate-200 relative">
      <Toaster position="bottom-right" />
      <HeaderHome userData={userData} />

      {isStaff && (
        <div className="bg-white py-3 flex justify-center sticky top-[92px] z-[90] border-b border-slate-100 shadow-sm">
          <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-[#000000] bg-white px-6 py-2 rounded-full border border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
            <Settings size={14} className={isUpdating ? "animate-spin" : ""} /> CUSTOMIZE HOME
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          {heroImages.length > 0 ? heroImages.map((url, idx) => (
            <img key={url} src={url} className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ${idx === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`} alt="" />
          )) : <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400"><ImageIcon size={60} /></div>}
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/95 to-transparent"></div>

        <div className="container mx-auto px-10 lg:px-20 relative z-20">
          <div className="w-full lg:w-3/5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <Sparkles size={14} className="text-black" />
              <span className="text-[20px] font-medium tracking-widest uppercase text-[#111827]">{homeData.hero_subtitle}</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-medium leading-[0.9] text-black tracking-tighter italic">
              {homeData.hero_title}
            </h1>
            <div className="pl-6 border-l-4 border-[#000000] max-w-lg">
              <p className="text-xl font-medium italic text-[#111827] leading-relaxed">{homeData.hero_description}</p>
            </div>
            <button onClick={() => navigate('/products')} className="bg-white border-2 border-slate-300 text-black px-10 py-4 rounded-full font-medium text-lg flex items-center gap-3 tracking-widest italic hover:bg-slate-50 hover:border-black transition-all shadow-md active:scale-95">
              BROWSE MENU <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* 🍪 Signature Menu (ฟังก์ชันกลับมาครบ) */}
      <section className="py-16 bg-white relative z-10 border-t border-slate-50">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-10 text-left">
            <h2 className="text-4xl lg:text-5xl font-medium text-black uppercase tracking-tighter italic leading-none">
              Menu <span className="font-light not-italic text-slate-400">Highlight</span>
            </h2>
            <div className="h-1.5 w-16 bg-[#000000] mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.product_id} onClick={() => navigate('/products')} className="group bg-white rounded-[3rem] p-5 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full relative overflow-hidden text-left cursor-pointer">

                {/* 🚀 Wishlist Button (Working) */}
                <button onClick={(e) => toggleWishlist(e, product.product_id)} className="absolute top-6 right-6 z-20 w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center hover:scale-110 transition-all border border-slate-50">
                  <Heart size={20} className={wishlistedIds.includes(product.product_id) ? 'fill-red-500 text-red-500' : 'text-black'} />
                </button>

                <div className="relative aspect-square overflow-hidden rounded-[2.5rem] mb-4 bg-[#FDFCFB]">
                  <img src={product.images?.[0]?.image_url || '/placeholder.png'} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                </div>

                <div className="flex flex-col flex-grow">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-[#374151] mb-1 italic">
                    {product.category?.category_name || 'Bakery'}
                  </span>
                  <h3 className="text-2xl font-medium text-black leading-tight mb-2 uppercase tracking-tighter italic line-clamp-2">
                    {product.product_name}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${product.stock_quantity <= 5 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                    <span className="text-xs font-medium uppercase tracking-widest text-[#111827]">
                      Stock: {product.stock_quantity > 0 ? product.stock_quantity : 'Empty'}
                    </span>
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-4">
                    <div className="flex flex-col leading-none">
                      <p className="text-[10px] font-medium text-[#374151] uppercase tracking-widest mb-1">Price</p>
                      <span className="text-3xl font-medium text-black tracking-tighter italic">
                        ฿{Number(product.unit_price).toLocaleString()}
                      </span>
                    </div>
                    {/* 🚀 Add to Cart Button (Working) */}
                    <button onClick={(e) => addToCart(e, product)} disabled={product.stock_quantity <= 0} className="w-12 h-12 bg-white rounded-[1.25rem] flex items-center justify-center shadow-md border border-slate-100 hover:bg-black hover:text-white transition-all active:scale-90 disabled:opacity-30">
                      <ShoppingCart size={22} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/products')} className="mt-12 group inline-flex items-center gap-3 text-black font-medium text-lg tracking-widest border-b-2 border-[#000000] pb-1 italic hover:gap-5 transition-all">
            VIEW ALL COLLECTIONS <MoveRight size={20} />
          </button>
        </div>
      </section>

      {/* Customer Voices (Yellow Stars Fixed) */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-10">
          <div className="mb-12 text-left">
            <h2 className="text-4xl lg:text-5xl font-medium text-black uppercase tracking-tighter italic leading-none">
              Customer <span className="font-light not-italic text-slate-400">Voices</span>
            </h2>
            <p className="text-[#374151] text-xs font-medium uppercase tracking-[0.2em] mt-3 italic">Verified Bakery Feedback</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-sm text-left relative overflow-hidden group">
                <Quote size={40} className="absolute -right-2 -top-2 text-slate-100" />
                <div className="flex gap-1 mb-6">
                  {/* 🚀 ดาวสีเหลืองทอง (#FACC15) */}
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < rev.rating_score ? "text-[#EAB308] fill-[#FACC15]" : "text-slate-200"} />
                  ))}
                </div>
                <p className="text-xl text-black font-medium italic leading-relaxed mb-10">"{rev.comment}"</p>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                  <div className="w-11 h-11 bg-[#FDFCFB] border border-slate-300 rounded-2xl flex items-center justify-center text-black font-medium text-sm">{rev.user?.first_name?.[0]}</div>
                  <span className="font-medium text-black text-sm uppercase tracking-widest italic">{rev.user?.first_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative w-full h-[550px] bg-white border-t border-slate-100">
        <iframe
          title="Map"
          src="https://www.google.com/maps?q=88%20หมู่%205%20ถนนราชพฤกษ์%20ตำบลบางพลับ%20อำเภอปากเกร็ด%20จังหวัดนนทบุรี%2011120&output=embed"
          className="w-full h-full border-none grayscale opacity-30"
        ></iframe>
        <div className="absolute inset-x-0 bottom-12 px-6">
          <div className="max-w-4xl mx-auto bg-white p-10 rounded-[3.5rem] border border-slate-300 shadow-2xl flex flex-col md:flex-row items-center gap-10 text-black">
            <div className="flex-1 text-left space-y-4">
              <div className="inline-flex items-center gap-2 text-emerald-700 text-[10px] font-medium tracking-widest uppercase bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div> SHOP IS OPEN
              </div>
              <h4 className="text-4xl font-medium tracking-tighter italic uppercase leading-none">Visit Our Bakery</h4>
              <p className="text-lg italic text-[#111827] leading-relaxed font-medium">{homeData.shop_address}</p>
            </div>
            <div className="w-full md:w-auto flex flex-col gap-4">
              <a href={homeData.line_url} target="_blank" rel="noreferrer" className="bg-white border-2 border-slate-300 text-black px-10 py-4 rounded-full font-medium tracking-widest shadow-sm hover:border-black transition-all uppercase italic text-center flex items-center justify-center gap-3">
                <Send size={18} /> Line Us
              </a>
              <div className="text-right pr-4 leading-none">
                <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#374151] mb-1">Direct Call</p>
                <p className="text-2xl font-medium italic text-black tracking-tighter">{homeData.shop_phone}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Admin Modal (กู้คืนครบถ้วน) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-500/20 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-10 shadow-2xl border-2 border-slate-300 relative max-h-[90vh] overflow-y-auto text-left">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-8 right-8 p-2.5 bg-white border border-slate-200 rounded-full text-black hover:text-red-500 shadow-sm transition-all"><X size={22} /></button>
            <h2 className="text-3xl font-medium uppercase italic text-black mb-10 border-b-2 border-slate-100 pb-4">Manage <span className="text-[#374151] not-italic font-light">Home Identity</span></h2>
            <form onSubmit={handleUpdateContent} className="space-y-8">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase text-[#111827] ml-4 tracking-[0.2em]">Hero Headline</label>
                  <input type="text" value={homeData.hero_title} onChange={(e) => setHomeData({ ...homeData, hero_title: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-300 rounded-2xl outline-none font-medium text-xl focus:border-black text-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase text-[#111827] ml-4 tracking-[0.2em]">Subtitle Badge</label>
                  <input type="text" value={homeData.hero_subtitle} onChange={(e) => setHomeData({ ...homeData, hero_subtitle: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-300 rounded-2xl outline-none font-medium text-xl focus:border-black text-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase text-[#111827] ml-4 tracking-[0.2em]">Brand Story</label>
                  <textarea value={homeData.hero_description} onChange={(e) => setHomeData({ ...homeData, hero_description: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-300 rounded-2xl outline-none font-medium text-lg h-28 resize-none italic focus:border-black text-black" />
                </div>
              </div>

              {/* 📸 Photo Management */}
              <div className="space-y-4">
                <label className="text-xs font-medium uppercase text-[#111827] ml-4 tracking-[0.2em]">Hero Banner Gallery</label>
                <div className="grid grid-cols-4 gap-4">
                  {heroImages.map((url) => (
                    <div key={url} className={`relative aspect-square rounded-[1.5rem] overflow-hidden border-2 transition-all ${imagesToDelete.includes(url) ? 'opacity-20 border-red-500 scale-95' : 'border-slate-100'}`}>
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => setImagesToDelete(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url])} className="absolute inset-0 flex items-center justify-center bg-red-600/10 opacity-0 hover:opacity-100 transition-all text-red-600"><Trash2 size={24} /></button>
                    </div>
                  ))}
                  {newPreviews.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-emerald-400 bg-emerald-50">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => removeNewPreview(index)} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-red-500"><X size={14} /></button>
                    </div>
                  ))}
                  <label className="aspect-square flex flex-col items-center justify-center bg-[#FDFCFB] border-2 border-dashed border-slate-300 rounded-[1.5rem] cursor-pointer hover:bg-slate-50 transition-all active:scale-95 group">
                    <Plus className="text-slate-300 group-hover:text-black" size={32} />
                    <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                </div>
              </div>

              <button type="submit" disabled={isUpdating} className="w-full bg-white border-2 border-slate-300 text-black py-5 rounded-full font-medium uppercase tracking-widest shadow-md hover:bg-black hover:text-white transition-all active:scale-95 italic">
                {isUpdating ? "SYNCHRONIZING..." : "SAVE HOMEPAGE CONFIGURATION"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;