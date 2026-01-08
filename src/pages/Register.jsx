import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Mail, Lock, User, ArrowRight, Loader2, Home, UserPlus,
    Leaf, Cookie, Smile, Sparkles, Heart
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Register = () => {
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [shopName, setShopName] = useState('ยินดีต้อนรับสู่ร้านค้า'); 
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

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const normalizedData = {
                ...formData,
                email: formData.email.toLowerCase().trim()
            };
            const res = await axiosInstance.post(`${API_ENDPOINTS.AUTH}/register`, normalizedData);
            if (res.success) {
                toast.success("สมัครสมาชิกสำเร็จ!");
                setTimeout(() => navigate('/login'), 1500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "การสมัครสมาชิกล้มเหลว");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Kanit'] overflow-hidden relative selection:bg-[#F3E9DC] selection:text-[#2D241E]">
            
            {/* ☁️ Global Cozy Patterns (Opacity 0.02 - 0.03) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[5%] right-[10%] rotate-12 opacity-[0.03] text-[#2D241E]" size={220} />
                <Cookie className="absolute bottom-[10%] left-[5%] -rotate-12 opacity-[0.03] text-[#2D241E]" size={180} />
                <Smile className="absolute top-[40%] left-[8%] rotate-6 opacity-[0.02] text-[#2D241E]" size={140} />
                <Sparkles className="absolute bottom-[30%] right-[5%] opacity-[0.02] text-[#2D241E]" size={120} />
                <Heart className="absolute top-[15%] left-[15%] opacity-[0.02] text-[#2D241E]" size={100} />
            </div>

            <Toaster position="top-right" />
            
            {/* Main Register Card (Pearl White Style) */}
            <div className="w-full max-w-xl bg-[#ffffff] p-8 sm:p-12 md:p-16 rounded-[40px] md:rounded-[60px] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative z-10 animate-in fade-in zoom-in duration-700">
                
                {/* ปุ่มกลับหน้าหลัก */}
                <Link to="/" className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 text-[#2D241E]/30 hover:text-[#2D241E] font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 group">
                    <Home size={16} className="group-hover:-translate-y-0.5 transition-transform" /> หน้าหลัก
                </Link>

                <div className="text-center mt-6">
                    {/* ไอคอนส่วนหัว (Soft White Dimension) */}
                    <div className="inline-flex p-6 bg-white rounded-[35px] border border-slate-50 text-[#2D241E] mb-8 shadow-sm">
                        <UserPlus size={44} strokeWidth={1.2} />
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-[#2D241E] uppercase tracking-tighter mb-2 italic">สร้างบัญชีใหม่</h2>
                    <p className="text-[#2D241E]/40 font-bold text-xs uppercase tracking-[0.3em]">{shopName}</p>
                </div>

                <form onSubmit={handleRegister} className="mt-12 space-y-7 text-left">
                    
                    {/* ชื่อและนามสกุล */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-[#2D241E]/30 ml-5 tracking-widest">ชื่อจริง</label>
                            <div className="relative flex items-center group">
                                <User className="absolute left-6 text-[#2D241E]/10 group-focus-within:text-[#2D241E] transition-colors" size={18} />
                                <input 
                                    className="w-full pl-16 pr-8 py-5 rounded-full bg-white border border-slate-200 outline-none font-bold text-[#2D241E] shadow-inner focus:border-[#2D241E]/20 transition-all text-lg placeholder:text-[#2D241E]/10"
                                    type="text" 
                                    placeholder="ชื่อของคุณ" 
                                    onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-[#2D241E]/30 ml-5 tracking-widest">นามสกุล</label>
                            <div className="relative flex items-center group">
                                <User className="absolute left-6 text-[#2D241E]/10 group-focus-within:text-[#2D241E] transition-colors" size={18} />
                                <input 
                                    className="w-full pl-16 pr-8 py-5 rounded-full bg-white border border-slate-200 outline-none font-bold text-[#2D241E] shadow-inner focus:border-[#2D241E]/20 transition-all text-lg placeholder:text-[#2D241E]/10"
                                    type="text" 
                                    placeholder="นามสกุล" 
                                    onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    {/* อีเมล */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[#2D241E]/30 ml-5 tracking-widest">อีเมลผู้ใช้งาน</label>
                        <div className="relative flex items-center group">
                            <Mail className="absolute left-6 text-[#2D241E]/10 group-focus-within:text-[#2D241E] transition-colors" size={18} />
                            <input 
                                className="w-full pl-16 pr-8 py-5 rounded-full bg-white border border-slate-200 outline-none font-bold text-[#2D241E] shadow-inner focus:border-[#2D241E]/20 transition-all text-lg placeholder:text-[#2D241E]/10"
                                type="email" 
                                placeholder="name@email.com" 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    {/* รหัสผ่าน */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[#2D241E]/30 ml-5 tracking-widest">รหัสผ่านความปลอดภัย</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-6 text-[#2D241E]/10 group-focus-within:text-[#2D241E] transition-colors" size={18} />
                            <input 
                                className="w-full pl-16 pr-8 py-5 rounded-full bg-white border border-slate-200 outline-none font-bold text-[#2D241E] shadow-inner focus:border-[#2D241E]/20 transition-all text-lg placeholder:text-[#2D241E]/10"
                                type="password" 
                                placeholder="ระบุรหัสผ่าน 6 ตัวขึ้นไป" 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    {/* ปุ่มยืนยัน (Pearl White Style) */}
                    <button 
                        className="w-full py-5 md:py-6 bg-white text-[#2D241E] border border-slate-200 rounded-full font-black text-sm uppercase tracking-[0.3em] flex justify-center items-center gap-4 transition-all hover:bg-slate-50 hover:shadow-md hover:-translate-y-1 active:scale-95 disabled:opacity-50 mt-8 group shadow-sm"
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-[#2D241E]" size={20} />
                        ) : (
                            <>ลงทะเบียนสมาชิก <ArrowRight size={18} className="text-[#D97706] group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </form>

                {/* ลิงก์เข้าสู่ระบบ */}
                <div className="mt-12 text-center text-[#2D241E]/30 font-bold text-xs uppercase tracking-widest">
                    เป็นสมาชิกอยู่แล้ว? 
                    <Link to="/login" className="ml-3 text-[#2D241E] font-black border-b border-[#2D241E]/10 hover:border-[#2D241E] transition-all pb-1">เข้าสู่ระบบที่นี่</Link>
                </div>

            </div>

            {/* Custom CSS */}
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

export default Register;