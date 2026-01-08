import React, { useState, useEffect } from 'react';
import {
  Mail, Phone, MapPin, Facebook, Instagram, MessageCircle,
  ShieldCheck, Sparkles, Leaf, Cookie, Smile, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Footer = ({ userData }) => {
  const currentYear = 2026;

  // --- 📦 Logic (คงเดิม 100% ตามคำสั่ง) ---
  const [shopInfo, setShopInfo] = useState({
    shop_name: 'COOKIE STORE',
    address: 'กำลังโหลดข้อมูล...',
    phone: '-',
    email: '-',
    facebook_url: '#',
    instagram_url: '#',
    line_url: '#',
    hero_description: 'คัดสรรวัตถุดิบคุณภาพเพื่อคุณในทุกๆ วัน'
  });

  const isStaff = userData && [1, 2, 3].includes(Number(userData.role_level));

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
        if (res.success && res.data) {
          const d = res.data;
          setShopInfo({
            shop_name: (d.shop_name && d.shop_name !== "EMPTY") ? d.shop_name : 'COOKIE STORE',
            address: (d.address && d.address !== "EMPTY") ? d.address : 'ยังไม่ระบุที่อยู่ร้าน',
            phone: (d.phone && d.phone !== "EMPTY") ? d.phone : '-',
            email: (d.email && d.email !== "EMPTY") ? d.email : '-',
            facebook_url: d.facebook_url || '#',
            instagram_url: d.instagram_url || '#',
            line_url: d.line_url || '#',
            hero_description: d.hero_description || 'คัดสรรวัตถุดิบคุณภาพเพื่อคุณในทุกๆ วัน'
          });
        }
      } catch (err) { console.error("Footer fetch failed:", err); }
    };
    fetchShopInfo();
  }, []);

  return (
    <footer className="relative bg-[#ffffff] border-t border-slate-100 font-['Kanit'] text-[#2D241E] overflow-hidden">

      {/* ☁️ Cozy Patterns (Gimmick ลายเส้นจางๆ Opacity 0.02 - 0.03) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Leaf className="absolute top-[20%] left-[5%] rotate-12 opacity-[0.03]" size={150} />
        <Cookie className="absolute bottom-[20%] right-[5%] -rotate-12 opacity-[0.03]" size={120} />
        <Smile className="absolute top-[40%] right-[15%] opacity-[0.02]" size={180} />
        <Sparkles className="absolute top-[10%] left-[40%] opacity-[0.02]" size={80} />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* ส่วนที่ 1: แบรนด์และตัวตนร้าน */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#2D241E] shadow-sm border border-slate-50">
                <Cookie size={28} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                {shopInfo.shop_name}
              </h2>
            </div>
            <p className="text-[#2D241E] font-medium leading-relaxed opacity-60 max-w-md text-lg">
              {shopInfo.hero_description}
            </p>
            <div className="flex space-x-3">
              <a href={shopInfo.facebook_url} target="_blank" rel="noreferrer" className="p-4 bg-white border border-slate-100 rounded-2xl text-[#2D241E] hover:shadow-md hover:-translate-y-1 transition-all active:scale-95">
                <Facebook size={20} />
              </a>
              <a href={shopInfo.instagram_url} target="_blank" rel="noreferrer" className="p-4 bg-white border border-slate-100 rounded-2xl text-[#2D241E] hover:shadow-md hover:-translate-y-1 transition-all active:scale-95">
                <Instagram size={20} />
              </a>
              <a href={shopInfo.line_url} target="_blank" rel="noreferrer" className="p-4 bg-white border border-slate-100 rounded-2xl text-[#2D241E] hover:shadow-md hover:-translate-y-1 transition-all active:scale-95">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* ส่วนที่ 2: ลิงก์เมนูหลัก */}
          <div className="lg:col-span-3 text-left">
            <h3 className="text-[15px] font-black text-[#2D241E] opacity-70 mb-8 tracking-[0.5em] uppercase flex items-center gap-2 leading-none">
              การสำรวจเว็ปไซต์
            </h3>
            <ul className="space-y-5 text-[#2D241E] font-bold">
              {[
                { name: 'หน้าแรก', path: '/' },
                { name: 'รายการสินค้า', path: '/products' },
                { name: 'ตะกร้าของฉัน', path: '/cart' },
                { name: 'ประวัติสั่งซื้อ', path: '/my-orders' }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="hover:opacity-60 transition-all flex items-center group text-base">
                    <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all mr-2" />
                    {item.name}
                  </Link>
                </li>
              ))}

              {isStaff && (
                <li className="pt-6">
                  <Link to="/admin/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 rounded-full text-[#D97706] text-xs font-black italic uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
                    <ShieldCheck size={14} />
                    ระบบจัดการหลังบ้าน
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* ส่วนที่ 3: ข้อมูลการติดต่อ */}
          <div className="lg:col-span-4 text-left">
            <div className="bg-white p-8 md:p-10 rounded-[3.5rem] border border-slate-50 shadow-sm relative overflow-hidden group">
              <Smile className="absolute -right-4 -bottom-4 opacity-[0.02] rotate-12 transition-transform group-hover:scale-110" size={100} />
              <h3 className="text-[15px] font-black text-[#2D241E] opacity-70 mb-8 tracking-[0.5em] uppercase leading-none">ติดต่อเรา</h3>
              <ul className="space-y-8 text-[#2D241E] relative z-10">
                <li className="flex items-start space-x-5 group/item">
                  <div className="p-3 bg-slate-50/50 rounded-2xl transition-transform group-hover/item:scale-110">
                    <MapPin size={20} className="shrink-0 opacity-40" />
                  </div>
                  <span className="text-sm font-medium leading-relaxed">
                    {shopInfo.address}
                  </span>
                </li>
                <li className="flex items-center space-x-5 group/item">
                  <div className="p-3 bg-slate-50/50 rounded-2xl transition-transform group-hover/item:scale-110">
                    <Phone size={20} className="shrink-0 opacity-40" />
                  </div>
                  <span className="text-base font-black tracking-wider">{shopInfo.phone}</span>
                </li>
                <li className="flex items-center space-x-5 group/item">
                  <div className="p-3 bg-slate-50/50 rounded-2xl transition-transform group-hover/item:scale-110">
                    <Mail size={20} className="shrink-0 opacity-40" />
                  </div>
                  <span className="text-base font-black break-all">{shopInfo.email}</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* --- ส่วนล่างสุดของ Footer --- */}
      <div className="border-t border-slate-50 py-2 bg-white relative z-10">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <p className="text-[15px] font-black text-[#2D241E] opacity-20 tracking-[0.4em] uppercase mb-1">
              © {currentYear} {shopInfo.shop_name}
            </p>
            <p className="text-[13px] font-bold text-[#2D241E] opacity-10 tracking-widest uppercase">
              สงวนลิขสิทธิ์ความอร่อยทั้งหมด
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}} />
    </footer>
  );
};

export default Footer;