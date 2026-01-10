import React, { useState, useEffect, useCallback } from 'react';
import {
    Edit3, Save, History, Target,
    Loader2, Heart, Sparkles, Leaf, Cookie, Smile, X, Undo2, Navigation
} from 'lucide-react';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import toast, { Toaster } from 'react-hot-toast';

const About = ({ userData }) => {
    // --- 📦 Logic (คงเดิม 100%) ---
    const [aboutContent, setAboutContent] = useState({
        about_history: '',
        about_mission: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const isStaff = userData && [1, 2, 3].includes(Number(userData.role_level));

    const fetchAboutData = useCallback(async () => {
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
                setAboutContent({
                    about_history: settings.about_history || 'ยังไม่มีข้อมูลประวัติร้าน',
                    about_mission: settings.about_mission || 'ยังไม่มีข้อมูลพันธกิจ'
                });
            }
        } catch (err) {
            toast.error("โหลดข้อมูลล้มเหลว");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAboutData(); }, [fetchAboutData]);

    const handleSave = async () => {
        if (!isStaff) return;
        setIsSaving(true);
        try {
            const payload = Object.keys(aboutContent).map(key => ({
                config_key: key,
                config_value: aboutContent[key]
            }));
            const res = await axiosInstance.put(API_ENDPOINTS.ADMIN.SHOP_SETTINGS, payload);
            if (res.success) {
                toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
                setIsEditing(false);
                fetchAboutData();
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
        <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden selection:bg-[#F3E9DC] relative">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- ☁️ Hero Section (Balanced Scale) --- */}
            <section className="relative pt-28 pb-10 md:pt-40 md:pb-16 bg-[#FAFAFA] border-b-2 border-slate-100 text-left">
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0">
                    <Leaf className="absolute top-10 left-[10%] rotate-12 text-[#2D241E]" size={250} />
                    <Sparkles className="absolute bottom-10 right-[15%] text-[#2D241E]" size={150} />
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#2D241E] rounded-full shadow-md mb-6 animate-bounce-slow">
                        <Heart size={14} className="text-white fill-white" />
                        <span className="text-[12px] font-black uppercase tracking-widest text-white">Crafted with heart</span>
                    </div>
                    {/* ปรับขนาดหัวข้อลงให้สมดุล */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6 text-[#2D241E]">
                        Our <span className="italic font-light opacity-50">Journey</span>
                    </h1>
                    <p className="text-lg md:text-xl font-bold max-w-2xl italic text-[#2D241E] opacity-90 leading-relaxed">
                        "จุดเริ่มต้นจากความหลงใหลในศิลปะการทำขนม สู่ความมุ่งมั่นในการส่งมอบความสุขที่อบอุ่นให้แก่คุณ"
                    </p>
                </div>
            </section>

            {/* --- 🕯️ Content Section --- */}
            <section className="py-12 md:py-20 relative bg-white">
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0">
                    <Cookie className="absolute top-[20%] right-[5%] -rotate-12 text-[#2D241E]" size={200} />
                    <Smile className="absolute bottom-[10%] left-[5%] rotate-12 text-[#2D241E]" size={180} />
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-start">

                        {/* 🍞 Narrative Section (Left Side) */}
                        <div className={`${isStaff ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-16 md:space-y-24 text-left`}>

                            {/* 1. History */}
                            <div className="group relative">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-14 h-14 bg-[#2D241E] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                                        <History size={26} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-[#2D241E]">
                                        เส้นทางความอร่อย <span className="font-light opacity-40 italic">/ History</span>
                                    </h2>
                                </div>

                                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border-2 border-slate-50 transition-all duration-500 hover:border-[#2D241E]/10">
                                    {isEditing ? (
                                        <textarea
                                            className="w-full p-6 bg-slate-50 border-2 border-[#2D241E]/10 rounded-2xl outline-none text-lg font-bold leading-relaxed min-h-[400px] transition-all focus:bg-white focus:border-[#2D241E] text-[#2D241E] shadow-inner italic"
                                            value={aboutContent.about_history}
                                            onChange={(e) => setAboutContent({ ...aboutContent, about_history: e.target.value })}
                                            placeholder="บอกเล่าเรื่องราวร้านของคุณ..."
                                        />
                                    ) : (
                                        <p className="text-lg md:text-xl text-[#2D241E] leading-[2] font-medium whitespace-pre-wrap italic">
                                            {aboutContent.about_history}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 2. Mission */}
                            <div className="group relative">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-14 h-14 bg-[#2D241E] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                                        <Target size={26} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-[#2D241E]">
                                        ความตั้งใจของเรา <span className="font-light opacity-40 italic">/ Mission</span>
                                    </h2>
                                </div>

                                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border-2 border-slate-50 transition-all duration-500 hover:border-[#2D241E]/10">
                                    {isEditing ? (
                                        <textarea
                                            className="w-full p-6 bg-slate-50 border-2 border-[#2D241E]/10 rounded-2xl outline-none text-lg font-bold leading-relaxed min-h-[300px] transition-all focus:bg-white focus:border-[#2D241E] text-[#2D241E] shadow-inner italic"
                                            value={aboutContent.about_mission}
                                            onChange={(e) => setAboutContent({ ...aboutContent, about_mission: e.target.value })}
                                            placeholder="เป้าหมายที่ร้านยึดมั่น..."
                                        />
                                    ) : (
                                        <p className="text-lg md:text-xl text-[#2D241E] leading-[2] font-medium whitespace-pre-wrap italic">
                                            {aboutContent.about_mission}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 🛠️ Admin Sidebar (Right Side) */}
                        {isStaff && (
                            <div className="lg:col-span-4 w-full">
                                <div className="bg-[#2D241E] text-white p-10 rounded-[3.5rem] shadow-2xl sticky top-32 animate-in fade-in slide-in-from-right-4 duration-700 text-left">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Sparkles className="text-[#F3E9DC] animate-pulse" size={24} />
                                        <h3 className="text-lg font-black uppercase tracking-widest italic text-white">Admin Control</h3>
                                    </div>

                                    <h4 className="text-xl font-black uppercase tracking-tight mb-4">ปรับแต่งเนื้อหา</h4>
                                    <p className="text-[#F3E9DC] text-base mb-10 leading-relaxed opacity-80 italic">
                                        "แก้ไขเรื่องราวและตัวตนของแบรนด์ เพื่อสร้างความประทับใจให้แก่ลูกค้าของคุณ"
                                    </p>

                                    <div className="space-y-4">
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="w-full py-5 bg-white text-[#2D241E] rounded-full font-black uppercase tracking-widest text-base flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all active:scale-95 italic"
                                            >
                                                <Edit3 size={18} strokeWidth={3} /> แก้ไขข้อมูล
                                            </button>
                                        ) : (
                                            <div className="space-y-3 animate-in zoom-in-95">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="w-full py-5 bg-[#F3E9DC] text-[#2D241E] rounded-full font-black uppercase tracking-widest text-base flex items-center justify-center gap-3 shadow-xl hover:bg-white transition-all active:scale-95 italic"
                                                >
                                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} strokeWidth={3} /> บันทึกข้อมูล</>}
                                                </button>
                                                <button
                                                    onClick={() => { setIsEditing(false); fetchAboutData(); }}
                                                    className="w-full py-5 bg-white/10 text-white rounded-full font-bold uppercase tracking-widest text-base flex items-center justify-center gap-2 hover:bg-red-500 transition-all italic"
                                                >
                                                    <Undo2 size={16} /> ยกเลิก
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[9px] uppercase tracking-[0.3em] opacity-40 mt-10 text-center">Vision Management System</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer userData={userData} />

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E; border-radius: 10px; }
                textarea::placeholder { color: #2D241E; opacity: 0.5; font-style: italic; }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
            `}} />
        </div>
    );
};

export default About;