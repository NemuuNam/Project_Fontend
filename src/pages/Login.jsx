import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Home, Store, KeyRound } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [shopName, setShopName] = useState('กรุณาใส่ชื่อร้าน'); 
    const navigate = useNavigate();

    // ดึงชื่อร้านค้า
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

    // นำทางตามระดับสิทธิ์
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
                toast.success("ยินดีต้อนรับ! เข้าสู่ระบบสำเร็จ");
                setTimeout(() => { redirectByUserRole(token); }, 800);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Kanit'] overflow-x-hidden">
            <Toaster position="top-right" />
            
            {/* Login Card */}
            <div className="w-full max-w-[480px] bg-white p-8 sm:p-12 md:p-14 rounded-[40px] md:rounded-[60px] border border-slate-50 shadow-[0_20px_70px_rgba(0,0,0,0.03)] relative animate-in fade-in zoom-in duration-500">
                
                {/* Back Home Button */}
                <Link to="/" className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-all hover:-translate-x-1">
                    <Home size={16} /> Home
                </Link>

                <div className="text-center mt-6">
                    {/* Brand Icon */}
                    <div className="inline-flex p-5 sm:p-6 bg-slate-50 rounded-[25px] sm:rounded-[30px] border border-slate-100 text-blue-600 mb-6 shadow-sm">
                        <Store size={40} strokeWidth={2.5} className="sm:w-12 sm:h-12" />
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-1 leading-tight">Welcome Back</h2>
                    <p className="text-blue-600 font-black text-sm sm:text-base uppercase tracking-widest italic">{shopName}</p>
                </div>

                <form onSubmit={handleLogin} className="mt-10 sm:mt-12 space-y-6">
                    
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Email Address</label>
                        <div className="relative flex items-center group">
                            <Mail className="absolute left-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input 
                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none font-bold text-slate-900 transition-all focus:border-blue-600 focus:bg-white"
                                type="email" 
                                placeholder="example@email.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Password</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input 
                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none font-bold text-slate-900 transition-all focus:border-blue-600 focus:bg-white"
                                type="password" 
                                placeholder="ระบุรหัสผ่านของคุณ" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end -mt-2">
                        <Link to="/forgot-password" disabled className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-wide transition-all">
                            <KeyRound size={14} /> Forgot Password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button 
                        className="w-full py-5 bg-slate-900 text-white rounded-[25px] font-black text-lg flex justify-center items-center gap-3 transition-all hover:bg-black hover:-translate-y-1 shadow-xl shadow-slate-100 mt-4 disabled:bg-slate-200 disabled:cursor-not-allowed"
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>Sign In <ArrowRight size={22} /></>
                        )}
                    </button>
                </form>

                {/* Register Hint */}
                <div className="mt-10 text-center text-slate-400 font-bold text-sm">
                    New here? 
                    <Link to="/register" className="ml-2 text-blue-600 font-black hover:underline underline-offset-4 transition-all">Create an account</Link>
                </div>

            </div>
        </div>
    );
};

export default Login;