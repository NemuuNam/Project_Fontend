import React, { useState, useEffect } from 'react';
import {
  Mail, Phone, MapPin, Facebook, Instagram, MessageCircle,
  ShieldCheck, Sparkles, Leaf, Cookie, Smile, ChevronRight, Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Footer = ({ userData }) => {
  const currentYear = 2026;

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
    <footer className="relative bg-white border-t-2 border-slate-50 font-['Kanit'] text-[#2D241E] overflow-hidden">
      
      {/* ☁️ Decorative Elements (Very Light) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]">
        <Leaf className="absolute top-5 left-[5%] rotate-12" size={120} />
        <Cookie className="absolute bottom-5 right-[2%] -rotate-12" size={150} />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16">

          {/* ส่วนที่ 1: Brand Identity */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2D241E] text-white rounded-xl flex items-center justify-center shadow-lg rotate-3">
                <Cookie size={24} strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-black tracking-tighter uppercase italic text-[#2D241E]">
                {shopInfo.shop_name}
              </h2>
            </div>
            <p className="text-[#2D241E] font-bold leading-relaxed max-w-sm text-base md:text-lg italic opacity-80">
              "{shopInfo.hero_description}"
            </p>
            <div className="flex space-x-3">
              {[
                { Icon: Facebook, url: shopInfo.facebook_url, color: 'hover:text-[#1877F2]' },
                { Icon: Instagram, url: shopInfo.instagram_url, color: 'hover:text-pink-500' },
                { Icon: MessageCircle, url: shopInfo.line_url, color: 'hover:text-[#06C755]' }
              ].map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noreferrer" 
                   className={`w-11 h-11 flex items-center justify-center bg-white border-2 border-slate-100 rounded-xl text-[#2D241E] shadow-sm transition-all hover:border-[#2D241E] ${social.color} hover:-translate-y-1`}>
                  <social.Icon size={20} strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>

          {/* ส่วนที่ 2: Navigation */}
          <div className="lg:col-span-3 text-left">
            <h3 className="text-base font-black text-[#2D241E] mb-6 uppercase tracking-widest border-l-4 border-[#2D241E] pl-4 leading-none italic">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'หน้าแรก', path: '/' },
                { name: 'รายการสินค้า', path: '/products' },
                { name: 'ตะกร้าของฉัน', path: '/cart' },
                { name: 'ประวัติสั่งซื้อ', path: '/my-orders' }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-[#2D241E] hover:text-black font-bold transition-all flex items-center group text-base">
                    <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all mr-2 text-[#2D241E]" strokeWidth={3} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ส่วนที่ 3: Contact Info */}
          <div className="lg:col-span-4 text-left">
            <h3 className="text-base font-black text-[#2D241E] mb-6 uppercase tracking-widest border-l-4 border-[#2D241E] pl-4 leading-none italic">
              Contact
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-slate-50 rounded-lg text-[#2D241E] border border-slate-100">
                  <MapPin size={16} strokeWidth={2.5} />
                </div>
                <span className="text-base md:text-lg font-bold text-[#2D241E] leading-snug italic underline decoration-[#2D241E]/10 underline-offset-4">
                  {shopInfo.address}
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 rounded-lg text-[#2D241E] border border-slate-100">
                  <Phone size={16} strokeWidth={2.5} />
                </div>
                <span className="text-base md:text-lg font-bold tracking-wider text-[#2D241E] italic">{shopInfo.phone}</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 rounded-lg text-[#2D241E] border border-slate-100">
                  <Mail size={16} strokeWidth={2.5} />
                </div>
                <span className="text-base md:text-lg font-bold break-all text-[#2D241E] italic">{shopInfo.email}</span>
              </li>
            </ul>

            {isStaff && (
              <div className="mt-8">
                <Link to="/admin/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D241E] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all group">
                  <ShieldCheck size={16} />
                  จัดการหลังบ้าน
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Copyright Bar --- */}
      <div className="bg-[#FAFAFA] py-6 border-t-2 border-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] font-black text-[#2D241E] tracking-widest uppercase italic">
            © {currentYear} {shopInfo.shop_name}. All rights reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]">
             <span className="flex items-center gap-2">
               <Heart size={12} className="fill-red-500 text-red-500 animate-pulse"/> 
               Handcrafted with Love
             </span>
             <span className="opacity-40">Premium Bakery Quality</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;