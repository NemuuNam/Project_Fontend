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
            if (res.success && res.data) {
                const rawData = res.data;
                const settings = {};
                if (Array.isArray(rawData)) {
                    rawData.forEach(item => { settings[item.config_key] = item.config_value; });
                } else { Object.assign(settings, rawData); }
                setAboutContent({
                    about_history: settings.about_history || 'ยังไม่มีข้อมูลประวัติร้าน',
                    about_mission: settings.about_mission || 'ยังไม่มีข้อมูลพันธกิจ'
                });
            }
        } catch (err) { toast.error("โหลดข้อมูลล้มเหลว"); } 
        finally { setLoading(false); }
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
                toast.success("บันทึกข้อมูลเรียบร้อยแล้ว ✨");
                setIsEditing(false);
                fetchAboutData();
            }
        } catch (err) { toast.error("บันทึกไม่สำเร็จ"); } 
        finally { setIsSaving(false); }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#FDFCFB]">
            <Loader2 className="animate-spin text-black" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-['Kanit'] text-black overflow-x-hidden selection:bg-slate-200 relative">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- ☁️ Hero Section (Pure Black Text) --- */}
            <section className="relative pt-16 pb-6 md:pt-24 md:pb-10 bg-white border-b border-slate-100 text-left">
                <div className="container mx-auto px-6 lg:px-16 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-medium uppercase tracking-tighter leading-none mb-4 text-black">
                        Our <span className="italic font-light opacity-30">Journey</span>
                    </h1>
                    {/* 🚀 ปรับเป็นสีดำเข้ม แต่คงความหนาปกติ */}
                    <p className="text-lg md:text-xl font-medium max-w-2xl italic text-black leading-relaxed">
                        "จุดเริ่มต้นจากความหลงใหลในศิลปะการทำขนม สู่ความมุ่งมั่นในการส่งมอบความสุขที่อบอุ่นให้แก่คุณ"
                    </p>
                </div>
            </section>

            {/* --- 🕯️ Content Section --- */}
            <section className="py-8 md:py-12 relative bg-white">
                <div className="container mx-auto px-6 lg:px-16 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">

                        {/* 🍞 Narrative Section */}
                        <div className={`${isStaff ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-8 md:space-y-12 text-left`}>

                            {/* 1. History Card */}
                            <div className="group">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-white border border-slate-200 text-black rounded-xl flex items-center justify-center shadow-sm">
                                        <History size={20} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-medium uppercase tracking-tighter text-black">
                                        เส้นทางความอร่อย <span className="font-light opacity-30 italic">/ History</span>
                                    </h2>
                                </div>

                                <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 transition-all duration-500 hover:bg-slate-50">
                                    {isEditing ? (
                                        <textarea
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-lg font-medium leading-relaxed min-h-[300px] focus:bg-white focus:border-slate-300 text-black italic transition-all"
                                            value={aboutContent.about_history}
                                            onChange={(e) => setAboutContent({ ...aboutContent, about_history: e.target.value })}
                                            placeholder="บอกเล่าเรื่องราวร้านของคุณ..."
                                        />
                                    ) : (
                                        /* 🚀 สีดำเข้ม คมชัด แต่ใช้ font-medium (ไม่หนา) */
                                        <p className="text-lg md:text-xl text-black leading-relaxed font-medium whitespace-pre-wrap italic">
                                            {aboutContent.about_history}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 2. Mission Card */}
                            <div className="group">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-white border border-slate-200 text-black rounded-xl flex items-center justify-center shadow-sm">
                                        <Target size={20} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-medium uppercase tracking-tighter text-black">
                                        ความตั้งใจของเรา <span className="font-light opacity-30 italic">/ Mission</span>
                                    </h2>
                                </div>

                                <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 transition-all duration-500 hover:bg-slate-50">
                                    {isEditing ? (
                                        <textarea
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-lg font-medium leading-relaxed min-h-[200px] focus:bg-white focus:border-slate-300 text-black italic transition-all"
                                            value={aboutContent.about_mission}
                                            onChange={(e) => setAboutContent({ ...aboutContent, about_mission: e.target.value })}
                                            placeholder="เป้าหมายที่ร้านยึดมั่น..."
                                        />
                                    ) : (
                                        /* 🚀 สีดำเข้ม คมชัด แต่ใช้ font-medium (ไม่หนา) */
                                        <p className="text-lg md:text-xl text-black leading-relaxed font-medium whitespace-pre-wrap italic">
                                            {aboutContent.about_mission}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 🛠️ Admin Sidebar (Darker Labels, Normal Weight) */}
                        {isStaff && (
                            <div className="lg:col-span-4 w-full">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl sticky top-28 text-left">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="text-black opacity-30" size={18} />
                                        <h3 className="text-xs font-medium uppercase tracking-widest italic text-black">Admin Panel</h3>
                                    </div>

                                    <h4 className="text-xl font-medium uppercase tracking-tight mb-3 text-black">ปรับแต่งเนื้อหา</h4>
                                    <p className="text-black text-sm mb-8 leading-relaxed italic opacity-60 font-medium">
                                        "แก้ไขเรื่องราวและตัวตนของแบรนด์ เพื่อสร้างความประทับใจให้แก่ลูกค้า"
                                    </p>

                                    <div className="space-y-3">
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="w-full py-3 bg-white border border-slate-200 text-black rounded-full font-medium uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-slate-100 transition-all active:scale-95 italic outline-none"
                                            >
                                                <Edit3 size={16} /> แก้ไขข้อมูล
                                            </button>
                                        ) : (
                                            <div className="space-y-2 animate-in zoom-in-95">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="w-full py-3 bg-white border border-slate-200 text-black rounded-full font-medium uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-slate-100 transition-all active:scale-95 italic outline-none"
                                                >
                                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> บันทึกข้อมูล</>}
                                                </button>
                                                <button
                                                    onClick={() => { setIsEditing(false); fetchAboutData(); }}
                                                    className="w-full py-3 bg-white border border-slate-100 text-black opacity-40 rounded-full font-medium uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all italic outline-none"
                                                >
                                                    <Undo2 size={14} /> ยกเลิกการแก้ไข
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-black opacity-20 mt-8 text-center italic">Identity System</p>
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

export default About;