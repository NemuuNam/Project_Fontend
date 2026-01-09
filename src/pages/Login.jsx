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
        <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Kanit'] overflow-hidden relative selection:bg-[#F3E9DC] selection:text-[#2D241E]">
            
            {/* ☁️ Global Cozy Patterns (Opacity 0.02 - 0.03) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 opacity-[0.03] text-[#2D241E]" size={220} />
                <Cookie className="absolute bottom-[10%] right-[8%] -rotate-12 opacity-[0.03] text-[#2D241E]" size={180} />
                <Smile className="absolute top-[40%] right-[5%] rotate-6 opacity-[0.02] text-[#2D241E]" size={140} />
                <Sparkles className="absolute bottom-[40%] left-[10%] opacity-[0.02] text-[#2D241E]" size={120} />
                <Heart className="absolute top-[20%] right-[20%] opacity-[0.02] text-[#2D241E]" size={100} />
            </div>

            <Toaster position="top-right" />
            
            {/* Login Card (Pearl White Style) */}
            <div className="w-full max-w-[480px] bg-[#ffffff] p-8 sm:p-14 rounded-[40px] md:rounded-[60px] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative z-10 animate-in fade-in zoom-in duration-700">
                
                {/* ปุ่มกลับหน้าหลัก */}
                <Link to="/" className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 text-[#2D241E] hover:text-[#2D241E] font-black  text-[20px] uppercase tracking-[0.1em] transition-all active:scale-95 group">
                    <Home size={16} className="group-hover:-translate-y-0.5 transition-transform" /> หน้าหลัก
                </Link>

                <div className="text-center mt-6">
                    {/* ไอคอนแบรนด์ (Soft White Dimension) */}
                    <div className="inline-flex p-6 bg-white rounded-[30px] border border-slate-50 text-[#2D241E] mb-8 shadow-sm">
                        <Store size={44} strokeWidth={1.2} />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black text-[#2D241E] uppercase tracking-tighter mb-2 italic">การยืนยันตัวตน</h2>
                    <p className="text-[#2D241E] font-bold  text-xl uppercase tracking-[0.1em]">{shopName}</p>
                </div>

                <form onSubmit={handleLogin} className="mt-12 space-y-7">
                    
                    {/* อินพุต อีเมล */}
                    <div className="space-y-2">
                        <label className=" text-[20px] font-black uppercase text-[#2D241E] ml-5 tracking-widest">อีเมลผู้ใช้งาน</label>
                        <div className="relative flex items-center group">
                            <Mail className="absolute left-6 text-[#2D241E]group-focus-within:text-[#2D241E] transition-colors" size={20} />
                            <input 
                                className="w-full pl-16 pr-8 py-5 rounded-full bg-white border border-slate-200 outline-none font-bold text-[#2D241E] shadow-inner focus:border-[#2D241E]/20 transition-all placeholder:text-[#2D241E]/60 text-xl"
                                type="email" 
                                placeholder="ระบุอีเมลของคุณ..." 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    {/* อินพุต รหัสผ่าน */}
                    <div className="space-y-2">
                        <label className=" text-[20px] font-black uppercase text-[#2D241E] ml-5 tracking-widest">รหัสผ่านความปลอดภัย</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-6 text-[#2D241E]group-focus-within:text-[#2D241E] transition-colors" size={20} />
                            <input 
                                className="w-full pl-16 pr-8 py-5 rounded-full bg-white border border-slate-200 outline-none font-bold text-[#2D241E] shadow-inner focus:border-[#2D241E] transition-all placeholder:text-[#2D241E]/60 text-xl"
                                type="password" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        
                        {/* ลืมรหัสผ่าน */}
                        <div className="flex justify-end pr-2">
                            <Link 
                                to="/forgot-password" 
                                className="inline-flex items-center gap-1.5 text-[#2D241E]/80 hover:text-[#2D241E] font-black  text-[20px] uppercase tracking-widest transition-all"
                            >
                                <KeyRound size={24} /> ลืมรหัสผ่าน?
                            </Link>
                        </div>
                    </div>

                    {/* ปุ่มตกลง (Pearl White Style) */}
                    <button 
                        className="w-full py-5 md:py-6 bg-white text-[#2D241E] border border-slate-200 rounded-full font-black text-[20px] uppercase tracking-[0.1em] flex justify-center items-center gap-4 transition-all hover:bg-slate-50 hover:shadow-md hover:-translate-y-1 active:scale-95 disabled:opacity-50 group mt-4 shadow-sm"
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-[#2D241E]" size={20} />
                        ) : (
                            <>เข้าสู่ระบบ <ArrowRight size={18} className="text-[#2D241E] group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </form>

                {/* ส่วนสมัครสมาชิก */}
                <div className="mt-14 text-center text-[#2D241E] font-bold  text-xl uppercase tracking-widest">
                    ยังไม่มีบัญชีสมาชิก? 
                    <Link to="/register" className="ml-3 text-[#2D241E]/80 font-black border-b border-[#2D241E]/10 hover:border-[#2D241E] transition-all pb-1">สมัครสมาชิกใหม่</Link>
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

export default Login;