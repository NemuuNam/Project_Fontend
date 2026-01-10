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
    <footer className="relative bg-white border-t border-slate-50 font-['Kanit'] text-[#2D241E] overflow-hidden">
      
      {/* ☁️ Cozy Patterns */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]">
        <Leaf className="absolute top-5 left-[5%] rotate-12" size={120} />
        <Cookie className="absolute bottom-5 right-[2%] -rotate-12" size={150} />
      </div>

      {/* ✅ ปรับจาก py-20 เป็น py-12 เพื่อลดระยะบน-ล่าง */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16">

          {/* ส่วนที่ 1: Brand Identity */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#2D241E] shadow-sm border border-slate-100 rotate-3">
                <Cookie size={28} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-black tracking-tighter uppercase italic text-[#2D241E]">
                {shopInfo.shop_name}
              </h2>
            </div>
            <p className="text-[#2D241E]/90 font-light leading-relaxed max-w-sm text-[18px] italic">
              "{shopInfo.hero_description}"
            </p>
            <div className="flex space-x-3">
              {[
                { Icon: Facebook, url: shopInfo.facebook_url },
                { Icon: Instagram, url: shopInfo.instagram_url },
                { Icon: MessageCircle, url: shopInfo.line_url }
              ].map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noreferrer" 
                   className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-[#2D241E] hover:shadow-md hover:-translate-y-1 transition-all shadow-sm">
                  <social.Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* ส่วนที่ 2: Navigation */}
          <div className="lg:col-span-3">
            {/* ✅ ลด mb-8 เป็น mb-5 */}
            <h3 className="text-[20px] font-black text-[#2D241E] mb-5 tracking-[0.1em] uppercase border-l-4 border-[#F3E9DC] pl-4 leading-none">
              การสำรวจเว็บไซต์
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'หน้าแรก', path: '/' },
                { name: 'รายการสินค้า', path: '/products' },
                { name: 'ตะกร้าของฉัน', path: '/cart' },
                { name: 'ประวัติสั่งซื้อ', path: '/my-orders' }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-[#2D241E]/90 hover:text-[#2D241E] transition-all flex items-center group text-[17px] font-medium">
                    <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all mr-2 text-[#D4A373]" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ส่วนที่ 3: Contact Info */}
          <div className="lg:col-span-4 relative group">
            {/* ✅ ลด mb-8 เป็น mb-5 */}
            <h3 className="text-[20px] font-black text-[#2D241E] mb-5 tracking-[0.1em] uppercase border-l-4 border-[#F3E9DC] pl-4 leading-none">
              ติดต่อเรา
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-slate-50 rounded-lg text-[#D4A373]">
                  <MapPin size={16} />
                </div>
                <span className="text-[19px] font-medium text-[#2D241E] leading-snug">
                  {shopInfo.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-[#D4A373]">
                  <Phone size={16} />
                </div>
                <span className="text-[19px] font-medium tracking-wider text-[#2D241E]">{shopInfo.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-[#D4A373]">
                  <Mail size={16} />
                </div>
                <span className="text-[19px] font-medium break-all text-[#2D241E]">{shopInfo.email}</span>
              </li>
            </ul>

            {isStaff && (
              <div className="mt-8">
                <Link to="/admin/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-[#2D241E] rounded-xl text-[13px] font-black uppercase tracking-[0.1em] shadow-sm hover:shadow-lg transition-all group">
                  <ShieldCheck size={18} className="text-[#D4A373]" />
                  จัดการหลังบ้าน
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Copyright Bar --- */}
      {/* ✅ ปรับจาก py-10 เป็น py-6 */}
      <div className="bg-[#FAFAFA] py-6 border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[13px] font-bold text-[#2D241E]/60 tracking-widest uppercase">
            © {currentYear} {shopInfo.shop_name}. All rights reserved.
          </p>
          <div className="flex gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/50">
             <span className="flex items-center gap-2"><Heart size={12} className="fill-red-400 text-red-400"/> Handcrafted with Love</span>
             <span>Premium Bakery Quality</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;