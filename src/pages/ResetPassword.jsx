import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Home,
    Leaf, Cookie, Smile, Sparkles, CheckCircle2 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const ResetPassword = () => {
    const { userId, token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [shopName, setShopName] = useState('ยินดีต้อนรับ');

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

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
        }
        if (password.length < 6) {
            return toast.error("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
        }

        setLoading(true);
        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.AUTH}/reset-password/${token}`, {
                userId: userId,
                newPassword: password
            });

            if (res.success) {
                toast.success("เปลี่ยนรหัสผ่านสำเร็จแล้ว! กำลังพาท่านไปหน้าล็อกอิน");
                setTimeout(() => navigate('/login'), 2500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "ลิงก์หมดอายุหรือข้อมูลไม่ถูกต้อง");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4 font-['Kanit'] overflow-hidden relative selection:bg-[#F3E9DC] selection:text-[#2D241E]">
            
            {/* ☁️ Background Patterns */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 opacity-[0.03] text-[#2D241E]" size={200} />
                <Cookie className="absolute bottom-[10%] right-[8%] -rotate-12 opacity-[0.03] text-[#2D241E]" size={160} />
                <Smile className="absolute top-[40%] right-[5%] rotate-6 opacity-[0.02] text-[#2D241E]" size={120} />
                <Sparkles className="absolute bottom-[40%] left-[10%] opacity-[0.02] text-[#2D241E]" size={100} />
            </div>

            <Toaster position="top-right" />
            
            {/* Reset Password Card - กระชับเท่าหน้า Login */}
            <div className="w-full max-w-[400px] bg-[#ffffff] p-6 sm:p-8 rounded-[3rem] border-2 border-slate-50 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700">
                
                {/* Back Link */}
                <Link to="/login" className="inline-flex items-center gap-2 text-[#2D241E] hover:text-black font-black text-base uppercase tracking-widest transition-all active:scale-95 group mb-4">
                    <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" strokeWidth={2.5} /> เข้าสู่ระบบ
                </Link>

                <div className="text-center">
                    <div className="inline-flex p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[#2D241E] mb-3 shadow-sm">
                        <ShieldCheck size={28} strokeWidth={1.5} />
                    </div>

                    <h2 className="text-2xl font-black text-[#2D241E] uppercase tracking-tighter mb-0.5 italic">ตั้งรหัสผ่านใหม่</h2>
                    <p className="text-[#2D241E] font-bold text-sm uppercase tracking-widest opacity-70 italic mb-4">{shopName}</p>
                    
                    <p className="text-[#2D241E] font-medium text-sm leading-relaxed opacity-80 max-w-[280px] mx-auto">
                        โปรดระบุรหัสผ่านใหม่ที่มีความปลอดภัยเพื่อเข้าถึงบัญชีของคุณอีกครั้ง
                    </p>
                </div>

                <form onSubmit={handleReset} className="mt-6 space-y-4 text-left">
                    
                    {/* รหัสผ่านใหม่ */}
                    <div className="space-y-1.5">
                        <label className="text-lg font-black uppercase text-[#2D241E] ml-5 tracking-tight italic">รหัสผ่านใหม่</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-6 text-[#2D241E]" size={20} strokeWidth={2.5} />
                            <input 
                                className="w-full pl-14 pr-12 py-3.5 rounded-full bg-slate-50 border-2 border-transparent outline-none font-bold text-[#2D241E] focus:bg-white focus:border-[#2D241E] transition-all placeholder:text-[#2D241E]/30 text-lg"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                            <button
                                type="button"
                                className="absolute right-5 text-[#2D241E]/40 hover:text-[#2D241E] transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* ยืนยันรหัสผ่าน */}
                    <div className="space-y-1.5">
                        <label className="text-lg font-black uppercase text-[#2D241E] ml-5 tracking-tight italic">ยืนยันรหัสผ่าน</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-6 text-[#2D241E]" size={20} strokeWidth={2.5} />
                            <input 
                                className="w-full pl-14 pr-8 py-3.5 rounded-full bg-slate-50 border-2 border-transparent outline-none font-bold text-[#2D241E] focus:bg-white focus:border-[#2D241E] transition-all placeholder:text-[#2D241E]/30 text-lg"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    {/* ปุ่มยืนยัน */}
                    <button 
                        className="w-full py-4 bg-[#2D241E] text-white rounded-full font-black text-xl uppercase tracking-widest flex justify-center items-center gap-4 transition-all hover:bg-black hover:shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 group mt-2 shadow-lg italic"
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-white" size={24} />
                        ) : (
                            <>อัปเดตรหัสผ่าน <CheckCircle2 size={20} className="text-white group-hover:scale-110 transition-transform" /></>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-[#2D241E] font-bold text-sm uppercase tracking-widest">
                    จำรหัสผ่านได้แล้ว? 
                    <Link to="/login" className="ml-2 text-[#2D241E] font-black border-b-2 border-[#2D241E]/20 hover:border-[#2D241E] transition-all pb-0.5">กลับหน้าล็อกอิน</Link>
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

export default ResetPassword;