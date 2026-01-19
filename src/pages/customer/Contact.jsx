import React, { useState, useEffect, useCallback } from 'react';
import {
    Phone, Mail, MapPin, Clock, Edit3, Save, Loader2, Send,
    Facebook, MessageCircle, Instagram, Sparkles, X, Undo2, Navigation
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
            if (res.success && res.data) {
                const d = res.data;
                setContactInfo({
                    address: d.address || '',
                    contact_phone: d.contact_phone || d.phone || '',
                    contact_email: d.contact_email || d.email || '',
                    facebook_url: d.facebook_url || '',
                    line_url: d.line_url || '',
                    instagram_url: d.instagram_url || '',
                    tiktok_url: d.tiktok_url || '',
                    contact_opening_hours: d.contact_opening_hours || ''
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
        if (!isStaff) return;
        setIsSaving(true);
        try {
            const payload = Object.keys(contactInfo).map(key => ({
                config_key: key,
                config_value: contactInfo[key]
            }));
            const res = await axiosInstance.put(API_ENDPOINTS.ADMIN.SHOP_SETTINGS, payload);
            if (res.success) {
                toast.success("อัปเดตข้อมูลร้านเรียบร้อย ✨");
                setIsEditing(false);
                fetchContactData();
            }
        } catch (err) {
            toast.error("บันทึกไม่สำเร็จ");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#FDFCFB]">
            <Loader2 className="animate-spin text-black" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-['Kanit'] text-black relative overflow-x-hidden selection:bg-slate-200">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- ☁️ Hero Section: pt-16 pb-6 (ลดพื้นที่ว่าง) --- */}
            <section className="relative pt-16 pb-6 bg-white border-b border-slate-100 text-left">
                <div className="container mx-auto px-6 lg:px-16 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-medium uppercase tracking-tighter leading-none mb-4 italic text-black">
                        Contact <span className="font-light not-italic opacity-30">Us</span>
                    </h1>
                    <p className="text-lg md:text-xl font-medium max-w-2xl italic text-slate-700">
                        "แวะมาทักทายหรือสอบถามข้อมูลเพิ่มเติม เพื่อให้เราดูแลคุณอย่างดีที่สุด"
                    </p>
                </div>
            </section>

            {/* --- 🕯️ Main Section: py-6 (ลดพื้นที่ว่าง) --- */}
            <section className="py-6 md:py-10 relative bg-white">
                <div className="container mx-auto px-6 lg:px-16 relative z-10 text-left">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

                        {/* 💌 Info Grid (Left Side) */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                                {/* Card: ที่ตั้งร้าน (p-6 ลดพื้นที่ว่างภายใน) */}
                                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 space-y-4 shadow-sm hover:bg-slate-50 transition-all">
                                    <div className="w-10 h-10 bg-white border border-slate-200 text-black rounded-xl flex items-center justify-center shadow-sm">
                                        <MapPin size={22} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-medium uppercase italic text-black border-b border-slate-50 pb-1">ที่ตั้งร้าน</h3>
                                        {isEditing ? (
                                            <textarea className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white outline-none transition-all text-base font-medium italic" value={contactInfo.address} onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })} rows="3" />
                                        ) : (
                                            <p className="text-base font-medium leading-relaxed italic text-slate-700">{contactInfo.address || 'ยังไม่ได้ระบุที่อยู่'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Card: ช่องทางติดต่อ */}
                                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 space-y-4 shadow-sm hover:bg-slate-50 transition-all">
                                    <div className="w-10 h-10 bg-white border border-slate-200 text-black rounded-xl flex items-center justify-center shadow-sm">
                                        <Phone size={22} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-medium uppercase italic text-black border-b border-slate-50 pb-1">ช่องทางติดต่อ</h3>
                                        {isEditing ? (
                                            <div className="space-y-1.5">
                                                <input className="w-full p-2.5 rounded-full bg-slate-50 border border-slate-100 focus:bg-white outline-none font-medium text-sm italic" placeholder="Phone" value={contactInfo.contact_phone} onChange={(e) => setContactInfo({ ...contactInfo, contact_phone: e.target.value })} />
                                                <input className="w-full p-2.5 rounded-full bg-slate-50 border border-slate-100 focus:bg-white outline-none font-medium text-sm italic" placeholder="Email" value={contactInfo.contact_email} onChange={(e) => setContactInfo({ ...contactInfo, contact_email: e.target.value })} />
                                            </div>
                                        ) : (
                                            <div className="space-y-0.5">
                                                <p className="text-xl md:text-2xl font-medium tracking-tighter italic text-black">{contactInfo.contact_phone || '-'}</p>
                                                <p className="text-sm font-medium italic text-slate-400">{contactInfo.contact_email || '-'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card: เวลาเปิดทำการ */}
                                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 space-y-4 shadow-sm hover:bg-slate-50 transition-all">
                                    <div className="w-10 h-10 bg-white border border-slate-200 text-black rounded-xl flex items-center justify-center shadow-sm">
                                        <Clock size={22} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-medium uppercase italic text-black border-b border-slate-50 pb-1">เวลาเปิดทำการ</h3>
                                        {isEditing ? (
                                            <input className="w-full p-2.5 rounded-full bg-slate-50 border border-slate-100 focus:bg-white outline-none font-medium text-sm italic" value={contactInfo.contact_opening_hours} onChange={(e) => setContactInfo({ ...contactInfo, contact_opening_hours: e.target.value })} />
                                        ) : (
                                            <p className="text-lg font-medium italic text-slate-700">{contactInfo.contact_opening_hours || '-'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Card: โซเชียลมีเดีย */}
                                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 space-y-4 shadow-sm hover:bg-slate-50 transition-all">
                                    <div className="flex gap-2">
                                        {[Facebook, MessageCircle, Instagram].map((Icon, idx) => (
                                            <div key={idx} className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-black shadow-sm"><Icon size={16} /></div>
                                        ))}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-medium uppercase italic text-black border-b border-slate-50 pb-1">โซเชียลมีเดีย</h3>
                                        {!isEditing ? (
                                            <div className="flex flex-wrap gap-x-3 gap-y-1 font-medium text-xs uppercase tracking-widest text-slate-400">
                                                {contactInfo.facebook_url && <a href={contactInfo.facebook_url} target="_blank" rel="noreferrer" className="hover:text-black transition-all underline underline-offset-4">Facebook</a>}
                                                {contactInfo.line_url && <a href={contactInfo.line_url} target="_blank" rel="noreferrer" className="hover:text-black transition-all underline underline-offset-4">Line OA</a>}
                                                {contactInfo.instagram_url && <a href={contactInfo.instagram_url} target="_blank" rel="noreferrer" className="hover:text-black transition-all underline underline-offset-4">Instagram</a>}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-1">
                                                {['facebook_url', 'line_url', 'instagram_url'].map((key) => (
                                                    <input key={key} className="w-full p-2 rounded-full bg-slate-50 border border-slate-100 focus:bg-white outline-none font-medium text-[9px] italic" placeholder={key.replace('_url', '').toUpperCase()} value={contactInfo[key]} onChange={(e) => setContactInfo({ ...contactInfo, [key]: e.target.value })} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Sidebar (p-6 ลดพื้นที่ว่าง) */}
                        {isStaff && (
                            <div className="lg:col-span-4 w-full">
                                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl sticky top-24 text-left">
                                    <h3 className="text-lg font-medium uppercase tracking-widest mb-4 flex items-center gap-2 italic text-black">
                                        <Sparkles size={18} /> Admin Panel
                                    </h3>
                                    <div className="space-y-3">
                                        {!isEditing ? (
                                            <button onClick={() => setIsEditing(true)} className="w-full py-3 bg-white border border-slate-200 text-black rounded-full font-medium uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 transition-all active:scale-95 italic outline-none">
                                                <Edit3 size={16} /> แก้ไขข้อมูลร้าน
                                            </button>
                                        ) : (
                                            <div className="space-y-2">
                                                <button onClick={handleSave} disabled={isSaving} className="w-full py-3 bg-white border border-slate-200 text-black rounded-full font-medium uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 transition-all active:scale-95 italic outline-none">
                                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> บันทึกข้อมูล</>}
                                                </button>
                                                <button onClick={() => { setIsEditing(false); fetchContactData(); }} className="w-full py-3 bg-white border border-slate-100 text-slate-400 rounded-full font-medium uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all italic outline-none">
                                                    <Undo2 size={14} /> ยกเลิก
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <Footer userData={userData} />
        </div>
    );
};

export default Contact;