import React, { useState, useEffect } from 'react';
import {
  Mail, Phone, MapPin, Facebook, Instagram, MessageCircle,
  ShieldCheck, Leaf, Cookie, ChevronRight, Heart, Store,
  Package, Info, PhoneCall, Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Footer = ({ userData }) => {
  const currentYear = 2026;

  const [shopInfo, setShopInfo] = useState({
    shop_name: 'SOOO GUICHAI',
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
            shop_name: (d.shop_name && d.shop_name !== "EMPTY") ? d.shop_name : 'SOOO GUICHAI',
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
    <footer className="relative bg-white font-['Kanit'] text-[#2D241E] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      
      {/* ☁️ Decorative Elements (Very Subtle) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02]">
        <Leaf className="absolute top-10 left-[5%] rotate-12" size={120} />
        <Cookie className="absolute bottom-10 right-[5%] -rotate-12" size={150} />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* ส่วนที่ 1: Brand Identity - Match Header Style */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#2D241E] text-white rounded-xl shadow-lg rotate-3">
                <Store size={26} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-[#2D241E]">
                {shopInfo.shop_name}
              </h2>
            </div>
            
            <p className="text-[#2D241E] font-bold leading-relaxed max-w-sm text-lg italic opacity-70">
              "{shopInfo.hero_description}"
            </p>

            {/* Social Icons - No thick borders */}
            <div className="flex space-x-3">
              {[
                { Icon: Facebook, url: shopInfo.facebook_url, color: 'hover:bg-[#1877F2]' },
                { Icon: Instagram, url: shopInfo.instagram_url, color: 'hover:bg-pink-500' },
                { Icon: MessageCircle, url: shopInfo.line_url, color: 'hover:bg-[#06C755]' }
              ].map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noreferrer" 
                   className={`w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-[#2D241E] shadow-sm transition-all hover:text-white hover:shadow-md hover:-translate-y-1 ${social.color}`}>
                  <social.Icon size={22} strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>

          {/* ส่วนที่ 2: Navigation - Match Header Nav Items */}
          <div className="lg:col-span-3 text-left">
            <h3 className="text-sm font-black text-[#2D241E] mb-8 uppercase tracking-[0.2em] opacity-40 leading-none">
              Navigation
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'หน้าหลัก', path: '/', icon: <Home size={16} /> },
                { name: 'สินค้าทั้งหมด', path: '/products', icon: <Package size={16} /> },
                { name: 'เกี่ยวกับเรา', path: '/about', icon: <Info size={16} /> },
                { name: 'ติดต่อเรา', path: '/contact', icon: <PhoneCall size={16} /> }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-[#2D241E] hover:text-black font-black transition-all flex items-center group text-base uppercase tracking-tight">
                    <span className="w-0 overflow-hidden group-hover:w-6 transition-all duration-300 text-[#2D241E]">
                       <ChevronRight size={16} strokeWidth={3} />
                    </span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ส่วนที่ 3: Contact Info - Clean & Readable */}
          <div className="lg:col-span-4 text-left">
            <h3 className="text-sm font-black text-[#2D241E] mb-8 uppercase tracking-[0.2em] opacity-40 leading-none">
              Get in Touch
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-50 rounded-xl text-[#2D241E] shadow-sm">
                  <MapPin size={18} strokeWidth={2.5} />
                </div>
                <span className="text-base font-bold text-[#2D241E] leading-snug italic opacity-80 underline decoration-[#2D241E]/10 underline-offset-4">
                  {shopInfo.address}
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 rounded-xl text-[#2D241E] shadow-sm">
                  <Phone size={18} strokeWidth={2.5} />
                </div>
                <span className="text-lg font-black tracking-wider text-[#2D241E] italic">{shopInfo.phone}</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 rounded-xl text-[#2D241E] shadow-sm">
                  <Mail size={18} strokeWidth={2.5} />
                </div>
                <span className="text-lg font-black break-all text-[#2D241E] italic underline decoration-[#2D241E]/10">{shopInfo.email}</span>
              </li>
            </ul>

            {isStaff && (
              <div className="mt-10">
                <Link to="/admin/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D241E] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95 group italic">
                  <ShieldCheck size={16} strokeWidth={2.5} />
                  Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Copyright Bar --- */}
      <div className="bg-slate-50/50 py-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-black text-[#2D241E] tracking-[0.2em] uppercase italic opacity-60">
            © {currentYear} {shopInfo.shop_name}. Crafted for excellence.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]">
             <span className="flex items-center gap-2 group">
               <Heart size={14} className="fill-red-500 text-red-500 group-hover:scale-125 transition-transform duration-300"/> 
               {shopInfo.shop_name} Family
             </span>
             <span className="opacity-40 hidden sm:block">Premium Quality Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;