import React, { useState, useEffect, useCallback } from 'react';
import {
  Edit3, ArrowRight, ShoppingBag, X, Loader2, Save, Settings,
  Star, Image as ImageIcon, Heart, Plus, Quote, MapPin, Clock, 
  Phone, MessageCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

// --- นำเข้า API Config และ Instance ---
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';

import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const Home = ({ userData }) => {
  const navigate = useNavigate();

  // --- States ข้อมูล ---
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]); // ข้อมูลจากตาราง Product_Reviews
  const [homeData, setHomeData] = useState({
    hero_title: 'SOOO GUICHAI',
    hero_subtitle: 'PREMIUM GUICHAI RECIPE',
    hero_description: '',
    hero_image_url: '',
    promotion_text: '',
    address: 'กำลังโหลดข้อมูลที่อยู่ร้าน...'
  });

  // --- States ระบบ ---
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // ตรวจสอบสิทธิ์ผู้ดูแลระบบ
  const isAdminManager = userData && [1, 2].includes(Number(userData.role_level));
  const isStaff = userData && [1, 2, 3].includes(Number(userData.role_level));

  // 1. ฟังก์ชันดึงข้อมูลทั้งหมด
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

      // ดึงข้อมูล Rating และ Comment จาก Product_Reviews
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

  // 2. ฟังก์ชันเพิ่มลงตะกร้า
  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.product_id === product.product_id);
    if (existing) existing.quantity += 1;
    else cart.push({ product_id: product.product_id, name: product.product_name, price: product.unit_price, image: product.images?.[0]?.image_url || '/placeholder.png', quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage')); 
    toast.success(`เพิ่มลงตะกร้าแล้ว`);
  };

  // 3. ฟังก์ชันอัปเดตข้อมูล Admin
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#fdfbf2]"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#fdfbf2]/20 font-['Kanit'] text-[#1b2559]">
      <Toaster position="top-right" />
      <HeaderHome userData={userData} />

      {/* --- 1. Admin Control Bar --- */}
      {isAdminManager && (
        <div className="bg-[#1b2559] text-white py-2 px-6 sticky top-[72px] z-40 shadow-lg border-b border-white/10 backdrop-blur-md bg-opacity-95">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase opacity-60"><Settings size={14} /> Admin Tools</div>
            <input type="text" className="flex-1 max-w-xl px-4 py-1.5 rounded-lg text-gray-800 text-xs outline-none" placeholder="ประกาศด่วน..." value={homeData.promotion_text || ''} onChange={(e) => setHomeData({...homeData, promotion_text: e.target.value})} />
            <button onClick={handleSavePromotion} disabled={isUpdating} className="bg-[#e8c4a0] text-[#1b2559] px-4 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors">
               {isUpdating ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />} บันทึก
            </button>
          </div>
        </div>
      )}

      {/* --- 2. Promotion Banner --- */}
      {homeData.promotion_text && (
        <div className="bg-[#e8c4a0] py-2.5 px-4 text-center font-bold text-sm border-b border-[#d4b08c]/20 shadow-sm">
          <span className="inline-block animate-bounce mr-2">📢</span> {homeData.promotion_text}
        </div>
      )}

      {/* --- 3. Hero Section (สวยเหมือนตอนแรก) --- */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 px-6 overflow-hidden">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="lg:w-[45%] text-center lg:text-left space-y-8 order-2 lg:order-1">
            {isStaff && (
              <button onClick={() => setIsEditModalOpen(true)} className="inline-flex items-center gap-2 bg-white/90 border border-gray-100 px-4 py-2 rounded-2xl text-[10px] font-bold text-blue-600 shadow-sm hover:shadow-md transition-all">
                <Edit3 size={14} /> ปรับแต่งหน้าแรก
              </button>
            )}
            <div className="space-y-4">
              <span className="text-[#d4b08c] font-black text-xs tracking-[0.3em] uppercase">{homeData.hero_subtitle}</span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight tracking-tighter">
                {homeData.hero_title.split(' ')[0]} <br />
                <span className="text-[#e8c4a0]">{homeData.hero_title.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-gray-500 text-base md:text-lg max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">{homeData.hero_description}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button onClick={() => navigate('/products')} className="bg-[#1b2559] text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-[#e8c4a0] transition-all transform active:scale-95 w-full sm:w-auto">เริ่มสั่งซื้อ</button>
              <button onClick={() => navigate('/products')} className="flex items-center gap-2 font-bold hover:text-[#e8c4a0] transition-colors group">
                ดูเมนูทั้งหมด <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="lg:w-[55%] flex justify-center order-1 lg:order-2 w-full">
            <div className="relative w-full max-w-[600px]">
              <div className="absolute -inset-4 bg-[#e8c4a0]/10 rounded-[3rem] rotate-2 blur-3xl"></div>
              <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border-[6px] md:border-[12px] border-white aspect-[16/10]">
                <img src={homeData.hero_image_url || "/placeholder-hero.png"} alt="Hero" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. สินค้าขายดี (Responsive Grid) --- */}
      <section className="py-24 bg-white rounded-t-[5rem] shadow-inner">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-4 text-center md:text-left">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#1b2559]">สินค้าขายดี</h2>
              <p className="text-gray-500 text-sm md:text-base font-medium">เมนูยอดนิยมที่ลูกค้าเลือกสั่งมากที่สุด</p>
            </div>
            <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-[#1b2559] font-bold hover:text-[#d4b08c] transition-all group">
              ดูทั้งหมด <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {products.map((product) => (
              <div key={product.product_id} className="group bg-white rounded-[2.5rem] p-5 border-2 border-gray-100 hover:border-[#e8c4a0] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative">
                <div className="absolute top-8 left-8 z-10"><span className="bg-[#1b2559] text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"><Star size={10} fill="currentColor" /> BEST SELLER</span></div>
                <div className="relative aspect-square overflow-hidden rounded-[2rem] mb-6 bg-gray-50">
                  <img src={product.images[0]?.image_url || '/placeholder.png'} alt={product.product_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <button className="absolute bottom-4 right-4 bg-white/95 backdrop-blur p-3 rounded-2xl text-gray-400 hover:text-red-500 transition-all shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
                    <Heart size={20} />
                  </button>
                </div>
                <div className="px-1 flex flex-col flex-grow">
                  <span className="text-[9px] font-black text-[#1b2559] uppercase tracking-widest bg-[#e8c4a0] px-3 py-1 rounded-lg w-fit">{product.category?.category_name || 'เมนูแนะนำ'}</span>
                  <h3 className="text-lg font-extrabold text-[#1b2559] mt-3 line-clamp-1">{product.product_name}</h3>
                  <div className="flex justify-between items-center mt-auto pt-5 border-t border-gray-50">
                    <span className="text-2xl font-black text-[#1b2559]">฿{product.unit_price}</span>
                    <button onClick={() => addToCart(product)} className="bg-[#1b2559] text-white p-3.5 rounded-[1.2rem] hover:bg-[#e8c4a0] hover:text-[#1b2559] transition-all active:scale-90 shadow-md group/btn"><ShoppingBag size={20} className="group-hover/btn:scale-110 transition-transform" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 5. รีวิวจากลูกค้า (ดึงจริงจากตาราง Product_Reviews) --- */}
      <section className="py-24 bg-[#fdfbf2]/40 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#1b2559] mb-4">เสียงจากลูกค้าของเรา</h2>
            <p className="text-gray-500 font-medium text-sm md:text-base">ยืนยันความอร่อยจากคะแนนรีวิวจริงในระบบ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.length > 0 ? reviews.map((review, idx) => (
              <div key={idx} className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-gray-100 relative transition-all hover:-translate-y-2">
                <Quote className="absolute top-8 right-8 text-[#e8c4a0]/20" size={48} />
                <div className="flex gap-1 mb-5 text-[#e8c4a0]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < review.rating_score ? "currentColor" : "none"} className={i < review.rating_score ? "" : "text-gray-200"} />)}
                </div>
                <p className="text-gray-600 italic mb-8 leading-relaxed text-sm md:text-base">"{review.comment || 'ไม่มีข้อความรีวิว'}"</p>
                <div className="flex items-center gap-4 border-t border-gray-50 pt-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1b2559] text-white rounded-full flex items-center justify-center font-bold">{review.user?.first_name?.charAt(0) || 'U'}</div>
                  <div>
                    <span className="font-bold text-[#1b2559] block text-sm md:text-base">{review.user?.first_name ? `${review.user.first_name} ${review.user.last_name}` : 'ลูกค้าทั่วไป'}</span>
                    <span className="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-widest">Verified Buyer</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-10 text-center text-gray-400 font-medium italic">ยังไม่มีข้อมูลรีวิวในขณะนี้</div>
            )}
          </div>
        </div>
      </section>

      {/* --- 6. แผนที่และที่ตั้งร้าน (Fixed Map) --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2 space-y-8 w-full">
              <div className="space-y-4 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-black text-[#1b2559]">แวะมาหาเราที่ร้าน</h2>
                <p className="text-gray-500 leading-relaxed text-sm md:text-base">เรายินดีต้อนรับทุกท่านสู่หน้าร้านกุยช่ายสูตรพรีเมียม สดใหม่จากเตาทุกวัน</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-6 bg-[#fdfbf2] rounded-[2rem] border border-[#e8c4a0]/20">
                  <div className="p-3 bg-white rounded-xl text-[#e8c4a0] shadow-sm"><MapPin size={24}/></div>
                  <div>
                    <h4 className="font-bold text-[#1b2559] text-sm md:text-base">ที่อยู่ร้าน</h4>
                    <p className="text-[11px] md:text-xs text-gray-500 mt-1 leading-relaxed">{homeData.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-[#fdfbf2] rounded-[2rem] border border-[#e8c4a0]/20">
                  <div className="p-3 bg-white rounded-xl text-[#05cd99] shadow-sm"><Clock size={24}/></div>
                  <div>
                    <h4 className="font-bold text-[#1b2559] text-sm md:text-base">เวลาเปิด-ปิด</h4>
                    <p className="text-[11px] md:text-xs text-gray-500 mt-1">ทุกวัน: 08:00 - 18:00 น.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 py-4 bg-[#1b2559] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#e8c4a0] transition-all">
                  <Phone size={18} /> ติดต่อสอบถาม
                </button>
                <button className="flex-1 py-4 border-2 border-[#1b2559] text-[#1b2559] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#f4f7fe] transition-all">
                  <MessageCircle size={18} /> ทักแชท LINE
                </button>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border-[6px] md:border-[12px] border-white h-[350px] md:h-[450px] relative group">
                <iframe
                  title="Shop Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.460773667523!2d100.5303!3d13.7367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ0JzEyLjAiTiAxMDDCsDMxJzQ5LjEiRQ!5e0!3m2!1sth!2sth!4v1630000000000!5m2!1sth!2sth"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer userData={userData} />

      {/* --- Edit Modal (Admin UI) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1b2559]/30 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative border border-gray-100 animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-[#1b2559]"><Settings size={22} className="text-[#e8c4a0]" /> จัดการหน้าแรก</h2>
            <form onSubmit={handleHeroUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="หัวข้อหลัก" value={homeData.hero_title} onChange={(e) => setHomeData({...homeData, hero_title: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl outline-none ring-[#e8c4a0] focus:ring-2 font-bold text-sm" />
                <input type="text" placeholder="หัวข้อรอง" value={homeData.hero_subtitle} onChange={(e) => setHomeData({...homeData, hero_subtitle: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl outline-none ring-[#e8c4a0] focus:ring-2 font-bold text-sm" />
              </div>
              <textarea placeholder="คำอธิบาย" value={homeData.hero_description} onChange={(e) => setHomeData({...homeData, hero_description: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl outline-none ring-[#e8c4a0] focus:ring-2 text-sm h-24" />
              <div className="border-2 border-dashed border-gray-200 rounded-[2rem] aspect-video flex items-center justify-center relative bg-gray-50">
                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover rounded-[2rem]" alt="Preview" /> : <label className="cursor-pointer text-gray-400 flex flex-col items-center"><ImageIcon size={30} /><span className="text-[10px] font-bold mt-2">คลิกอัปโหลดรูปภาพ Hero</span><input type="file" className="hidden" onChange={handleFileChange} /></label>}
              </div>
              <button type="submit" disabled={isUpdating} className="w-full bg-[#1b2559] text-white py-4 rounded-2xl font-black shadow-xl hover:bg-[#4318ff] transition-all flex justify-center gap-2">
                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} บันทึกข้อมูลทั้งหมด
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;