import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Settings, Facebook, Instagram, MessageCircle } from 'lucide-react';
// นำเข้า axios และ config ของคุณ
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Footer = () => {
  const currentYear = 2026;

  // 1. สร้าง State สำหรับเก็บข้อมูลร้านค้า
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

  // 2. ดึงข้อมูลจาก API เมื่อ Component เริ่มทำงาน
  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        // ใช้ Endpoint สาธารณะที่คุณเตรียมไว้สำหรับหน้าบ้าน
        const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
        
        if (res.success && res.data) {
          const d = res.data;
          // ตรวจสอบข้อมูลก่อนนำไปใส่ state (กันค่าว่างหรือ EMPTY)
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
      } catch (err) {
        console.error("Footer fetch failed:", err);
      }
    };

    fetchShopInfo();
  }, []);

  return (
    <footer className="bg-white border-t border-slate-100 font-['Kanit']">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Column 1: Brand & Dynamic Data */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              {shopInfo.shop_name}
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              {shopInfo.hero_description}
            </p>
            <div className="flex space-x-3">
               <a href={shopInfo.facebook_url} target="_blank" rel="noreferrer" className="p-2.5 border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                 <Facebook size={20} />
               </a>
               <a href={shopInfo.instagram_url} target="_blank" rel="noreferrer" className="p-2.5 border border-slate-200 rounded-2xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-all">
                 <Instagram size={20} />
               </a>
               <a href={shopInfo.line_url} target="_blank" rel="noreferrer" className="p-2.5 border border-slate-200 rounded-2xl text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all">
                 <MessageCircle size={20} />
               </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-6 tracking-[0.2em] uppercase">Navigation</h3>
            <ul className="space-y-4 text-slate-500 font-semibold">
              {['หน้าแรก', 'เมนูสินค้า', 'ตะกร้าของฉัน', 'ติดตามออเดอร์'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-slate-900 transition-colors flex items-center group text-sm">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-slate-900 mr-0 transition-all group-hover:mr-2 rounded-full"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-6 tracking-[0.2em] uppercase">Support</h3>
            <ul className="space-y-4 text-slate-500 font-semibold text-sm">
              {['Privacy Policy', 'Terms of Service', 'FAQ', 'ติดต่อเจ้าหน้าที่'].map((item) => (
                <li key={item}><a href="#" className="hover:text-slate-900 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us (Dynamic) */}
          <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-50 lg:bg-transparent lg:p-0 lg:border-none">
            <h3 className="text-sm font-black text-slate-900 mb-6 tracking-[0.2em] uppercase">Contact Us</h3>
            <ul className="space-y-5 text-slate-600 font-medium">
              <li className="flex items-start space-x-4 group">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <MapPin size={18} className="shrink-0" />
                </div>
                <span className="text-sm leading-relaxed">{shopInfo.address}</span>
              </li>
              <li className="flex items-center space-x-4 group">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Phone size={18} className="shrink-0" />
                </div>
                <span className="text-sm font-bold">{shopInfo.phone}</span>
              </li>
              <li className="flex items-center space-x-4 group">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Mail size={18} className="shrink-0" />
                </div>
                <span className="text-sm font-bold break-all">{shopInfo.email}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-50 py-8 bg-slate-50/30">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
              © {currentYear} {shopInfo.shop_name}. All rights reserved.
            </p>
            <p className="text-[10px] font-black text-slate-300 tracking-tighter uppercase">
              Designed for SOOO GUICHAI Project
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;