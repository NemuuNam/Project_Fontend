import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Home } from 'lucide-react';
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
    const [shopName, setShopName] = useState('กรุณาใส่ชื่อร้าน');

    useEffect(() => {
        const fetchShopInfo = async () => {
            try {
                const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
                if (res.success && res.data?.shop_name) {
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
        <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Kanit'] overflow-x-hidden">
            <Toaster position="top-right" />
            
            {/* Reset Password Card */}
            <div className="w-full max-w-[480px] bg-white p-8 sm:p-12 md:p-14 rounded-[40px] md:rounded-[60px] border border-slate-50 shadow-[0_20px_70px_rgba(0,0,0,0.03)] relative animate-in fade-in zoom-in duration-500 text-center">
                
                {/* Brand/Security Icon */}
                <div className="inline-flex p-5 sm:p-6 bg-slate-50 rounded-full border border-slate-100 text-blue-600 mb-6 shadow-sm">
                    <ShieldCheck size={48} strokeWidth={1.5} className="sm:w-14 sm:h-14" />
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-tight">ตั้งรหัสผ่านใหม่</h2>
                <p className="text-blue-600 font-black text-sm uppercase tracking-widest italic mt-2">{shopName}</p>
                
                <p className="text-slate-400 font-medium text-sm sm:text-base leading-relaxed mt-6">
                    กรุณากำหนดรหัสผ่านใหม่ที่ปลอดภัย <br className="hidden sm:block" />
                    เพื่อให้สามารถเข้าใช้งานระบบได้อีกครั้ง
                </p>

                <form onSubmit={handleReset} className="mt-10 space-y-6">
                    
                    {/* New Password Input */}
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">New Password</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input 
                                className="w-full pl-14 pr-12 py-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none font-bold text-slate-900 transition-all focus:border-blue-600 focus:bg-white"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                            <button
                                type="button"
                                className="absolute right-4 p-2 text-slate-300 hover:text-blue-600 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Confirm Password</label>
                        <div className="relative flex items-center group">
                            <Lock className="absolute left-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input 
                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none font-bold text-slate-900 transition-all focus:border-blue-600 focus:bg-white"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                            />
                        </div>
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
                            <>บันทึกรหัสผ่านใหม่ <ArrowRight size={22} /></>
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-10 text-center text-slate-400 font-bold text-sm">
                    จำรหัสผ่านได้แล้ว? 
                    <Link to="/login" className="ml-2 text-blue-600 font-black hover:underline underline-offset-4 transition-all">เข้าสู่ระบบที่นี่</Link>
                </div>

            </div>
        </div>
    );
};

export default ResetPassword;