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
        <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Kanit'] overflow-hidden relative selection:bg-[#F3E9DC] selection:text-[#2D241E]">
            
            {/* ☁️ Global Cozy Patterns Background (Opacity 0.02 - 0.03) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[10%] rotate-12 opacity-[0.03] text-[#2D241E]" size={220} />
                <Cookie className="absolute bottom-[15%] right-[8%] -rotate-12 opacity-[0.03] text-[#2D241E]" size={180} />
                <Smile className="absolute top-[40%] right-[10%] rotate-6 opacity-[0.02] text-[#2D241E]" size={140} />
                <Sparkles className="absolute bottom-[30%] left-[5%] opacity-[0.02] text-[#2D241E]" size={120} />
            </div>

            <Toaster position="top-right" />
            
            {/* Reset Password Card (Pearl White Style) */}
            <div className="w-full max-w-[480px] bg-[#ffffff] p-8 sm:p-14 rounded-[40px] md:rounded-[60px] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative z-10 animate-in fade-in zoom-in duration-700 text-center">
                
                {/* ปุ่มย้อนกลับไปหน้าล็อกอิน */}
                <Link to="/login" className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 text-[#2D241E]/30 hover:text-[#2D241E] font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 group">
                    <Home size={16} className="group-hover:-translate-y-0.5 transition-transform" /> เข้าสู่ระบบ
                </Link>

                {/* ไอคอนความปลอดภัย (Soft White Dimension) */}
                <div className="mt-8 mb-8">
                    <div className="inline-flex p-6 bg-white rounded-full border border-slate-50 text-[#2D241E] shadow-sm transition-transform hover:scale-105 duration-500">
                        <ShieldCheck size={54} strokeWidth={1.2} />
                    </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-[#2D241E] uppercase tracking-tighter italic">ตั้งรหัสผ่านใหม่</h2>
                <p className="text-[#2D241E]/40 font-bold text-xs uppercase tracking-[0.3em] mt-2">{shopName}</p>
                
                <p className="text-[#2D241E]/50 font-medium text-sm leading-relaxed mt-6 max-w-[280px] mx-auto">
                    โปรดระบุรหัสผ่านใหม่ที่มีความปลอดภัย <br className="hidden sm:block" />
                    เพื่อเข้าถึงบัญชีของคุณอีกครั้ง
                </p>

                <form onSubmit={handleReset} className="mt-12 space-y-7 text-left">
                    
                    {/* อินพุตรหัสผ่านใหม่ */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[#2D241E]/30 ml-5 tracking-widest">รหัสผ่านใหม่</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-6 text-[#2D241E]/10 group-focus-within:text-[#2D241E] transition-colors" size={20} />
                            <input 
                                className="w-full pl-16 pr-14 py-5 rounded-full bg-white border border-slate-200 outline-none font-bold text-[#2D241E] shadow-inner focus:border-[#2D241E]/20 transition-all text-lg placeholder:text-[#2D241E]/10"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                            <button
                                type="button"
                                className="absolute right-5 p-2 text-[#2D241E]/20 hover:text-[#2D241E] transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* ยืนยันรหัสผ่าน */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[#2D241E]/30 ml-5 tracking-widest">ยืนยันรหัสผ่านอีกครั้ง</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-6 text-[#2D241E]/10 group-focus-within:text-[#2D241E] transition-colors" size={20} />
                            <input 
                                className="w-full pl-16 pr-8 py-5 rounded-full bg-white border border-slate-200 outline-none font-bold text-[#2D241E] shadow-inner focus:border-[#2D241E]/20 transition-all text-lg placeholder:text-[#2D241E]/10"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    {/* ปุ่มยืนยัน (Pearl White Style) */}
                    <button 
                        className="w-full py-5 md:py-6 bg-white text-[#2D241E] border border-slate-200 rounded-full font-black text-sm uppercase tracking-[0.3em] flex justify-center items-center gap-4 transition-all hover:bg-slate-50 hover:shadow-md hover:-translate-y-1 active:scale-95 disabled:opacity-50 group mt-4 shadow-sm"
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-[#2D241E]" size={20} />
                        ) : (
                            <>อัปเดตรหัสผ่าน <CheckCircle2 size={18} className="text-[#D97706] group-hover:scale-110 transition-transform" /></>
                        )}
                    </button>
                </form>

                {/* ลิงก์ท้ายการ์ด */}
                <div className="mt-14 text-center text-[#2D241E]/30 font-bold text-xs uppercase tracking-widest">
                    จำรหัสผ่านได้แล้ว? 
                    <Link to="/login" className="ml-3 text-[#2D241E] font-black border-b border-[#2D241E]/10 hover:border-[#2D241E] transition-all pb-1">กลับไปหน้าล็อกอิน</Link>
                </div>
            </div>

            {/* การตั้งค่า Autofill สำหรับ Browser */}
            <style dangerouslySetInnerHTML={{ __html: `
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0px 1000px white inset;
                    transition: background-color 5000s ease-in-out 0s;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow { animation: bounce-slow 3s infinite; }
            `}} />
        </div>
    );
};

export default ResetPassword;