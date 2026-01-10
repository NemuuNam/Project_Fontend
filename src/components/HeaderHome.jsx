import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Mail, Lock, ArrowRight, Loader2, Home, Store, KeyRound,
    Leaf, Cookie, Smile, Sparkles, Heart
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [shopName, setShopName] = useState('ยินดีต้อนรับ'); 
    const navigate = useNavigate();

    // --- 🔄 Logic (คงเดิม 100%) ---
    useEffect(() => {
        const fetchShopInfo = async () => {
            try {
                const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
                if (res.success && res.data) {
                    const d = res.data;
                    if (d.shop_name && d.shop_name !== "EMPTY") {
                        setShopName(d.shop_name); 
                    }
                }
            } catch (err) {
                console.error("Fetch shop info failed:", err);
            }
        };
        fetchShopInfo();
    }, []);

    const redirectByUserRole = (token) => {
        try {
            const decoded = jwtDecode(token);
            const roleLevel = Number(decoded.role_level);
            if ([1, 2, 3].includes(roleLevel)) {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            navigate('/');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const normalizedEmail = email.toLowerCase().trim();
            const res = await axiosInstance.post(`${API_ENDPOINTS.AUTH}/login`, { 
                email: normalizedEmail, 
                password 
            });
            
            if (res.success || res.data?.token) {
                const token = res.data.token || res.token;
                localStorage.setItem('token', token);
                toast.success("ยินดีต้อนรับกลับมา!");
                setTimeout(() => { redirectByUserRole(token); }, 800);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Kanit'] overflow-hidden relative selection:bg-[#F3E9DC] selection:text-[#2D241E]">
            
            {/* ☁️ Global Decorative Patterns (Opacity 0.03) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[5%] left-[5%] rotate-12 opacity-[0.03] text-[#2D241E] w-32 md:w-64" />
                <Cookie className="absolute bottom-[8%] right-[5%] -rotate-12 opacity-[0.03] text-[#2D241E] w-24 md:w-48" />
                <Sparkles className="absolute top-[40%] right-[-2%] opacity-[0.02] text-[#2D241E] w-20 md:w-40" />
            </div>

            <Toaster position="top-right" />
            
            {/* Login Card (Responsive Scale) */}
            <div className="w-full max-w-[460px] bg-white p-6 sm:p-10 md:p-14 rounded-[2.5rem] md:rounded-[4rem] border-2 border-slate-50 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700 text-left">
                
                {/* 🏠 Home Button - Styled as a floating chip */}
                <Link to="/" className="inline-flex items-center gap-2 text-[#2D241E] hover:text-black font-black text-[11px] sm:text-xs uppercase tracking-[0.2em] transition-all active:scale-95 group mb-8 border-b-2 border-transparent hover:border-[#2D241E] pb-1">
                    <Home size={14} className="group-hover:-translate-y-0.5 transition-transform" strokeWidth={3} /> กลับหน้าหลัก
                </Link>

                <div className="text-center">
                    <div className="inline-flex p-4 sm:p-5 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100 text-[#2D241E] mb-6 shadow-sm">
                        <Store size={32} md:size={36} strokeWidth={1.5} />
                    </div>

                    {/* ปรับขนาดหัวข้อให้สมดุล */}
                    <h2 className="text-2xl sm:text-3xl font-black text-[#2D241E] uppercase tracking-tighter mb-1 italic">
                        การยืนยันตัวตน
                    </h2>
                    <p className="text-[#2D241E] font-bold text-xs sm:text-sm uppercase tracking-widest opacity-60 italic">
                        {shopName}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="mt-10 space-y-6">
                    
                    {/* Username Input Group */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] sm:text-xs font-black uppercase text-[#2D241E] ml-4 tracking-[0.2em] italic">อีเมลผู้ใช้งาน / Username</label>
                        <div className="relative flex items-center group">
                            <Mail className="absolute left-6 text-[#2D241E] transition-colors" size={18} strokeWidth={2.5} />
                            <input 
                                className="w-full pl-14 pr-6 py-4 rounded-full bg-slate-50 border-2 border-transparent outline-none font-bold text-[#2D241E] focus:bg-white focus:border-[#2D241E] transition-all placeholder:text-[#2D241E]/30 text-sm sm:text-base"
                                type="email" 
                                placeholder="example@mail.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    {/* Password Input Group */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] sm:text-xs font-black uppercase text-[#2D241E] ml-4 tracking-[0.2em] italic">รหัสผ่าน / Password</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-6 text-[#2D241E] transition-colors" size={18} strokeWidth={2.5} />
                            <input 
                                className="w-full pl-14 pr-6 py-4 rounded-full bg-slate-50 border-2 border-transparent outline-none font-bold text-[#2D241E] focus:bg-white focus:border-[#2D241E] transition-all placeholder:text-[#2D241E]/30 text-sm sm:text-base"
                                type="password" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        
                        {/* Forgot Password */}
                        <div className="flex justify-end pt-1">
                            <Link 
                                to="/forgot-password" 
                                className="inline-flex items-center gap-1.5 text-[#2D241E] hover:underline font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all italic opacity-70 hover:opacity-100"
                            >
                                <KeyRound size={12} strokeWidth={3} /> ลืมรหัสผ่าน?
                            </Link>
                        </div>
                    </div>

                    {/* Sign In Button (Heavy Graphic Style) */}
                    <button 
                        className="w-full py-4 sm:py-5 bg-[#2D241E] text-white rounded-full font-black text-base sm:text-lg uppercase tracking-widest flex justify-center items-center gap-3 sm:gap-4 transition-all hover:bg-black hover:shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 group mt-4 shadow-lg italic"
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-white" size={20} />
                        ) : (
                            <>Sign In <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </form>

                {/* Registration Link */}
                <div className="mt-10 text-center text-[#2D241E] font-bold text-[11px] sm:text-xs uppercase tracking-widest">
                    ยังไม่มีบัญชีสมาชิก? 
                    <Link to="/register" className="ml-2 text-[#2D241E] font-black border-b-2 border-[#2D241E]/20 hover:border-[#2D241E] transition-all pb-0.5 whitespace-nowrap">
                        สร้างบัญชีใหม่
                    </Link>
                </div>

            </div>

            {/* Custom Styles for Autofill and Animations */}
            <style dangerouslySetInnerHTML={{ __html: `
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0px 1000px #f8fafc inset;
                    -webkit-text-fill-color: #2D241E;
                    transition: background-color 5000s ease-in-out 0s;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
            `}} />
        </div>
    );
};

export default Login;