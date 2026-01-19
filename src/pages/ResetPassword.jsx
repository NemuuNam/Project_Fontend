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
        <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-8 font-['Kanit'] overflow-hidden relative selection:bg-slate-200 selection:text-black">
            
            {/* ☁️ Background Patterns - ใช้สีทึบ (Solid Light Gray) แทนการใช้ Opacity */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 text-[#F1F5F9]" size={200} />
                <Cookie className="absolute bottom-[10%] right-[8%] -rotate-12 text-[#F1F5F9]" size={160} />
                <Smile className="absolute top-[40%] right-[5%] rotate-6 text-[#F8FAFC]" size={120} />
                <Sparkles className="absolute bottom-[40%] left-[10%] text-[#F8FAFC]" size={100} />
            </div>

            <Toaster position="top-right" />
            
            {/* 📦 Reset Password Card: max-w-[480px] border-slate-300 */}
            <div className="w-full max-w-[480px] bg-white p-10 rounded-[3rem] border-2 border-slate-300 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700 text-left">
                
                <Link to="/login" className="inline-flex items-center gap-2 text-[#000000] hover:underline font-medium text-lg uppercase tracking-widest transition-all mb-8 italic">
                    <Home size={22} strokeWidth={2.5} /> กลับหน้าล็อกอิน
                </Link>

                <div className="text-center">
                    <div className="inline-flex p-4 bg-[#FDFCFB] rounded-2xl border-2 border-slate-300 text-[#000000] mb-5 shadow-sm">
                        <ShieldCheck size={36} strokeWidth={2} />
                    </div>

                    <h2 className="text-4xl font-medium text-[#000000] uppercase tracking-tighter mb-1 italic leading-none">Security Reset</h2>
                    <p className="text-[#374151] font-medium text-xl uppercase tracking-widest italic mb-6">{shopName}</p>
                    
                    <p className="text-[#111827] font-medium text-lg leading-relaxed max-w-[320px] mx-auto italic">
                        โปรดระบุรหัสผ่านใหม่ที่มีความปลอดภัยเพื่อเข้าถึงบัญชีของคุณอีกครั้ง
                    </p>
                </div>

                <form onSubmit={handleReset} className="mt-10 space-y-8">
                    
                    {/* ฟิลด์รหัสผ่านใหม่: text-2xl font-medium */}
                    <div className="space-y-3">
                        <label className="text-xl font-medium uppercase text-[#111827] ml-6 tracking-tight italic">รหัสผ่านใหม่</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-6 text-[#111827]" size={24} strokeWidth={2} />
                            <input 
                                className="w-full pl-16 pr-12 py-4.5 rounded-full bg-[#FDFCFB] border-2 border-slate-300 outline-none font-medium text-[#111827] focus:border-[#000000] transition-all placeholder:text-slate-300 text-2xl"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                            <button
                                type="button"
                                className="absolute right-6 text-[#374151] hover:text-[#000000] transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                            </button>
                        </div>
                    </div>

                    {/* ฟิลด์ยืนยันรหัสผ่าน: text-2xl font-medium */}
                    <div className="space-y-3">
                        <label className="text-xl font-medium uppercase text-[#111827] ml-6 tracking-tight italic">ยืนยันรหัสผ่าน</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-6 text-[#111827]" size={24} strokeWidth={2} />
                            <input 
                                className="w-full pl-16 pr-12 py-4.5 rounded-full bg-[#FDFCFB] border-2 border-slate-300 outline-none font-medium text-[#111827] focus:border-[#000000] transition-all placeholder:text-slate-300 text-2xl"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    {/* 🚀 Submit Button: พื้นหลังขาว ขอบชัด ตัวหนังสือดำ */}
                    <button 
                        className="w-full py-6 bg-white text-[#000000] border-2 border-slate-300 rounded-full font-medium text-2xl uppercase tracking-widest flex justify-center items-center gap-4 transition-all hover:bg-[#FDFCFB] hover:border-black active:scale-95 disabled:bg-slate-50 mt-6 shadow-md italic"
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-black" size={32} />
                        ) : (
                            <>อัปเดตรหัสผ่าน <CheckCircle2 size={28} strokeWidth={2.5} /></>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center text-[#374151] font-medium text-base uppercase tracking-widest">
                    จำรหัสผ่านได้แล้ว? 
                    <Link to="/login" className="ml-2 text-[#000000] font-bold border-b-2 border-slate-300 hover:border-black transition-all pb-1">กลับหน้าล็อกอิน</Link>
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

export default ResetPassword;