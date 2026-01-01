import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle,
  Settings 
} from 'lucide-react';

// --- นำเข้า API Config และ Instance ---
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Footer = ({ userData }) => {
  const [shopData, setShopData] = useState({
    shop_name: 'SOOO GUICHAI',
    hero_description: 'กำลังโหลดข้อมูล...',
    address: 'กำลังโหลด...',
    phone: 'กำลังโหลด...',
    email: 'กำลังโหลด...',
    facebook_url: '#',
    instagram_url: '#',
    line_url: '#' 
  });

  const fetchFooterSettings = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
      if (res.success) {
        const d = res.data;
        const getValue = (val, fallback) => (val && val !== "EMPTY") ? val : fallback;
        
        setShopData({
          shop_name: getValue(d.shop_name, 'กรุณาเพิ่มชื่อร้านค้า'),
          hero_description: getValue(d.hero_description, 'กรุณาเพิ่มคำอธิบายร้านค้า'),
          address: getValue(d.address, 'กรุณาเพิ่มที่อยู่ร้านค้า'),
          phone: getValue(d.phone, 'กรุณาเพิ่มเบอร์โทรร้านค้า'),
          email: getValue(d.email, 'กรุณาเพิ่มอีเมลร้านค้า'),
          facebook_url: getValue(d.facebook_url, '#'),
          instagram_url: getValue(d.instagram_url, '#'),
          line_url: getValue(d.line_url, '#')
        });
      }
    } catch (err) { 
      console.error("Fetch footer settings error:", err); 
    }
  }, []);

  useEffect(() => {
    fetchFooterSettings();
  }, [fetchFooterSettings]);

  const isAdminManager = userData && [1, 2].includes(Number(userData.role_level));

  return (
    <footer className="bg-transparent font-['Kanit'] w-full">
      
      {/* ส่วนโค้งมนสีครีม - ปรับความโค้งตามขนาดหน้าจอ */}
      <div className="bg-[#fdfbf2]/80 rounded-t-[3rem] md:rounded-t-[5rem] px-6 pt-16 md:pt-20 pb-10 border-t border-[#e8c4a0]/10 shadow-[0_-15px_40px_rgba(232,196,160,0.05)] backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl">
          
          {/* Main Grid: ปรับจำนวน Column ตาม Breakpoint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-16">
            
            {/* 1. ข้อมูลร้านค้า */}
            <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
              <Link to="/" className="text-2xl md:text-3xl font-black text-[#1b2559] tracking-tighter uppercase leading-tight">
                {shopData.shop_name.split(' ')[0]} <span className="text-[#e8c4a0]">{shopData.shop_name.split(' ')[1] || ''}</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed max-w-[280px]">
                {shopData.hero_description}
              </p>
              <div className="flex items-center gap-3">
                <a href={shopData.facebook_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-2xl text-[#1b2559] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"><Facebook size={18} /></a>
                <a href={shopData.instagram_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-2xl text-[#1b2559] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"><Instagram size={18} /></a>
                <a href={shopData.line_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-2xl text-[#1b2559] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"><MessageCircle size={18} /></a>
              </div>

              {isAdminManager && (
                <div className="pt-2">
                  <Link to="/admin/shop-setting" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b2559] text-white text-xs rounded-xl hover:bg-[#e8c4a0] transition-all">
                    <Settings size={14} /> ตั้งค่าระบบ
                  </Link>
                </div>
              )}
            </div>

            {/* 2. หน้าเมนู */}
            <div className="text-center md:text-left">
              <h4 className="text-[#1b2559] font-bold text-base md:text-lg mb-6 md:mb-8 uppercase tracking-widest">หน้าเมนู</h4>
              <ul className="space-y-4 text-gray-500 text-sm">
                <li><Link to="/" className="hover:text-[#e8c4a0] transition-colors font-medium">หน้าแรก</Link></li>
                <li><Link to="/products" className="hover:text-[#e8c4a0] transition-colors font-medium">สั่งซื้อสินค้า</Link></li>
                <li><Link to="/cart" className="hover:text-[#e8c4a0] transition-colors font-medium">ตะกร้าสินค้า</Link></li>
              </ul>
            </div>

            {/* 3. ช่วยเหลือ */}
            <div className="text-center md:text-left">
              <h4 className="text-[#1b2559] font-bold text-base md:text-lg mb-6 md:mb-8 uppercase tracking-widest">ช่วยเหลือ</h4>
              <ul className="space-y-4 text-gray-500 text-sm">
                <li><Link to="#" className="hover:text-[#e8c4a0] font-medium transition-colors">นโยบายความเป็นส่วนตัว</Link></li>
                <li><Link to="#" className="hover:text-[#e8c4a0] font-medium transition-colors">คำถามที่พบบ่อย</Link></li>
              </ul>
            </div>

            {/* 4. ติดต่อเรา */}
            <div className="text-center md:text-left space-y-6">
              <h4 className="text-[#1b2559] font-bold text-base md:text-lg mb-6 md:mb-8 uppercase tracking-widest">ติดต่อเรา</h4>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-start justify-center md:justify-start gap-3">
                  <MapPin className="text-[#e8c4a0] shrink-0 mt-0.5" size={18} /> 
                  <span className="font-medium text-xs md:text-sm leading-relaxed">{shopData.address}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Phone className="text-[#e8c4a0] shrink-0" size={18} /> 
                  <span className="font-medium">{shopData.phone}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Mail className="text-[#e8c4a0] shrink-0" size={18} /> 
                  <span className="break-all font-medium">{shopData.email}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 md:pt-10 border-t border-[#e8c4a0]/20 text-center">
            <p className="text-gray-400 text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold px-4">
              © {new Date().getFullYear()} {shopData.shop_name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;