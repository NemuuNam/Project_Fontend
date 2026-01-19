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
        <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-8 font-['Kanit'] overflow-hidden relative selection:bg-slate-200 selection:text-black">
            
            {/* ☁️ Background Decorations - ใช้สีทึบ (Solid) แทนการใช้ Opacity */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 text-[#F1F5F9]" size={200} />
                <Cookie className="absolute bottom-[10%] right-[8%] -rotate-12 text-[#F1F5F9]" size={160} />
                <Smile className="absolute top-[40%] right-[5%] rotate-6 text-[#F8FAFC]" size={120} />
                <Sparkles className="absolute bottom-[40%] left-[10%] text-[#F8FAFC]" size={100} />
            </div>

            <Toaster position="top-right" />
            
            {/* 📦 Register Card: Rounded-[3rem] & Border-slate-300 */}
            <div className="w-full max-w-[550px] bg-white p-10 rounded-[3rem] border-2 border-slate-300 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700 text-left">
                
                <Link to="/" className="inline-flex items-center gap-2 text-[#000000] hover:underline font-medium text-lg uppercase tracking-widest transition-all mb-6 italic">
                    <Home size={20} strokeWidth={2} /> หน้าหลัก
                </Link>

                <div className="text-center">
                    <div className="inline-flex p-4 bg-[#FDFCFB] rounded-2xl border-2 border-slate-300 text-[#000000] mb-4">
                        <UserPlus size={32} strokeWidth={2} />
                    </div>
                    <h2 className="text-3xl font-medium text-[#000000] uppercase tracking-tighter mb-1 italic">สร้างบัญชีใหม่</h2>
                    <p className="text-[#374151] font-medium text-lg uppercase tracking-widest italic">{shopName}</p>
                </div>

                <form onSubmit={handleRegister} className="mt-10 space-y-6">
                    
                    {/* Grid ชื่อ-นามสกุล: text-2xl */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xl font-medium uppercase text-[#111827] ml-6 tracking-tight italic">ชื่อจริง</label>
                            <div className="relative flex items-center group">
                                <User className="absolute left-6 text-[#111827]" size={20} strokeWidth={2} />
                                <input 
                                    className="w-full pl-14 pr-6 py-4 rounded-full bg-[#FDFCFB] border-2 border-slate-300 outline-none font-medium text-[#111827] focus:border-[#000000] transition-all placeholder:text-slate-300 text-2xl"
                                    type="text" 
                                    placeholder="ชื่อ" 
                                    onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xl font-medium uppercase text-[#111827] ml-6 tracking-tight italic">นามสกุล</label>
                            <div className="relative flex items-center group">
                                <User className="absolute left-6 text-[#111827]" size={20} strokeWidth={2} />
                                <input 
                                    className="w-full pl-14 pr-6 py-4 rounded-full bg-[#FDFCFB] border-2 border-slate-300 outline-none font-medium text-[#111827] focus:border-[#000000] transition-all placeholder:text-slate-300 text-2xl"
                                    type="text" 
                                    placeholder="นามสกุล" 
                                    onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    {/* อีเมล: text-2xl */}
                    <div className="space-y-2">
                        <label className="text-xl font-medium uppercase text-[#111827] ml-6 tracking-tight italic">อีเมลผู้ใช้งาน</label>
                        <div className="relative flex items-center group">
                            <Mail className="absolute left-6 text-[#111827]" size={22} strokeWidth={2} />
                            <input 
                                className="w-full pl-16 pr-8 py-4 rounded-full bg-[#FDFCFB] border-2 border-slate-300 outline-none font-medium text-[#111827] focus:border-[#000000] transition-all placeholder:text-slate-300 text-2xl"
                                type="email" 
                                placeholder="example@mail.com" 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    {/* รหัสผ่าน: text-2xl */}
                    <div className="space-y-2">
                        <label className="text-xl font-medium uppercase text-[#111827] ml-6 tracking-tight italic">รหัสผ่าน</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-6 text-[#111827]" size={22} strokeWidth={2} />
                            <input 
                                className="w-full pl-16 pr-8 py-4 rounded-full bg-[#FDFCFB] border-2 border-slate-300 outline-none font-medium text-[#111827] focus:border-[#000000] transition-all placeholder:text-slate-300 text-2xl"
                                type="password" 
                                placeholder="6 ตัวขึ้นไป" 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    {/* 🚀 Submit Button: พื้นหลังขาว ขอบชัด ตัวหนังสือดำ */}
                    <button 
                        className="w-full py-5 bg-white text-[#000000] border-2 border-slate-300 rounded-full font-medium text-2xl uppercase tracking-widest flex justify-center items-center gap-4 transition-all hover:bg-slate-50 hover:border-black active:scale-95 disabled:bg-slate-100 mt-4 shadow-md italic"
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-black" size={28} />
                        ) : (
                            <>Sign Up <ArrowRight size={26} strokeWidth={2} /></>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-[#374151] font-medium text-sm uppercase tracking-widest">
                    เป็นสมาชิกอยู่แล้ว? 
                    <Link to="/login" className="ml-2 text-[#000000] font-bold border-b-2 border-slate-300 hover:border-black transition-all pb-0.5">เข้าสู่ระบบ</Link>
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

export default Register;