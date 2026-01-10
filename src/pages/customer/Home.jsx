import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Edit3, X, Loader2, Save, Settings,
  Star, ImageIcon, Heart, Plus, MessageCircle,
  Quote, MoveRight, Trash2, ChevronLeft,
  ChevronRight, Sparkles, Leaf, Cookie, Utensils, Smile,
  MapPin, Phone, Instagram, Send, Navigation, Compass, Undo2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

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
  const [homeData, setHomeData] = useState({
    hero_title: 'เติมเต็มความหวานให้วันพิเศษของคุณ',
    hero_subtitle: 'รังสรรค์ด้วยความใส่ใจ',
    hero_description: 'คุกกี้และขนมโฮมเมด อบสดใหม่จากเตาทุกวัน เพื่อส่งมอบความสุขผ่านรสชาติที่กลมกล่อมและวัตถุดิบชั้นเลิศ',
    shop_address: 'กำลังโหลดข้อมูลที่ตั้งร้าน...',
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

  // --- 🔄 Data Fetching ---
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
        setHomeData(prev => ({
          ...prev,
          shop_address: d.contact_address || d.address,
          shop_phone: d.contact_phone || d.phone,
          line_url: d.line_url
        }));
      }

      if (reviewRes.status === 'fulfilled' && reviewRes.value.success) {
        setReviews((reviewRes.value.data || []).slice(0, 3));
      }

      if (wishRes.status === 'fulfilled' && wishRes.value.success) {
        setWishlistedIds((wishRes.value.data || []).map(w => w.product_id));
      }
    } catch (err) {
      console.error("Initialization failed", err);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => { initPage(); }, [initPage]);

  // --- 🎠 Slider Logic ---
  const nextSlide = useCallback(() => {
    if (heroImages.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  }, [heroImages.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // --- ✍️ Handlers ---
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
        toast.success('อัปเดตข้อมูลเรียบร้อยแล้ว ✨');

        // ✅ ล้างค่า State ต่างๆ หลังบันทึกสำเร็จ
        setImagesToDelete([]);
        setNewHeroFiles([]);
        setNewPreviews([]);

        setIsEditModalOpen(false);
        initPage(); // โหลดข้อมูลใหม่จาก Server
      }
    } catch (err) {
      toast.error("บันทึกข้อมูลไม่สำเร็จ: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const addToCart = (p) => {
    if (p.stock_quantity <= 0) return toast.error("สินค้าหมดชั่วคราว");
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ ...p, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    toast.success(`เพิ่ม ${p.product_name} ลงตะกร้าแล้ว! 🍪`);
  };

  const toggleWishlist = async (productId) => {
    if (!userData) {
      return toast.error("กรุณาเข้าสู่ระบบเพื่อบันทึกสินค้าที่ถูกใจ", {
        icon: '🔒',
      });
    }

    try {
      const res = await axiosInstance.post('/api/wishlist/toggle', { product_id: productId });
      if (res.success) {
        setWishlistedIds(prev =>
          prev.includes(productId)
            ? prev.filter(id => id !== productId)
            : [...prev, productId]
        );
        toast.success(res.message, {
          icon: wishlistedIds.includes(productId) ? '💔' : '💖',
        });
      }
    } catch (err) {
      toast.error("ไม่สามารถดำเนินการได้ในขณะนี้");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden selection:bg-[#F3E9DC] relative">

      {/* ☁️ Global Cozy Patterns (Background Icons) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Leaf className="absolute top-[10%] left-[-5%] text-[#2D241E] opacity-[0.02] rotate-12" size={300} />
        <Cookie className="absolute top-[60%] right-[-5%] text-[#2D241E] opacity-[0.03] -rotate-12" size={250} />
        <Smile className="absolute bottom-[5%] left-[10%] text-[#2D241E] opacity-[0.02]" size={200} />
      </div>

      <Toaster position="bottom-right" />
      <HeaderHome userData={userData} />

      {/* --- 🛠️ Admin Tool --- */}
      {isStaff && (
        <div className="bg-white/80 py-4 flex justify-center backdrop-blur-md sticky top-[72px] z-[90] border-b border-slate-100">
          <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 text-[20px] font-bold uppercase tracking-widest text-[#2D241E] bg-white px-8 py-2.5 rounded-full shadow-sm border border-slate-100 active:scale-95 transition-all">
            <Settings size={14} className={isUpdating ? "animate-spin" : ""} />
            {isUpdating ? "กำลังบันทึก..." : "โหมดปรับแต่งหน้าเว็บ"}
          </button>
        </div>
      )}

      {/* --- 🥧 Hero Section --- */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#FAFAFA]">

        {/* 1. Background Image Slider Layer (ชั้นล่างสุด - เน้นขวา) */}
        <div className="absolute inset-0 z-0">
          {heroImages.length > 0 ? heroImages.map((url, idx) => (
            <img
              key={url}
              src={url}
              alt="Hero Background"
              // ✅ จุดที่แก้ 1: เปลี่ยน object-center เป็น object-[75%_center]
              // เพื่อให้จุดโฟกัสของภาพอยู่ค่อนไปทางขวา (ประมาณ 75% ของความกว้างภาพ) ไม่โดนยืดตรงกลาง
              className={`absolute inset-0 w-full h-full object-cover object-[75%_center] transition-all duration-[2500ms] ease-in-out ${idx === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
            />
          )) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <ImageIcon size={60} className="text-slate-300" />
            </div>
          )}
        </div>

        {/* 2. The Gradient Overlay Layer (ชั้นกลาง - ปรับให้ขาวทึบทางซ้ายมากขึ้น) */}
        {/* ✅ จุดที่แก้ 2: ปรับ gradient ให้สีขาวกินพื้นที่มาถึงประมาณ 60% ของจอ แล้วค่อยจางออก */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#FAFAFA] via-[#FAFAFA]/95 via-50% lg:via-60% to-transparent pointer-events-none"></div>

        {/* Optional: Texture กระดาษจางๆ (ถ้าไม่ชอบลบออกได้) */}
        <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>


        {/* 3. Content Layer (ชั้นบนสุด - เนื้อหา) */}
        <div className="container mx-auto px-6 lg:px-24 relative z-20 h-full flex items-center py-20 lg:py-0">
          {/* ✅ จุดที่แก้ 3: ปรับความกว้างคอนเทนต์เป็น lg:w-1/2 เพื่อให้ข้อความกระชับอยู่ฝั่งซ้าย ไม่ล้นไปทับรูปฝั่งขวา */}
          <div className="w-full lg:w-1/2 space-y-10 text-center lg:text-left mt-20 lg:mt-0">

            {/* Subtitle Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-xl rounded-full shadow-sm border border-[#F3E9DC] text-[#2D241E] animate-fade-in-up font-medium">
              <Sparkles size={16} className="text-[#D4A373]" />
              <span className="text-[15px] md:text-[16px] tracking-[0.15em] uppercase">{homeData.hero_subtitle}</span>
            </div>

            {/* Main Title */}
            <div className="space-y-8 animate-fade-in-up delay-100">
              <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black leading-[0.95] text-[#2D241E] tracking-tighter drop-shadow-sm">
                {homeData.hero_title.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? "text-[#2D241E] italic font-light block lg:inline" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h1>

              {/* Description */}
              <div className="relative pl-6 mx-auto lg:mx-0 max-w-xl border-l-4 border-[#D4A373]/30">
                <p className="text-[#2D241E]/80 text-xl lg:text-2xl leading-relaxed font-light">
                  {homeData.hero_description}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-8 animate-fade-in-up delay-200">
              <button
                onClick={() => navigate('/products')}
                className="group w-full sm:w-auto bg-[#2D241E] text-white pl-10 pr-8 py-5 rounded-full font-bold text-lg shadow-[0_20px_40px_-15px_rgba(45,36,30,0.3)] hover:bg-black hover:-translate-y-1 transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-4"
              >
                เริ่มสั่งซื้อขนม <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button className="group flex items-center gap-3 font-bold text-lg text-[#2D241E] uppercase tracking-[0.15em] hover:opacity-70 transition-all py-4 px-6 rounded-full hover:bg-white/50">
                เรื่องราวของเรา
                <MoveRight size={20} className="group-hover:translate-x-2 transition-transform text-[#D4A373]" />
              </button>
            </div>

          </div>
        </div>

        {/* 4. Slider Controls (มุมขวาล่าง) */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-12 right-12 flex items-center gap-6 z-30 hidden lg:flex">
            <div className="flex gap-2 mr-4 bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30">
              {heroImages.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-8 bg-[#2D241E]' : 'w-2 bg-[#2D241E]/40'}`} />
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={prevSlide} className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full text-[#2D241E] flex items-center justify-center hover:bg-[#2D241E] hover:text-white transition-all active:scale-90 border border-white/40 shadow-sm"><ChevronLeft size={20} /></button>
              <button onClick={nextSlide} className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full text-[#2D241E] flex items-center justify-center hover:bg-[#2D241E] hover:text-white transition-all active:scale-90 border border-white/40 shadow-sm"><ChevronRight size={20} /></button>
            </div>
          </div>
        )}
      </section>

      {/* --- 🥖 Signature Menu --- */}
      <section className="py-24 lg:py-44 relative bg-white z-10 overflow-hidden">
        <Cookie className="absolute top-[10%] left-[-2%] text-[#2D241E] opacity-[0.02]" size={150} />

        <div className="container mx-auto px-6 text-center">
          <div className="mb-24 space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black text-[#2D241E] uppercase tracking-tighter">
              เมนู <span className="font-light text-[#2D241E] italic">ยอดนิยม</span>
            </h2>
            <div className="h-1.5 w-20 bg-[#F3E9DC] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {products.map((p) => {
              const isLiked = wishlistedIds.includes(p.product_id);

              return (
                <div key={p.product_id} className="group relative flex flex-col bg-white rounded-[3rem] transition-all duration-500 hover:-translate-y-2">
                  {/* Image Container */}
                  <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden bg-slate-50 shadow-sm border border-slate-100/50">
                    <img
                      src={p.images?.[0]?.image_url || '/placeholder.png'}
                      className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                      alt={p.product_name}
                    />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Top Right Actions (Wishlist) */}
                    <div className="absolute top-5 right-5 z-20">
                      <button
                        onClick={() => toggleWishlist(p.product_id)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border border-white/50 backdrop-blur-md ${isLiked ? 'bg-white text-red-500' : 'bg-white/80 text-[#2D241E] hover:bg-white hover:text-red-500'
                          }`}
                      >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Bottom Actions (Add to Cart) */}
                    <div className="absolute inset-x-0 bottom-6 px-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <button
                        onClick={() => addToCart(p)}
                        className="w-full py-4 bg-[#2D241E] text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Plus size={18} /> เพิ่มลงตะกร้า
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="mt-6 px-4 text-center space-y-1">
                    <h3 className="text-xl font-bold text-[#2D241E] line-clamp-1">{p.product_name}</h3>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-slate-400 font-light uppercase tracking-wider">Homemade</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <p className="text-2xl font-black text-[#2D241E] italic">
                        ฿{Number(p.unit_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/products')}
            className="mt-20 group inline-flex items-center gap-3 text-[#2D241E] font-bold uppercase tracking-[0.2em] hover:gap-5 transition-all"
          >
            ดูเมนูทั้งหมด <MoveRight size={20} />
          </button>
        </div>
      </section>

      {/* --- 🍯 Customer Reviews --- */}
      <section className="py-32 bg-white relative z-10 border-y border-slate-50 overflow-hidden">
        <Smile className="absolute top-[20%] right-[-2%] text-[#2D241E] opacity-[0.02]" size={180} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-24 gap-10">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-4xl lg:text-6xl font-black text-[#2D241E] uppercase tracking-tighter italic">รีวิวจาก <span className="font-light text-[#2D241E]">คุณลูกค้า</span></h2>
              <p className="text-[#2D241E] text-[20px] tracking-[0.1em] font-medium uppercase">เรื่องราวความประทับใจจากถาดขนมของเรา</p>
            </div>
            <Quote size={100} className="text-slate-100 hidden lg:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((rev, idx) => (
              <div key={idx} className="bg-white p-12 rounded-[4.5rem] shadow-sm border border-slate-50 hover:shadow-xl transition-all duration-700">
                <div className="flex text-amber-400 gap-1.5 mb-10">
                  {[...Array(5)].map((_, i) => <Star key={i} size={15} fill={i < rev.rating_score ? "currentColor" : "none"} />)}
                </div>
                <p className="text-xl text-[#2D241E] italic leading-[1.8] mb-12 font-light">"{rev.comment}"</p>
                <div className="flex items-center gap-1 pt-1 border-t border-slate-50">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center font-black text-[#2D241E] border border-white shadow-sm">{rev.user?.first_name?.[0]}</div>
                  <span className="font-bold text-[#2D241E] text-[20px] uppercase tracking-widest">{rev.user?.first_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 📍 Map Section --- */}
      <section className="relative w-full h-[650px] bg-white z-10">
        <iframe
          title="Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.2818610738!2d100.536294!3d13.7516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ1JzA1LjgiTiAxMDDCsDMyJzEwLjciRQ!5e0!3m2!1sth!2sth!4v1625000000000!5m2!1sth!2sth"
          className="w-full h-full border-none grayscale-[0.8] opacity-50"
          allowFullScreen=""
          loading="lazy"
        ></iframe>
        <div className="absolute inset-x-0 bottom-16 px-6 z-20">
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl p-10 md:p-14 rounded-[5rem] shadow-2xl border border-white flex flex-col md:flex-row items-center gap-14">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-emerald-600 text-[20px] font-bold uppercase tracking-[0.1em] bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100/40">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> เปิดให้บริการปกติ
              </div>
              <h4 className="text-3xl lg:text-5xl font-black text-[#2D241E] tracking-tight italic uppercase">แวะมาหาเราได้ที่ร้าน</h4>
              <p className="text-[20px] text-[#2D241E]/90 leading-relaxed font-light italic">{homeData.shop_address}</p>
            </div>
            <div className="w-full md:w-auto flex flex-col gap-5">
              <a href={homeData.line_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-white text-[#2D241E] px-12 py-5 rounded-full border border-slate-100 hover:shadow-xl transition-all  text-xl font-bold tracking-widest shadow-md">
                <Send size={18} className="text-[#2D241E]" /> ติดต่อผ่าน LINE
              </a>
              <div className="text-center">
                <p className="text-[20px] font-bold text-[#2D241E] uppercase tracking-[0.1em] mb-1">โทรศัพท์ติดต่อ</p>
                <p className="text-xl font-black text-[#2D241E]">{homeData.shop_phone}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer userData={userData} />

      {/* --- 📝 Admin Modal --- */}
      {
        isEditModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white/20 backdrop-blur-xl p-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-[5rem] w-full max-w-3xl p-12 lg:p-20 shadow-2xl border border-white relative max-h-[92vh] overflow-y-auto no-scrollbar">
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-12 right-12 p-4 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-full border border-slate-50 shadow-sm"><X size={20} /></button>
              <div className="mb-16 text-center">
                <p className="text-[#2D241E] font-bold text-[20px] uppercase tracking-[0.6em] mb-4">Branding Studio</p>
                <h2 className="text-4xl font-black text-[#2D241E] tracking-tight uppercase italic leading-none">ปรับปรุงเนื้อหา <span className="font-light">หน้าหลัก</span></h2>
              </div>
              <form onSubmit={handleUpdateContent} className="space-y-12 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[20px] font-bold text-[#2D241E] uppercase ml-6 tracking-widest">หัวข้อหลัก (Title)</label>
                    <input name="hero_title" type="text" value={homeData.hero_title} onChange={(e) => setHomeData({ ...homeData, hero_title: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-full focus:bg-white focus:border-[#F3E9DC] outline-none font-bold text-[#2D241E] transition-all shadow-inner" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[20px] font-bold text-[#2D241E] uppercase ml-6 tracking-widest">หัวข้อย่อย (Subtitle)</label>
                    <input name="hero_subtitle" type="text" value={homeData.hero_subtitle} onChange={(e) => setHomeData({ ...homeData, hero_subtitle: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-full focus:bg-white focus:border-[#F3E9DC] outline-none font-bold text-[#2D241E] transition-all shadow-inner" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[20px] font-bold text-[#2D241E] uppercase ml-6 tracking-widest">คำอธิบาย</label>
                  <textarea name="hero_description" value={homeData.hero_description} onChange={(e) => setHomeData({ ...homeData, hero_description: e.target.value })} className="w-full px-10 py-8 bg-slate-50 border border-transparent rounded-[3rem] focus:bg-white focus:border-[#F3E9DC] outline-none h-40 resize-none font-light shadow-inner transition-all" />
                </div>

                <div className="space-y-6">
                  <label className="text-[20px] font-bold text-[#2D241E] uppercase ml-6 tracking-widest">รูปภาพแบนเนอร์</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-5">

                    {/* 1. แสดงรูปเดิมที่มีอยู่ใน Server */}
                    {heroImages.map((url) => (
                      <div key={url} className={`relative aspect-square rounded-[2rem] overflow-hidden border-4 transition-all duration-300 ${imagesToDelete.includes(url) ? 'opacity-30 border-red-200 scale-90' : 'border-white shadow-md'}`}>
                        <img src={url} className="w-full h-full object-cover" alt="" />
                        <button
                          type="button"
                          onClick={() => setImagesToDelete(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url])}
                          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-all"
                        >
                          {imagesToDelete.includes(url) ? (
                            <div className="bg-white p-2 rounded-full text-red-500 shadow-lg"><Undo2 size={20} /></div>
                          ) : (
                            <div className="bg-red-500 p-2 rounded-full text-white shadow-lg"><Trash2 size={20} /></div>
                          )}
                        </button>
                      </div>
                    ))}

                    {/* 2. แสดงรูปใหม่ที่กำลังจะอัปโหลด (Preview) */}
                    {newPreviews.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-[#F3E9DC] shadow-md animate-in zoom-in">
                        <img src={url} className="w-full h-full object-cover" alt="preview" />
                        <div className="absolute top-2 left-2 bg-[#F3E9DC] text-[#2D241E] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">New</div>
                        <button
                          type="button"
                          onClick={() => {
                            // ลบทั้งไฟล์และรูปพรีวิวออก
                            setNewHeroFiles(prev => prev.filter((_, i) => i !== index));
                            setNewPreviews(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-all"
                        >
                          <div className="bg-white p-2 rounded-full text-red-500 shadow-lg"><X size={20} /></div>
                        </button>
                      </div>
                    ))}

                    {/* 3. ปุ่มกดเพิ่มรูป */}
                    <label className="aspect-square flex flex-col items-center justify-center bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2rem] cursor-pointer hover:border-[#F3E9DC] transition-all group">
                      <Plus className="text-slate-300 group-hover:text-[#2D241E] transition-colors" size={32} />
                      <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">เพิ่มรูปภาพ</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (files.length > 0) {
                            setNewHeroFiles(prev => [...prev, ...files]);
                            // สร้าง URL สำหรับพรีวิว
                            const urls = files.map(f => URL.createObjectURL(f));
                            setNewPreviews(prev => [...prev, ...urls]);
                          }
                        }}
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>

                <button type="submit" disabled={isUpdating} className="w-full bg-[#2D241E] text-white py-6 rounded-full font-black uppercase tracking-widest  text-xl shadow-xl hover:bg-black transition-all active:scale-95 disabled:bg-slate-200">
                  {isUpdating ? <Loader2 className="animate-spin mx-auto" size={24} /> : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </form>
            </div>
          </div>
        )
      }

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div >
  );
};

export default Home;