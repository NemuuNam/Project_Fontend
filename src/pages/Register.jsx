import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Mail, Lock, User, ArrowRight, Loader2, Home, Store, UserPlus,
    Leaf, Cookie, Smile, Sparkles
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Register = () => {
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [shopName, setShopName] = useState('ยินดีต้อนรับ'); 
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4 font-['Kanit'] overflow-hidden relative selection:bg-[#F3E9DC] selection:text-[#2D241E]">
            
            {/* ☁️ Background Decorations */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 opacity-[0.03] text-[#2D241E]" size={200} />
                <Cookie className="absolute bottom-[10%] right-[8%] -rotate-12 opacity-[0.03] text-[#2D241E]" size={160} />
                <Smile className="absolute top-[40%] right-[5%] rotate-6 opacity-[0.02] text-[#2D241E]" size={120} />
                <Sparkles className="absolute bottom-[40%] left-[10%] opacity-[0.02] text-[#2D241E]" size={100} />
            </div>

            <Toaster position="top-right" />
            
            {/* Register Card - ปรับความกว้างให้พอดีและกระชับ */}
            <div className="w-full max-w-[450px] bg-[#ffffff] p-6 sm:p-8 rounded-[3rem] border-2 border-slate-50 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700">
                
                {/* Back Link */}
                <Link to="/" className="inline-flex items-center gap-2 text-[#2D241E] hover:text-black font-black text-base uppercase tracking-widest transition-all active:scale-95 group mb-4">
                    <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" strokeWidth={2.5} /> หน้าหลัก
                </Link>

                <div className="text-center">
                    <div className="inline-flex p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[#2D241E] mb-3 shadow-sm">
                        <UserPlus size={28} strokeWidth={1.5} />
                    </div>

                    <h2 className="text-2xl font-black text-[#2D241E] uppercase tracking-tighter mb-0.5 italic">สร้างบัญชีใหม่</h2>
                    <p className="text-[#2D241E] font-bold text-sm uppercase tracking-widest opacity-70 italic">{shopName}</p>
                </div>

                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                    
                    {/* Grid สำหรับชื่อและนามสกุลเพื่อให้ไม่ยาวเกินไป */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-lg font-black uppercase text-[#2D241E] ml-5 tracking-tight italic">ชื่อจริง</label>
                            <div className="relative flex items-center group">
                                <User className="absolute left-5 text-[#2D241E]" size={18} strokeWidth={2.5} />
                                <input 
                                    className="w-full pl-12 pr-6 py-3.5 rounded-full bg-slate-50 border-2 border-transparent outline-none font-bold text-[#2D241E] focus:bg-white focus:border-[#2D241E] transition-all placeholder:text-[#2D241E]/30 text-lg"
                                    type="text" 
                                    placeholder="ชื่อ" 
                                    onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-lg font-black uppercase text-[#2D241E] ml-5 tracking-tight italic">นามสกุล</label>
                            <div className="relative flex items-center group">
                                <User className="absolute left-5 text-[#2D241E]" size={18} strokeWidth={2.5} />
                                <input 
                                    className="w-full pl-12 pr-6 py-3.5 rounded-full bg-slate-50 border-2 border-transparent outline-none font-bold text-[#2D241E] focus:bg-white focus:border-[#2D241E] transition-all placeholder:text-[#2D241E]/30 text-lg"
                                    type="text" 
                                    placeholder="นามสกุล" 
                                    onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    {/* อีเมล */}
                    <div className="space-y-1.5">
                        <label className="text-lg font-black uppercase text-[#2D241E] ml-5 tracking-tight italic">อีเมลผู้ใช้งาน</label>
                        <div className="relative flex items-center group">
                            <Mail className="absolute left-6 text-[#2D241E]" size={20} strokeWidth={2.5} />
                            <input 
                                className="w-full pl-14 pr-8 py-3.5 rounded-full bg-slate-50 border-2 border-transparent outline-none font-bold text-[#2D241E] focus:bg-white focus:border-[#2D241E] transition-all placeholder:text-[#2D241E]/30 text-lg"
                                type="email" 
                                placeholder="example@mail.com" 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    {/* รหัสผ่าน */}
                    <div className="space-y-1.5">
                        <label className="text-lg font-black uppercase text-[#2D241E] ml-5 tracking-tight italic">รหัสผ่าน</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-6 text-[#2D241E]" size={20} strokeWidth={2.5} />
                            <input 
                                className="w-full pl-14 pr-8 py-3.5 rounded-full bg-slate-50 border-2 border-transparent outline-none font-bold text-[#2D241E] focus:bg-white focus:border-[#2D241E] transition-all placeholder:text-[#2D241E]/30 text-lg"
                                type="password" 
                                placeholder="6 ตัวขึ้นไป" 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        className="w-full py-4 bg-[#2D241E] text-white rounded-full font-black text-xl uppercase tracking-widest flex justify-center items-center gap-4 transition-all hover:bg-black hover:shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 group mt-2 shadow-lg italic"
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-white" size={24} />
                        ) : (
                            <>Sign Up <ArrowRight size={22} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-[#2D241E] font-bold text-sm uppercase tracking-widest">
                    เป็นสมาชิกอยู่แล้ว? 
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

export default Register;