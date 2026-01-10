import React, { useState, useEffect, useCallback } from 'react';
import {
    Edit3, Save, History, Target,
    Loader2, Heart, Sparkles, Leaf, Cookie, Smile, X, Undo2
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
                console.log("Response Data from API:", rawData);
                // 1. แปลงข้อมูลจาก Array เป็น Object เพื่อให้เรียกใช้ง่ายๆ
                const settings = {};
                if (Array.isArray(rawData)) {
                    rawData.forEach(item => {
                        settings[item.config_key] = item.config_value;
                    });
                } else {
                    Object.assign(settings, rawData);
                }

                // 2. Map ค่าเข้าสู่ State
                setAboutContent({
                    about_history: settings.about_history || 'ยังไม่มีข้อมูลประวัติร้าน',
                    about_mission: settings.about_mission || 'ยังไม่มีข้อมูลพันธกิจ'
                });
            }
        } catch (err) {
            console.error("Fetch Error:", err);
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
            // แปลง Object ให้เป็นรูปแบบที่ตาราง Shop_Settings (Key-Value) ต้องการ
            const payload = Object.keys(aboutContent).map(key => ({
                config_key: key,
                config_value: aboutContent[key]
            }));

            const res = await axiosInstance.put(API_ENDPOINTS.ADMIN.SHOP_SETTINGS, payload);

            if (res.success) {
                toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
                setIsEditing(false);
                // โหลดข้อมูลใหม่เพื่อให้มั่นใจว่าหน้าจอแสดงผลตาม Database ล่าสุด
                fetchAboutData();
            }
        } catch (err) {
            console.error("Save Error:", err);
            toast.error("บันทึกไม่สำเร็จ: " + (err.response?.data?.message || err.message));
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

            {/* --- ☁️ ส่วนหัวข้อหลัก (Hero Section) --- */}
            <section className="relative pt-5 pb-5 lg:pt-12 lg:pb-12 overflow-hidden border-b border-slate-50 bg-white text-left">
                {/* ลวดลาย Gimmick จางๆ */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
                    <Leaf className="absolute top-10 left-[10%] rotate-12 text-[#2D241E]" size={120} />
                    <Sparkles className="absolute bottom-10 right-[15%] text-[#2D241E]" size={80} />
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-6 animate-bounce-slow">
                        <Heart size={16} className="text-red-400 fill-red-400" />
                        <span className="text-[20px] font-bold uppercase tracking-[0.1em] text-[#2D241E]">ทำด้วยหัวใจในทุกขั้นตอน</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                        เรื่องราว <span className="text-[#2D241E] italic font-light serif">ของเรา</span>
                    </h1>
                    <p className="text-[#2D241E] text-xl lg:text-xl font-light max-w-2xl">
                        จุดเริ่มต้นจากความหลงใหลในศิลปะการทำขนม สู่ความมุ่งมั่นในการส่งมอบความสุขและรสชาติที่อบอุ่นให้แก่คุณ
                    </p>
                </div>
            </section>

            {/* --- 🕯️ ส่วนเนื้อหา (Content Section) --- */}
            <section className="py-20 lg:py-32 relative bg-white">
                {/* ลวดลาย Gimmick จางๆ */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0">
                    <Cookie className="absolute top-[20%] right-[5%] -rotate-12 text-[#2D241E]" size={150} />
                    <Smile className="absolute bottom-[10%] left-[5%] rotate-12 text-[#2D241E]" size={130} />
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

                        {/* 🍞 ส่วนแสดงเนื้อหาหลัก */}
                        <div className={`${isStaff ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-20 lg:space-y-32 text-left`}>

                            {/* 1. ประวัติความเป็นมา */}
                            <div className="group relative">
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#2D241E] shadow-sm border border-slate-100">
                                        <History size={26} />
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight italic">
                                        เส้นทางความอร่อย <span className="text-[#2D241E] font-light">/ ประวัติร้าน</span>
                                    </h2>
                                </div>

                                <div className="bg-white p-8 lg:p-14 rounded-[3.5rem] shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-md">
                                    {isEditing ? (
                                        <textarea
                                            className="w-full p-8 bg-slate-50/50 rounded-[2.5rem] border-2 border-transparent outline-none text-xl lg:text-xl font-light leading-relaxed min-h-[400px] transition-all focus:bg-white focus:border-[#F3E9DC] text-[#2D241E] shadow-inner"
                                            value={aboutContent.about_history}
                                            onChange={(e) => setAboutContent({ ...aboutContent, about_history: e.target.value })}
                                            placeholder="บอกเล่าจุดเริ่มต้นและความภูมิใจของคุณที่นี่..."
                                        />
                                    ) : (
                                        <p className="text-xl lg:text-2xl text-[#2D241E]/70 leading-[2] font-light whitespace-pre-wrap italic">
                                            {aboutContent.about_history}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 2. พันธกิจ */}
                            <div className="group relative">
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#2D241E] shadow-sm border border-slate-100">
                                        <Target size={26} />
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight italic">
                                        ความตั้งใจของเรา <span className="text-[#2D241E] font-light">/ พันธกิจ</span>
                                    </h2>
                                </div>

                                <div className="bg-white p-8 lg:p-14 rounded-[3.5rem] shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-md">
                                    {isEditing ? (
                                        <textarea
                                            className="w-full p-8 bg-slate-50/50 rounded-[2.5rem] border-2 border-transparent outline-none text-xl lg:text-xl font-light leading-relaxed min-h-[300px] transition-all focus:bg-white focus:border-[#F3E9DC] text-[#2D241E] shadow-inner"
                                            value={aboutContent.about_mission}
                                            onChange={(e) => setAboutContent({ ...aboutContent, about_mission: e.target.value })}
                                            placeholder="เป้าหมายและสิ่งที่เรายึดมั่นในการทำขนม..."
                                        />
                                    ) : (
                                        <p className="text-xl lg:text-2xl text-[#2D241E]/70 leading-[2] font-light whitespace-pre-wrap italic">
                                            {aboutContent.about_mission}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 🛠️ ส่วนจัดการแอดมิน (Sidebar) */}
                        {isStaff && (
                            <div className="lg:col-span-4 w-full text-left">
                                <div className="bg-white p-10 lg:p-12 rounded-[4rem] shadow-lg border border-slate-50 sticky top-32 group transition-all duration-500 hover:shadow-xl">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-2 h-2 bg-[#2D241E] rounded-full animate-pulse" />
                                        <h3 className="text-[20px] font-black uppercase tracking-[0.1em] text-[#2D241E]">แผงจัดการข้อมูล</h3>
                                    </div>

                                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">ปรับแต่งเนื้อหา</h4>
                                    <p className="text-[#2D241E] text-[20px] mb-10 leading-relaxed font-light">
                                        คุณสามารถแก้ไขประวัติร้านและพันธกิจเพื่อให้ลูกค้าได้รับรู้ถึงเรื่องราวและตัวตนของแบรนด์ได้ที่นี่
                                    </p>

                                    <div className="space-y-4">
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="w-full py-5 bg-white text-[#2D241E] rounded-full font-black uppercase tracking-widest text-[20px] flex items-center justify-center gap-3 shadow-md border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all active:scale-95"
                                            >
                                                <Edit3 size={18} /> แก้ไขข้อมูลร้าน
                                            </button>
                                        ) : (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="w-full py-5 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-widest text-[20px] flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> บันทึกการเปลี่ยนแปลง</>}
                                                </button>
                                                <button
                                                    onClick={() => { setIsEditing(false); fetchAboutData(); }}
                                                    className="w-full py-5 bg-white text-[#2D241E] rounded-full font-bold uppercase tracking-widest text-[20px] flex items-center justify-center gap-2 border border-slate-100 hover:text-red-500 transition-all"
                                                >
                                                    <Undo2 size={14} /> ยกเลิกการแก้ไข
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

            {/* --- ✨ Custom Animations --- */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .serif { font-family: 'Georgia', serif; }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
            `}} />
        </div>
    );
};

export default About;