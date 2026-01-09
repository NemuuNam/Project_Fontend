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
    // --- 📦 สเตทข้อมูล (รักษา Logic เดิม) ---
    const [contactInfo, setContactInfo] = useState({
        contact_address: '',
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

    // 🔄 ดึงข้อมูลและเน้นที่อยู่จาก config_key: address
    const fetchContactData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
            if (res.success) {
                const data = res.data;
                setContactInfo({
                    // ✅ ดึงจาก config_key: address เป็นหลักตามคำขอ
                    contact_address: data.address || data.contact_address || '', 
                    contact_phone: data.contact_phone || data.phone || '',
                    contact_email: data.contact_email || data.email || '',
                    facebook_url: data.facebook_url || '',
                    line_url: data.line_url || '',
                    instagram_url: data.instagram_url || '', 
                    tiktok_url: data.tiktok_url || '',        
                    contact_opening_hours: data.contact_opening_hours || ''
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
            // ส่งข้อมูลกลับไปบันทึก (Logic เดิม)
            const res = await axiosInstance.put(API_ENDPOINTS.ADMIN.SHOP_SETTINGS, contactInfo);
            if (res.success) {
                toast.success("อัปเดตข้อมูลการติดต่อเรียบร้อย!");
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
            <Loader2 className="animate-spin text-[#2D241E]" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] selection:bg-[#F3E9DC] relative overflow-x-hidden">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- ☁️ Hero Section (Pearl White Concept) --- */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-slate-50 bg-white">
                {/* Cozy Gimmick Patterns */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
                    <Leaf className="absolute top-10 left-[5%] rotate-12 text-[#2D241E]" size={150} />
                    <Sparkles className="absolute bottom-10 right-[10%] text-[#2D241E]" size={100} />
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-6">
                        <Navigation size={14} className="text-[#2D241E]" />
                        <span className="text-[20px] font-bold uppercase tracking-[0.1em] text-[#2D241E]">Get In Touch</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                        Contact <span className="text-[#2D241E] italic font-light serif">Us</span>
                    </h1>
                    <p className="text-[#2D241E] text-xl lg:text-xl font-light max-w-2xl mx-auto italic">
                        แวะมาทักทายหรือสอบถามข้อมูลเพิ่มเติม เพื่อให้เราได้ดูแลคุณอย่างดีที่สุด
                    </p>
                </div>
            </section>

            {/* --- 🕯️ Main Contact Section --- */}
            <section className="py-20 lg:py-32 relative bg-white">
                {/* Background patterns */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0">
                    <Cookie className="absolute top-[10%] right-[5%] -rotate-12 text-[#2D241E]" size={150} />
                    <Smile className="absolute bottom-[5%] left-[5%] rotate-12 text-[#2D241E]" size={130} />
                    <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#2D241E]" size={400} />
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                        
                        {/* 💌 Contact Info Cards */}
                        <div className="lg:col-span-8 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                {/* Location Card */}
                                <div className="p-10 bg-white rounded-[3.5rem] border border-slate-100 space-y-6 shadow-sm hover:shadow-md transition-all duration-500 group text-left">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#2D241E] shadow-inner border border-slate-50 group-hover:scale-110 transition-transform">
                                        <MapPin size={28}/>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-black uppercase tracking-tight">ที่ตั้งร้าน</h3>
                                        {isEditing ? (
                                            <textarea 
                                                className="w-full p-5 rounded-[2rem] bg-slate-50/50 border-2 border-transparent focus:border-[#F3E9DC] focus:bg-white outline-none transition-all text-[20px] shadow-inner" 
                                                value={contactInfo.contact_address} 
                                                onChange={(e) => setContactInfo({...contactInfo, contact_address: e.target.value})} 
                                                rows="3" 
                                            />
                                        ) : (
                                            <p className="text-[#2D241E] font-medium leading-relaxed italic">{contactInfo.contact_address || 'ยังไม่ได้ระบุข้อมูลที่อยู่'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Reach Out Card */}
                                <div className="p-10 bg-white rounded-[3.5rem] border border-slate-100 space-y-6 shadow-sm hover:shadow-md transition-all duration-500 group text-left">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#2D241E] shadow-inner border border-slate-50 group-hover:scale-110 transition-transform">
                                        <Phone size={28}/>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-black uppercase tracking-tight">ช่องทางติดต่อ</h3>
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <input className="w-full p-4 rounded-full bg-slate-50/50 border-2 border-transparent focus:border-[#F3E9DC] focus:bg-white outline-none shadow-inner text-[20px]" placeholder="เบอร์โทรศัพท์" value={contactInfo.contact_phone} onChange={(e) => setContactInfo({...contactInfo, contact_phone: e.target.value})} />
                                                <input className="w-full p-4 rounded-full bg-slate-50/50 border-2 border-transparent focus:border-[#F3E9DC] focus:bg-white outline-none shadow-inner text-[20px]" placeholder="อีเมล" value={contactInfo.contact_email} onChange={(e) => setContactInfo({...contactInfo, contact_email: e.target.value})} />
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="text-[#2D241E] font-black text-2xl tracking-tighter">{contactInfo.contact_phone || '-'}</p>
                                                <p className="text-[#2D241E] font-medium text-[20px] italic">{contactInfo.contact_email || '-'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Baking Hours Card */}
                                <div className="p-10 bg-white rounded-[3.5rem] border border-slate-100 space-y-6 shadow-sm hover:shadow-md transition-all duration-500 group text-left">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#2D241E] shadow-inner border border-slate-50 group-hover:scale-110 transition-transform">
                                        <Clock size={28}/>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-black uppercase tracking-tight">เวลาเปิดทำการ</h3>
                                        {isEditing ? (
                                            <input className="w-full p-5 rounded-full bg-slate-50/50 border-2 border-transparent focus:border-[#F3E9DC] focus:bg-white outline-none shadow-inner text-[20px]" value={contactInfo.contact_opening_hours} onChange={(e) => setContactInfo({...contactInfo, contact_opening_hours: e.target.value})} />
                                        ) : (
                                            <p className="text-[#2D241E] font-medium leading-relaxed italic">{contactInfo.contact_opening_hours || '-'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Social Links Card */}
                                <div className="p-10 bg-white rounded-[3.5rem] border border-slate-100 space-y-6 shadow-sm hover:shadow-md transition-all duration-500 group text-left">
                                    <div className="flex gap-2">
                                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm text-[#1877F2]"><Facebook size={18}/></div>
                                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm text-[#06C755]"><MessageCircle size={18}/></div>
                                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm text-pink-500"><Instagram size={18}/></div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-black uppercase tracking-tight">โซเชียลมีเดีย</h3>
                                        {isEditing ? (
                                            <div className="grid grid-cols-1 gap-2">
                                                {['facebook_url', 'line_url', 'instagram_url', 'tiktok_url'].map((key) => (
                                                    <input key={key} className="w-full p-4 rounded-full bg-slate-50/50 border-2 border-transparent focus:border-[#F3E9DC] focus:bg-white outline-none shadow-inner text-[20px]" placeholder={key.replace('_url', '').toUpperCase() + ' Link'} value={contactInfo[key]} onChange={(e) => setContactInfo({...contactInfo, [key]: e.target.value})} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-x-5 gap-y-2 font-black text-[20px] uppercase tracking-widest text-[#2D241E]">
                                                {contactInfo.facebook_url && <a href={contactInfo.facebook_url} target="_blank" rel="noreferrer" className="hover:text-[#1877F2] transition-colors underline decoration-[#2D241E] underline-offset-4">Facebook</a>}
                                                {contactInfo.line_url && <a href={contactInfo.line_url} target="_blank" rel="noreferrer" className="hover:text-[#06C755] transition-colors underline decoration-[#2D241E] underline-offset-4">Line OA</a>}
                                                {contactInfo.instagram_url && <a href={contactInfo.instagram_url} target="_blank" rel="noreferrer" className="hover:text-pink-500 transition-colors underline decoration-[#2D241E] underline-offset-4">Instagram</a>}
                                                {contactInfo.tiktok_url && <a href={contactInfo.tiktok_url} target="_blank" rel="noreferrer" className="hover:text-slate-500 transition-colors underline decoration-[#2D241E] underline-offset-4">TikTok</a>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 📝 Sidebar (Admin/Send Message) */}
                        <div className="lg:col-span-4 w-full">
                            <div className="bg-white p-10 lg:p-12 rounded-[4rem] border border-slate-100 shadow-lg sticky top-32 group transition-all duration-500 hover:shadow-xl text-left">
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                                    {isStaff ? <div className="w-2 h-2 bg-[#2D241E] rounded-full animate-pulse" /> : <Send className="text-[#2D241E]" size={24} />}
                                    {isStaff ? "ปรับแต่งข้อมูล" : "ส่งข้อความหาเรา"}
                                </h3>

                                {isStaff ? (
                                    <div className="space-y-4">
                                        {!isEditing ? (
                                            <button onClick={() => setIsEditing(true)} className="w-full py-5 bg-white text-[#2D241E] rounded-full font-black uppercase tracking-widest  text-xl flex items-center justify-center gap-3 shadow-md border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all active:scale-95">
                                                <Edit3 size={18}/> แก้ไขข้อมูลติดต่อ
                                            </button>
                                        ) : (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <button onClick={handleSave} disabled={isSaving} className="w-full py-5 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-widest  text-xl flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95">
                                                    {isSaving ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> บันทึกการเปลี่ยนแปลง</>}
                                                </button>
                                                <button onClick={() => { setIsEditing(false); fetchContactData(); }} className="w-full py-5 bg-white text-[#2D241E] rounded-full font-bold uppercase tracking-widest text-[20px] flex items-center justify-center gap-2 border border-slate-100 hover:text-red-500 transition-all">
                                                    <Undo2 size={14}/> ยกเลิก
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); toast.success("ส่งข้อความเรียบร้อย!"); }}>
                                        <input type="text" placeholder="ชื่อของคุณ" className="w-full p-5 bg-slate-50/50 rounded-[1.5rem] border-2 border-transparent focus:border-[#F3E9DC] focus:bg-white outline-none transition-all font-medium text-[20px] shadow-inner" required />
                                        <input type="email" placeholder="อีเมลสำหรับติดต่อกลับ" className="w-full p-5 bg-slate-50/50 rounded-[1.5rem] border-2 border-transparent focus:border-[#F3E9DC] focus:bg-white outline-none transition-all font-medium text-[20px] shadow-inner" required />
                                        <textarea placeholder="เราสามารถช่วยอะไรคุณได้บ้าง?" className="w-full p-5 bg-slate-50/50 rounded-[2rem] border-2 border-transparent focus:border-[#F3E9DC] focus:bg-white outline-none transition-all font-medium text-[20px] min-h-[150px] resize-none shadow-inner" required></textarea>
                                        <button type="submit" className="w-full py-5 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-widest  text-xl flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95">
                                            <Send size={18}/> ส่งข้อมูล
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer userData={userData} />

            <style dangerouslySetInnerHTML={{ __html: `
                .serif { font-family: 'Georgia', serif; }
                input::placeholder, textarea::placeholder { color: #2D241E; font-weight: 500; }
            `}} />
        </div>
    );
};

export default Contact;