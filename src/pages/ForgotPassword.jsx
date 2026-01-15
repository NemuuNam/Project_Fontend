import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Mail, KeyRound, ArrowLeft, Loader2, Home, 
    Leaf, Cookie, Smile, Sparkles, ShieldCheck 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [shopName, setShopName] = useState('ยินดีต้อนรับ'); 
    const navigate = useNavigate();

    // --- 🔄 Logic (คงเดิม 100%) ---
    useEffect(() => {
        const fetchShopInfo = async () => {
            try {
                const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
                if (res.success && res.data?.shop_name && res.data.shop_name !== "EMPTY") {
                    setShopName(res.data.shop_name);
                }
            } catch (err) {
                console.error("Fetch shop info failed:", err);
            }
        };
        fetchShopInfo();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const normalizedEmail = email.toLowerCase().trim();
            const res = await axiosInstance.post(`${API_ENDPOINTS.AUTH}/forgot-password`, { 
                email: normalizedEmail 
            });

            if (res.success) {
                toast.success(res.message || "ระบบส่งลิงก์กู้คืนรหัสผ่านไปที่อีเมลของคุณแล้ว");
                setTimeout(() => navigate('/login'), 2500);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "ไม่พบอีเมลนี้ในระบบ หรือเกิดข้อผิดพลาด";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4 font-['Kanit'] overflow-hidden relative selection:bg-[#F3E9DC] selection:text-[#2D241E]">
            
            {/* ☁️ Global Background Patterns */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 opacity-[0.03] text-[#2D241E]" size={200} />
                <Cookie className="absolute bottom-[10%] right-[8%] -rotate-12 opacity-[0.03] text-[#2D241E]" size={160} />
                <Smile className="absolute top-[40%] right-[5%] rotate-6 opacity-[0.02] text-[#2D241E]" size={120} />
                <Sparkles className="absolute bottom-[40%] left-[10%] opacity-[0.02] text-[#2D241E]" size={100} />
            </div>

            <Toaster position="top-right" />
            
            {/* Forgot Password Card - ปรับให้กระชับเท่าหน้า Login */}
            <div className="w-full max-w-[400px] bg-[#ffffff] p-6 sm:p-8 rounded-[3rem] border-2 border-slate-50 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700">
                
                {/* Back Button */}
                <Link to="/login" className="inline-flex items-center gap-2 text-[#2D241E] hover:text-black font-black text-base uppercase tracking-widest transition-all active:scale-95 group mb-4">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} /> เข้าสู่ระบบ
                </Link>

                <div className="text-center">
                    {/* Icon Box */}
                    <div className="inline-flex p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[#2D241E] mb-3 shadow-sm">
                        <KeyRound size={28} strokeWidth={1.5} />
                    </div>

                    <h2 className="text-2xl font-black text-[#2D241E] uppercase tracking-tighter mb-0.5 italic">กู้คืนรหัสผ่าน</h2>
                    <p className="text-[#2D241E] font-bold text-sm uppercase tracking-widest opacity-70 italic mb-4">{shopName}</p>
                    
                    <p className="text-[#2D241E] font-medium text-sm leading-relaxed opacity-80 max-w-[280px] mx-auto">
                        ระบุอีเมลที่ลงทะเบียนไว้เพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
                    
                    {/* หัวข้ออีเมล - ปรับเป็น text-lg font-black */}
                    <div className="space-y-1.5">
                        <label className="text-lg font-black uppercase text-[#2D241E] ml-5 tracking-tight italic">อีเมลที่ลงทะเบียน</label>
                        <div className="relative flex items-center group">
                            <Mail className="absolute left-6 text-[#2D241E]" size={20} strokeWidth={2.5} />
                            <input 
                                className="w-full pl-14 pr-8 py-3.5 rounded-full bg-slate-50 border-2 border-transparent outline-none font-bold text-[#2D241E] focus:bg-white focus:border-[#2D241E] transition-all placeholder:text-[#2D241E]/30 text-lg"
                                type="email" 
                                placeholder="example@mail.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    {/* ปุ่มยืนยัน - ปรับเป็นสีเข้ม text-xl */}
                    <button 
                        className="w-full py-4 bg-[#2D241E] text-white rounded-full font-black text-xl uppercase tracking-widest flex justify-center items-center gap-4 transition-all hover:bg-black hover:shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 group mt-2 shadow-lg italic"
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-white" size={24} />
                        ) : (
                            <>ส่งลิงก์รีเซ็ต <Sparkles size={20} className="text-white group-hover:scale-110 transition-transform" /></>
                        )}
                    </button>
                </form>

                {/* Footer ลิงก์กลับ */}
                <div className="mt-8 text-center text-[#2D241E] font-bold text-sm uppercase tracking-widest">
                    จำรหัสผ่านได้แล้ว? 
                    <Link to="/login" className="ml-2 text-[#2D241E] font-black border-b-2 border-[#2D241E]/20 hover:border-[#2D241E] transition-all pb-0.5">เข้าสู่ระบบ</Link>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0px 1000px #f8fafc inset;
                    -webkit-text-fill-color: #2D241E;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}} />
        </div>
    );
};

export default ForgotPassword;