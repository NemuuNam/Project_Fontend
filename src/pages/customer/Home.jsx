import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Edit3, X, Loader2, Save, Settings,
  Star, ImageIcon, Heart, Plus, MessageCircle,
  Quote, MoveRight, Trash2, ChevronLeft,
  ChevronRight, Sparkles, Leaf, Cookie, Utensils, Smile,
  MapPin, Phone, Instagram, Send, Navigation, Compass, Undo2, ShoppingBag, ExternalLink
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
      if (reviewRes.status === 'fulfilled' && reviewRes.value.success) setReviews((reviewRes.value.data || []).slice(0, 3));
      if (wishRes.status === 'fulfilled' && wishRes.value.success) setWishlistedIds((wishRes.value.data || []).map(w => w.product_id));
    } catch (err) { console.error("Initialization failed", err); }
    finally { setLoading(false); }
  }, [userData]);

  useEffect(() => { initPage(); }, [initPage]);

  // --- 🎠 Slider Logic ---
  const nextSlide = useCallback(() => {
    if (heroImages.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  }, [heroImages.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

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
        setImagesToDelete([]);
        setNewHeroFiles([]);
        setNewPreviews([]);
        setIsEditModalOpen(false);
        initPage();
      }
    } catch (err) { toast.error("บันทึกไม่สำเร็จ"); }
    finally { setIsUpdating(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={48} /></div>;

  return (
    <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden selection:bg-[#F3E9DC] relative">

      {/* ☁️ Global Background Patterns */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Leaf className="absolute top-[10%] left-[-5%] text-[#2D241E] opacity-[0.02] rotate-12" size={300} />
        <Cookie className="absolute top-[60%] right-[-5%] text-[#2D241E] opacity-[0.03] -rotate-12" size={250} />
      </div>

      <Toaster position="bottom-right" />
      <HeaderHome userData={userData} />

      {/* --- 🛠️ Admin Tool Bar --- */}
      {isStaff && (
        <div className="bg-white/95 py-4 flex justify-center backdrop-blur-md sticky top-[72px] z-[90] border-b-2 border-slate-100 shadow-sm">
          <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#2D241E] bg-white px-8 py-3 rounded-full shadow-lg border-2 border-[#2D241E] hover:bg-[#2D241E] hover:text-white transition-all">
            <Settings size={14} strokeWidth={3} className={isUpdating ? "animate-spin" : ""} />
            {isUpdating ? "UPDATING..." : "Customize Home"}
          </button>
        </div>
      )}

      {/* --- 🥧 Hero Section (Balanced) --- */}
      <section className="relative min-h-[85vh] lg:min-h-screen flex items-center overflow-hidden bg-[#FAFAFA]">
        <div className="absolute inset-0 z-0">
          {heroImages.length > 0 ? heroImages.map((url, idx) => (
            <img
              key={url}
              src={url}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover object-[75%_center] transition-all duration-[2000ms] ease-in-out ${idx === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
            />
          )) : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><ImageIcon size={60} /></div>}
        </div>

        {/* Overlay for Contrast */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none"></div>

        <div className="container mx-auto px-6 lg:px-20 relative z-20 h-full flex items-center py-20 lg:py-0">
          <div className="w-full lg:w-3/5 space-y-8 text-center lg:text-left">
            
            {/* Subtitle Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-1.5 bg-[#2D241E] rounded-full shadow-lg text-white animate-fade-in-up">
              <Sparkles size={14} strokeWidth={3} />
              <span className="text-xs font-black tracking-widest uppercase">{homeData.hero_subtitle}</span>
            </div>

            <div className="space-y-6 animate-fade-in-up delay-100">
              {/* ปรับลดขนาดจาก 110px เป็น 8xl (96px) */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] text-[#2D241E] tracking-tighter italic">
                {homeData.hero_title}
              </h1>
              <div className="relative pl-6 lg:pl-8 max-w-xl border-l-4 lg:border-l-8 border-[#2D241E]">
                <p className="text-lg lg:text-xl leading-relaxed font-bold italic text-[#2D241E]/90">
                  {homeData.hero_description}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 animate-fade-in-up delay-200">
              <button onClick={() => navigate('/products')} className="group w-full sm:w-auto bg-[#2D241E] text-white px-10 py-5 rounded-full font-black text-lg shadow-xl hover:bg-black hover:scale-105 transition-all flex items-center justify-center gap-3 uppercase tracking-widest italic">
                BROWSE MENU <ChevronRight strokeWidth={4} size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- 🥖 Signature Menu (Matched Size) --- */}
      <section className="py-20 lg:py-32 relative bg-white z-10 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-16 space-y-3">
            {/* ปรับหัวข้อลงให้สมดุล */}
            <h2 className="text-4xl lg:text-6xl font-black text-[#2D241E] uppercase tracking-tighter italic">
              Menu <span className="font-light not-italic opacity-40">Highlight</span>
            </h2>
            <div className="h-1.5 w-20 bg-[#2D241E] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p) => {
              const isLiked = wishlistedIds.includes(p.product_id);
              return (
                <div key={p.product_id} className="group flex flex-col bg-white rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2">
                  <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-slate-50 border-2 border-slate-100 shadow-sm">
                    <img src={p.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt="" />
                    <div className="absolute top-4 right-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-xl ${isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-[#2D241E]'}`}>
                        <Heart size={18} strokeWidth={3} fill={isLiked ? "currentColor" : "none"} />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-4 px-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <button onClick={() => navigate('/products')} className="w-full py-3.5 bg-[#2D241E] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black italic">
                        View More Info
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 text-center space-y-1">
                    <h3 className="text-lg font-black text-[#2D241E] uppercase truncate italic px-2">{p.product_name}</h3>
                    <p className="text-2xl font-black text-[#2D241E] italic">฿{Number(p.unit_price).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={() => navigate('/products')} className="mt-16 group inline-flex items-center gap-3 text-[#2D241E] font-black text-lg uppercase tracking-widest hover:gap-6 transition-all border-b-4 border-[#2D241E] pb-1 italic">
            VIEW ALL COLLECTIONS <MoveRight size={22} strokeWidth={3} />
          </button>
        </div>
      </section>

      {/* --- 🍯 Customer Reviews (High Contrast) --- */}
      <section className="py-24 bg-slate-50 relative z-10 border-y-2 border-slate-100">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-6 text-left">
            <div className="space-y-1">
              <h2 className="text-4xl lg:text-6xl font-black text-[#2D241E] uppercase tracking-tighter italic leading-none">Customer <span className="font-light not-italic opacity-40">Voices</span></h2>
              <p className="text-[#2D241E] text-lg font-black uppercase tracking-widest italic opacity-80">ความประทับใจจากลูกค้าของเรา</p>
            </div>
            <Quote size={64} strokeWidth={3} className="text-[#2D241E] opacity-10 hidden lg:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-xl border-2 border-white hover:border-[#2D241E]/10 transition-all duration-500 text-left">
                <div className="flex text-[#2D241E] gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} strokeWidth={3} fill={i < rev.rating_score ? "currentColor" : "none"} />)}
                </div>
                <p className="text-lg text-[#2D241E] font-bold italic leading-relaxed mb-10">"{rev.comment}"</p>
                <div className="flex items-center gap-4 pt-6 border-t-2 border-slate-50">
                  <div className="w-10 h-10 bg-[#2D241E] rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md uppercase">{rev.user?.first_name?.[0]}</div>
                  <span className="font-black text-[#2D241E] text-base uppercase tracking-widest italic">{rev.user?.first_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 📍 Contact Section (Darkened Labels) --- */}
      <section className="relative w-full h-[650px] bg-white z-10">
        <iframe
          title="Map"
          src="https://maps.google.com/maps?q=13.7563,100.5018&z=15&output=embed"
          className="w-full h-full border-none grayscale-[0.6] opacity-50"
          allowFullScreen=""
        ></iframe>
        <div className="absolute inset-x-0 bottom-12 px-4 z-20">
          <div className="max-w-4xl mx-auto bg-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl border-2 border-slate-100 flex flex-col md:flex-row items-center gap-10 md:gap-16 text-[#2D241E]">
            <div className="flex-1 space-y-5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-[#05CD99] text-xs font-black uppercase tracking-widest bg-emerald-50 px-5 py-1.5 rounded-full border border-emerald-100">
                <div className="w-2 h-2 bg-[#05CD99] rounded-full animate-pulse"></div> SHOP IS OPEN
              </div>
              <h4 className="text-3xl lg:text-4xl font-black tracking-tighter italic uppercase">แวะมาหาเราได้ที่ร้าน</h4>
              <p className="text-base lg:text-lg font-bold italic opacity-90 leading-relaxed">{homeData.shop_address}</p>
            </div>
            <div className="w-full md:w-auto flex flex-col gap-3">
              <a href={homeData.line_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-[#2D241E] text-white px-10 py-4 rounded-full font-black text-base tracking-widest shadow-xl hover:bg-black transition-all uppercase italic">
                <Send size={18} strokeWidth={3} /> Line Us
              </a>
              <div className="text-center md:text-right pt-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D241E] opacity-40 mb-1">Direct Call</p>
                <p className="text-2xl font-black italic tracking-tighter text-[#2D241E]">{homeData.shop_phone}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer userData={userData} />

      {/* --- 📝 Admin Edit Modal (High Contrast) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#2D241E]/50 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 lg:p-12 shadow-2xl border-4 border-[#2D241E] relative max-h-[90vh] overflow-y-auto text-left">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-50 text-[#2D241E] hover:text-red-500 rounded-full border-2 border-[#2D241E] transition-all"><X size={20} strokeWidth={3} /></button>

            <div className="mb-10 pb-6 border-b-2 border-slate-100">
              <h2 className="text-3xl font-black text-[#2D241E] uppercase italic tracking-tighter">Edit <span className="font-light opacity-30 not-italic">Homepage</span></h2>
            </div>

            <form onSubmit={handleUpdateContent} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-[#2D241E] ml-2 tracking-widest">Headline Title</label>
                <input type="text" value={homeData.hero_title} onChange={(e) => setHomeData({ ...homeData, hero_title: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#2D241E] outline-none font-bold text-[#2D241E]" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-[#2D241E] ml-2 tracking-widest">Subtitle Badge</label>
                <input type="text" value={homeData.hero_subtitle} onChange={(e) => setHomeData({ ...homeData, hero_subtitle: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#2D241E] outline-none font-bold text-[#2D241E]" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-[#2D241E] ml-2 tracking-widest">Story Description</label>
                <textarea value={homeData.hero_description} onChange={(e) => setHomeData({ ...homeData, hero_description: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#2D241E] outline-none font-bold text-[#2D241E] h-32 resize-none leading-relaxed" />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-[#2D241E] ml-2 tracking-widest">Slide Banners</label>
                <div className="grid grid-cols-4 gap-3">
                  {heroImages.map((url) => (
                    <div key={url} className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${imagesToDelete.includes(url) ? 'opacity-20 border-red-500 scale-90' : 'border-slate-100'}`}>
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => setImagesToDelete(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url])} className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-all text-white"><Trash2 size={20} strokeWidth={3} /></button>
                    </div>
                  ))}
                  <label className="aspect-square flex items-center justify-center bg-slate-50 border-2 border-dashed border-[#2D241E]/20 rounded-xl cursor-pointer hover:border-[#2D241E] transition-all">
                    <Plus className="text-slate-300" size={24} strokeWidth={3} />
                    <input type="file" multiple className="hidden" onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setNewHeroFiles(prev => [...prev, ...files]);
                      setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
                    }} accept="image/*" />
                  </label>
                </div>
              </div>

              <button type="submit" disabled={isUpdating} className="w-full bg-[#2D241E] text-white py-5 rounded-full font-black uppercase tracking-widest text-lg shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50">
                {isUpdating ? "SAVING CHANGES..." : "SAVE HOMEPAGE"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E; border-radius: 10px; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 0.15s; }
        .delay-200 { animation-delay: 0.3s; }
      `}} />
    </div >
  );
};

export default Home;