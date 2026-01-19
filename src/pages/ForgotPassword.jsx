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
        <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-8 font-['Kanit'] overflow-hidden relative selection:bg-slate-200 selection:text-black">
            
            {/* ☁️ Background Patterns - ใช้สีทึบจาง (Solid) เพื่อความคมชัดในการพิมพ์ */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 text-[#F1F5F9]" size={200} />
                <Cookie className="absolute bottom-[10%] right-[8%] -rotate-12 text-[#F1F5F9]" size={160} />
                <Smile className="absolute top-[40%] right-[5%] rotate-6 text-[#F8FAFC]" size={120} />
                <Sparkles className="absolute bottom-[40%] left-[10%] text-[#F8FAFC]" size={100} />
            </div>

            <Toaster position="top-right" />
            
            {/* 📦 Forgot Password Card: max-w-[480px] border-slate-300 */}
            <div className="w-full max-w-[480px] bg-white p-10 rounded-[3rem] border-2 border-slate-300 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700 text-left">
                
                <Link to="/login" className="inline-flex items-center gap-2 text-[#000000] hover:underline font-medium text-lg uppercase tracking-widest transition-all mb-8 italic">
                    <ArrowLeft size={22} strokeWidth={2.5} /> เข้าสู่ระบบ
                </Link>

                <div className="text-center">
                    <div className="inline-flex p-4 bg-[#FDFCFB] rounded-2xl border-2 border-slate-300 text-[#000000] mb-5 shadow-sm">
                        <KeyRound size={36} strokeWidth={2} />
                    </div>

                    <h2 className="text-4xl font-medium text-[#000000] uppercase tracking-tighter mb-1 italic leading-none">Password Recovery</h2>
                    <p className="text-[#374151] font-medium text-xl uppercase tracking-widest italic mb-6">{shopName}</p>
                    
                    <p className="text-[#111827] font-medium text-lg leading-relaxed max-w-[320px] mx-auto italic">
                        ระบุอีเมลที่ลงทะเบียนไว้เพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                    
                    {/* หัวข้ออีเมล: text-xl font-medium */}
                    <div className="space-y-3">
                        <label className="text-xl font-medium uppercase text-[#111827] ml-6 tracking-tight italic">อีเมลที่ลงทะเบียน</label>
                        <div className="relative flex items-center group">
                            <Mail className="absolute left-6 text-[#111827]" size={24} strokeWidth={2} />
                            <input 
                                className="w-full pl-16 pr-8 py-4.5 rounded-full bg-[#FDFCFB] border-2 border-slate-300 outline-none font-medium text-[#111827] focus:border-[#000000] transition-all placeholder:text-slate-300 text-2xl"
                                type="email" 
                                placeholder="example@mail.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    {/* 🚀 Submit Button: พื้นหลังขาว ขอบชัด ตัวหนังสือดำ */}
                    <button 
                        className="w-full py-6 bg-white text-[#000000] border-2 border-slate-300 rounded-full font-medium text-2xl uppercase tracking-widest flex justify-center items-center gap-4 transition-all hover:bg-[#FDFCFB] hover:border-black active:scale-95 disabled:bg-slate-50 mt-4 shadow-md italic"
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-black" size={32} />
                        ) : (
                            <>ส่งลิงก์รีเซ็ต <Sparkles size={24} strokeWidth={2} /></>
                        )}
                    </button>
                </form>

                {/* Footer ลิงก์กลับ */}
                <div className="mt-10 text-center text-[#374151] font-medium text-base uppercase tracking-widest">
                    จำรหัสผ่านได้แล้ว? 
                    <Link to="/login" className="ml-2 text-[#000000] font-bold border-b-2 border-slate-300 hover:border-black transition-all pb-1">เข้าสู่ระบบ</Link>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0px 1000px #FDFCFB inset;
                    -webkit-text-fill-color: #111827;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}} />
        </div>
    );
};

export default ForgotPassword;