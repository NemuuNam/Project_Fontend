import React, { useState, useEffect, useCallback } from 'react';
import {
    Phone, Mail, MapPin, Clock, Edit3, Save, Loader2, Send, Map as MapIcon,
    Facebook, MessageCircle, Instagram, Sparkles, Leaf, Cookie, Smile, X, Undo2,
    Video, Compass, Navigation
} from 'lucide-react';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import toast, { Toaster } from 'react-hot-toast';

const Contact = ({ userData }) => {
    const [contactInfo, setContactInfo] = useState({
        address: '',
        contact_phone: '',
        contact_email: '',
        facebook_url: '',
        line_url: '',
        instagram_url: '',
        tiktok_url: '',
        contact_opening_hours: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const isStaff = userData && [1, 2, 3].includes(Number(userData.role_level));

    const fetchContactData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
            if (res.success) {
                const rawData = res.data;
                const settings = {};
                if (Array.isArray(rawData)) {
                    rawData.forEach(item => {
                        settings[item.config_key] = item.config_value;
                    });
                } else {
                    Object.assign(settings, rawData);
                }

                setContactInfo({
                    address: settings.address || '',
                    contact_phone: settings.contact_phone || settings.phone || '',
                    contact_email: settings.contact_email || settings.email || '',
                    facebook_url: settings.facebook_url || '',
                    line_url: settings.line_url || '',
                    instagram_url: settings.instagram_url || '',
                    tiktok_url: settings.tiktok_url || '',
                    contact_opening_hours: settings.contact_opening_hours || ''
                });
            }
        } catch (err) {
            toast.error("โหลดข้อมูลล้มเหลว");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchContactData(); }, [fetchContactData]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await axiosInstance.put(API_ENDPOINTS.ADMIN.SHOP_SETTINGS, contactInfo);
            if (res.success) {
                toast.success("อัปเดตข้อมูลเรียบร้อย!");
                setIsEditing(false);
            }
        } catch (err) {
            toast.error("บันทึกไม่สำเร็จ");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-[#2D241E]" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] selection:bg-[#F3E9DC] relative overflow-x-hidden">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- ☁️ Hero Section (Balanced Scale) --- */}
            <section className="relative pt-28 pb-12 md:pt-40 md:pb-16 overflow-hidden bg-[#FAFAFA] border-b-2 border-slate-100">
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0">
                    <Leaf className="absolute top-10 left-[5%] rotate-12 text-[#2D241E]" size={250} />
                    <Sparkles className="absolute bottom-10 right-[10%] text-[#2D241E]" size={150} />
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#2D241E] rounded-full shadow-lg mb-8 animate-bounce-slow">
                        <Navigation size={16} className="text-white" strokeWidth={3} />
                        <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white">Get In Touch</span>
                    </div>
                    {/* ปรับลดขนาดหัวข้อลงให้พอดี */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-6 italic text-[#2D241E]">
                        Contact <span className="font-light not-italic opacity-50">Us</span>
                    </h1>
                    <p className="text-lg md:text-xl font-bold max-w-2xl mx-auto italic text-[#2D241E] opacity-90 leading-relaxed">
                        "แวะมาทักทายหรือสอบถามข้อมูลเพิ่มเติม เพื่อให้เราได้ดูแลคุณอย่างดีที่สุด"
                    </p>
                </div>
            </section>

            {/* --- 🕯️ Main Section --- */}
            <section className="py-12 md:py-24 relative bg-white">
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0">
                    <Cookie className="absolute top-[10%] right-[5%] -rotate-12 text-[#2D241E]" size={200} />
                    <Smile className="absolute bottom-[5%] left-[5%] rotate-12 text-[#2D241E]" size={180} />
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10 text-left">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">

                        {/* 💌 Info Cards (Left Side) */}
                        <div className="lg:col-span-8 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">

                                {/* Location Card */}
                                <div className="p-8 md:p-10 bg-white rounded-[3rem] border-2 border-slate-50 space-y-6 shadow-xl hover:border-[#2D241E]/10 transition-all duration-500 group relative overflow-hidden">
                                    <div className="w-14 h-14 bg-[#2D241E] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                                        <MapPin size={28} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic text-[#2D241E]">ที่ตั้งร้าน</h3>
                                        {isEditing ? (
                                            <textarea
                                                className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-[#2D241E] outline-none transition-all text-lg font-bold italic shadow-inner"
                                                value={contactInfo.address}
                                                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                                                rows="4"
                                            />
                                        ) : (
                                            <p className="text-lg font-bold leading-relaxed italic text-[#2D241E] underline decoration-[#2D241E]/10 underline-offset-8">
                                                {contactInfo.address || 'ยังไม่ได้ระบุข้อมูลที่อยู่'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Card */}
                                <div className="p-8 md:p-10 bg-white rounded-[3rem] border-2 border-slate-50 space-y-6 shadow-xl hover:border-[#2D241E]/10 transition-all duration-500 group relative overflow-hidden">
                                    <div className="w-14 h-14 bg-[#2D241E] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                                        <Phone size={28} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic text-[#2D241E]">ช่องทางติดต่อ</h3>
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <input className="w-full p-4 rounded-full bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-[#2D241E] outline-none shadow-inner font-bold italic" placeholder="Phone" value={contactInfo.contact_phone} onChange={(e) => setContactInfo({ ...contactInfo, contact_phone: e.target.value })} />
                                                <input className="w-full p-4 rounded-full bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-[#2D241E] outline-none shadow-inner font-bold italic" placeholder="Email" value={contactInfo.contact_email} onChange={(e) => setContactInfo({ ...contactInfo, contact_email: e.target.value })} />
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="text-2xl md:text-3xl font-black tracking-tighter italic text-[#2D241E]">{contactInfo.contact_phone || '-'}</p>
                                                <p className="text-base font-bold italic text-[#2D241E] opacity-60">{contactInfo.contact_email || '-'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Opening Hours Card */}
                                <div className="p-8 md:p-10 bg-white rounded-[3rem] border-2 border-slate-50 space-y-6 shadow-xl hover:border-[#2D241E]/10 transition-all duration-500 group relative overflow-hidden">
                                    <div className="w-14 h-14 bg-[#2D241E] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                                        <Clock size={28} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic text-[#2D241E]">เวลาเปิดทำการ</h3>
                                        {isEditing ? (
                                            <input className="w-full p-4 rounded-full bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-[#2D241E] outline-none shadow-inner font-bold italic" value={contactInfo.contact_opening_hours} onChange={(e) => setContactInfo({ ...contactInfo, contact_opening_hours: e.target.value })} />
                                        ) : (
                                            <p className="text-lg font-bold italic text-[#2D241E]">{contactInfo.contact_opening_hours || '-'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Social Links Card */}
                                <div className="p-8 md:p-10 bg-white rounded-[3rem] border-2 border-slate-50 space-y-6 shadow-xl hover:border-[#2D241E]/10 transition-all duration-500 group relative overflow-hidden">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#1877F2] shadow-sm"><Facebook size={20} /></div>
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#06C755] shadow-sm"><MessageCircle size={20} /></div>
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-pink-500 shadow-sm"><Instagram size={20} /></div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic text-[#2D241E]">โซเชียลมีเดีย</h3>
                                        {isEditing ? (
                                            <div className="grid grid-cols-1 gap-2">
                                                {['facebook_url', 'line_url', 'instagram_url', 'tiktok_url'].map((key) => (
                                                    <input key={key} className="w-full p-3 rounded-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#2D241E] outline-none shadow-inner font-bold italic" placeholder={key.replace('_url', '').toUpperCase() + ' Link'} value={contactInfo[key]} onChange={(e) => setContactInfo({ ...contactInfo, [key]: e.target.value })} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-x-5 gap-y-2 font-black text-base uppercase tracking-widest text-[#2D241E]">
                                                {contactInfo.facebook_url && <a href={contactInfo.facebook_url} target="_blank" rel="noreferrer" className="hover:text-[#1877F2] transition-all underline decoration-2 underline-offset-4 decoration-[#2D241E]/20">Facebook</a>}
                                                {contactInfo.line_url && <a href={contactInfo.line_url} target="_blank" rel="noreferrer" className="hover:text-[#06C755] transition-all underline decoration-2 underline-offset-4 decoration-[#2D241E]/20">Line OA</a>}
                                                {contactInfo.instagram_url && <a href={contactInfo.instagram_url} target="_blank" rel="noreferrer" className="hover:text-pink-500 transition-all underline decoration-2 underline-offset-4 decoration-[#2D241E]/20">Instagram</a>}
                                                {contactInfo.tiktok_url && <a href={contactInfo.tiktok_url} target="_blank" rel="noreferrer" className="hover:text-slate-500 transition-all underline decoration-2 underline-offset-4 decoration-[#2D241E]/20">TikTok</a>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* 📝 Sidebar (Right Side) */}
                        <div className="lg:col-span-4 w-full">
                            <div className="bg-[#2D241E] text-white p-10 rounded-[3.5rem] shadow-2xl sticky top-32 animate-in fade-in slide-in-from-right-4 duration-700">
                                <h3 className="text-2xl font-black uppercase tracking-widest mb-10 flex items-center gap-4 italic text-left">
                                    {isStaff ? <Sparkles className="text-[#F3E9DC] animate-pulse" size={24} /> : <Send className="text-[#F3E9DC]" size={24} />}
                                    {isStaff ? "Admin Panel" : "Send Message"}
                                </h3>

                                {isStaff ? (
                                    <div className="space-y-6">
                                        {!isEditing ? (
                                            <button onClick={() => setIsEditing(true)} className="w-full py-5 bg-white text-[#2D241E] rounded-full font-black uppercase tracking-widest text-base flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all active:scale-95 italic">
                                                <Edit3 size={18} strokeWidth={3} /> แก้ไขข้อมูลร้าน
                                            </button>
                                        ) : (
                                            <div className="space-y-4 animate-in zoom-in-95">
                                                <button onClick={handleSave} disabled={isSaving} className="w-full py-5 bg-[#F3E9DC] text-[#2D241E] rounded-full font-black uppercase tracking-widest text-base flex items-center justify-center gap-3 shadow-xl hover:bg-white transition-all active:scale-95 italic">
                                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} strokeWidth={3} /> บันทึกข้อมูล</>}
                                                </button>
                                                <button onClick={() => { setIsEditing(false); fetchContactData(); }} className="w-full py-5 bg-white/10 text-white rounded-full font-bold uppercase tracking-widest text-base flex items-center justify-center gap-2 hover:bg-red-500 transition-all italic">
                                                    <Undo2 size={16} /> ยกเลิก
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mt-10">Shop Identity Control System</p>
                                    </div>
                                ) : (
                                    <form className="space-y-6 text-left" onSubmit={(e) => { e.preventDefault(); toast.success("ส่งข้อความเรียบร้อย!"); }}>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-black uppercase tracking-widest ml-4 opacity-50">Your Identity</label>
                                            <input type="text" placeholder="ชื่อของคุณ" className="w-full p-4 bg-white/10 rounded-full border-2 border-transparent focus:border-[#F3E9DC] outline-none transition-all font-bold text-lg placeholder:text-white/30 italic" required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-black uppercase tracking-widest ml-4 opacity-50">Contact Email</label>
                                            <input type="email" placeholder="อีเมลติดต่อกลับ" className="w-full p-4 bg-white/10 rounded-full border-2 border-transparent focus:border-[#F3E9DC] outline-none transition-all font-bold text-lg placeholder:text-white/30 italic" required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-black uppercase tracking-widest ml-4 opacity-50">Inquiry Details</label>
                                            <textarea placeholder="เราสามารถช่วยอะไรคุณได้บ้าง?" className="w-full p-5 bg-white/10 rounded-[2rem] border-2 border-transparent focus:border-[#F3E9DC] outline-none transition-all font-bold text-lg min-h-[140px] resize-none placeholder:text-white/30 italic" required></textarea>
                                        </div>
                                        <button type="submit" className="w-full py-5 bg-[#F3E9DC] text-[#2D241E] rounded-full font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 shadow-2xl hover:bg-white transition-all active:scale-95 italic mt-4">
                                            <Send size={20} strokeWidth={3} /> ส่งข้อมูล
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer userData={userData} />

            <style dangerouslySetInnerHTML={{
                __html: `
                input::placeholder, textarea::placeholder { color: inherit; opacity: 0.5; }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
            `}} />
        </div>
    );
};

export default Contact;