import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, MessageCircle, Heart, Sparkles, Leaf, Cookie, Smile, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Footer = () => {
    const [shopInfo, setShopInfo] = useState({ 
        shop_name: 'COOKIE SHOP', 
        address: '', 
        phone: '', 
        email: '',
        description: 'รังสรรค์ด้วยความใส่ใจ เพื่อส่งมอบความสุขผ่านรสชาติที่กลมกล่อม' 
    });

    // 🚀 ฟังก์ชันดึงข้อมูลแบบเดียวกับหน้า Home (Hero Section)
    const fetchData = useCallback(async () => {
        try {
            const [publicRes, homeRes] = await Promise.allSettled([
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/home`)
            ]);

            // จัดการข้อมูลส่วน Public (ชื่อร้าน, ที่อยู่, เบอร์โทร)
            if (publicRes.status === 'fulfilled' && publicRes.value.success) {
                const p = publicRes.value.data;
                setShopInfo(prev => ({
                    ...prev,
                    ...p,
                    shop_name: p.shop_name !== "EMPTY" ? p.shop_name : 'COOKIE SHOP'
                }));
            }

            // 🚀 จัดการข้อมูลส่วน Home (ดึงคำอธิบายเดียวกันกับส่วน Hero)
            if (homeRes.status === 'fulfilled' && homeRes.value.success) {
                const h = homeRes.value.data;
                if (h.hero_description) {
                    setShopInfo(prev => ({
                        ...prev,
                        description: h.hero_description
                    }));
                }
            }
        } catch (err) { 
            console.error("Footer data sync failed", err); 
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        /* 🚀 พื้นหลังขาวสะอาด และตัวอักษรดำคมชัด */
        <footer className="bg-white font-['Kanit'] text-[#000000] pt-16 pb-8 relative overflow-hidden border-t border-slate-100">
            
            {/* Decorative Graphics */}
            <Leaf className="absolute top-10 left-[5%] opacity-[0.02] rotate-12" size={120} />
            <Cookie className="absolute bottom-20 right-[5%] opacity-[0.02] -rotate-12" size={150} />
            <Smile className="absolute top-1/2 left-1/2 opacity-[0.01]" size={100} />

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-left">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
                    
                    {/* --- Brand Section --- */}
                    <div className="md:col-span-5 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-[#000000] text-white rounded-xl flex items-center justify-center shadow-md rotate-3">
                                <Sparkles size={24} strokeWidth={2} />
                            </div>
                            <h2 className="text-3xl font-medium tracking-tighter uppercase italic leading-none">{shopInfo.shop_name}</h2>
                        </div>
                        {/* 🚀 คำอธิบายดึงมาจากแหล่งเดียวกับหน้าแรกโดยตรง */}
                        <p className="text-lg font-medium text-slate-600 italic leading-relaxed max-w-sm">
                            "{shopInfo.description}"
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Instagram, MessageCircle].map((Icon, i) => (
                                /* 🚀 ปุ่มโซเชียล: ไอคอนดำ พื้นขาว ขอบบาง 1px */
                                <button key={i} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-[#000000] hover:bg-slate-50 transition-all shadow-sm">
                                    <Icon size={18} strokeWidth={2} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- Navigation Section --- */}
                    <div className="md:col-span-3 space-y-6">
                        <h3 className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-400 italic border-l-2 border-[#000000] pl-3">Explore</h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'หน้าหลัก', path: '/' },
                                { label: 'สินค้าทั้งหมด', path: '/products' },
                                { label: 'เกี่ยวกับเรา', path: '/about' },
                                { label: 'ติดต่อเรา', path: '/contact' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link to={item.path} className="text-base font-medium uppercase italic tracking-tight hover:text-[#000000] transition-all flex items-center gap-2 group text-slate-500">
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-[#000000]" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* --- Contact Section --- */}
                    <div className="md:col-span-4 space-y-6">
                        <h3 className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-400 italic border-l-2 border-[#000000] pl-3">Contact</h3>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                {/* 🚀 ไอคอน: ไอคอนดำ พื้นขาว ขอบบาง 1px */}
                                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-[#000000] shadow-sm">
                                    <MapPin size={18} strokeWidth={2} />
                                </div>
                                <p className="text-base font-medium italic text-slate-600 leading-snug">{shopInfo.address || 'ยังไม่ระบุที่อยู่ร้าน'}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-[#000000] shadow-sm">
                                    <Phone size={18} strokeWidth={2} />
                                </div>
                                <p className="text-xl font-medium italic tracking-widest text-[#000000]">{shopInfo.phone || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Bottom Bar --- */}
                <div className="py-6 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-medium text-slate-400 tracking-[0.2em] uppercase italic">
                        © 2026 {shopInfo.shop_name}. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-slate-400">
                        MADE WITH <Heart size={12} className="fill-red-400 text-red-400" /> FOR EXCELLENCE
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;