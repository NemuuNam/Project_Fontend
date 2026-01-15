import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, MessageCircle, Heart, Sparkles, Leaf, Cookie, Smile, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Footer = () => {
    const [shopInfo, setShopInfo] = useState({ shop_name: 'SOOO GUICHAI', address: '', phone: '', email: '' });

    useEffect(() => {
        const fetchShopInfo = async () => {
            try {
                const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
                if (res.success && res.data) setShopInfo(res.data);
            } catch (err) { console.error(err); }
        };
        fetchShopInfo();
    }, []);

    return (
        <footer className="bg-white font-['Kanit'] text-[#2D241E] pt-20 relative overflow-hidden border-t border-slate-50">
            {/* Gimmick Patterns from Sidebar */}
            <Leaf className="absolute top-10 left-[5%] opacity-[0.03] rotate-12" size={120} />
            <Cookie className="absolute bottom-20 right-[5%] opacity-[0.03] -rotate-12" size={150} />
            <Smile className="absolute top-1/2 left-1/2 opacity-[0.02]" size={100} />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#2D241E] text-white rounded-2xl flex items-center justify-center shadow-xl rotate-3">
                                <Sparkles size={26} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none">{shopInfo.shop_name}</h2>
                        </div>
                        <p className="text-lg font-bold text-[#2D241E] opacity-70 italic leading-relaxed max-w-sm">
                            "คุณภาพพรีเมียมในทุกคำที่เราตั้งใจทำ เพื่อส่งต่อความอร่อยที่เป็นเอกลักษณ์ให้กับคุณ"
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Instagram, MessageCircle].map((Icon, i) => (
                                <button key={i} className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-[#2D241E] hover:bg-[#2D241E] hover:text-white hover:-translate-y-1 transition-all shadow-sm">
                                    <Icon size={20} strokeWidth={3} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="md:col-span-3 space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 italic border-l-4 border-[#2D241E] pl-4">Explore</h3>
                        <ul className="space-y-4">
                            {['หน้าหลัก', 'สินค้าทั้งหมด', 'เกี่ยวกับเรา', 'ติดต่อเรา'].map((link) => (
                                <li key={link}>
                                    <Link className="text-base font-black uppercase italic tracking-tight hover:ml-2 transition-all flex items-center gap-2 group">
                                        <ChevronRight size={14} strokeWidth={4} className="opacity-0 group-hover:opacity-100 transition-all text-[#2D241E]" />
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="md:col-span-4 space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 italic border-l-4 border-[#2D241E] pl-4">Contact</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl text-[#2D241E] shadow-sm"><MapPin size={18} strokeWidth={3} /></div>
                                <p className="text-base font-black italic opacity-80 leading-snug">{shopInfo.address || 'ยังไม่ระบุที่อยู่ร้าน'}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl text-[#2D241E] shadow-sm"><Phone size={18} strokeWidth={3} /></div>
                                <p className="text-lg font-black italic tracking-widest">{shopInfo.phone || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] font-black text-[#2D241E] tracking-[0.2em] uppercase italic opacity-40">
                        © 2026 {shopInfo.shop_name}. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#2D241E]">
                        MADE WITH <Heart size={14} className="fill-red-500 text-red-500 animate-pulse" /> FOR EXCELLENCE
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;