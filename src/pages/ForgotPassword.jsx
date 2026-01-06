import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ArrowLeft, Loader2, Home } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [shopName, setShopName] = useState('กรุณาใส่ชื่อร้าน'); 
    const navigate = useNavigate();

    // ดึงข้อมูลชื่อร้านค้า
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const normalizedEmail = email.toLowerCase().trim();
            const res = await axiosInstance.post(`${API_ENDPOINTS.AUTH}/forgot-password`, { 
                email: normalizedEmail 
            });

            if (res.success) {
                toast.success(res.message || "ระบบส่งลิงก์กู้คืนรหัสผ่านไปที่อีเมลของคุณแล้ว");
                setTimeout(() => navigate('/login'), 2500);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "ไม่พบอีเมลนี้ในระบบ หรือเกิดข้อผิดพลาด";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Kanit'] overflow-x-hidden">
            <Toaster position="top-right" />
            
            {/* Forgot Password Card */}
            <div className="w-full max-w-[520px] bg-white p-8 sm:p-12 md:p-14 rounded-[40px] md:rounded-[60px] border border-slate-50 shadow-[0_20px_70px_rgba(0,0,0,0.03)] relative animate-in fade-in zoom-in duration-500">
                
                {/* Navigation Back */}
                <Link to="/login" className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-all hover:-translate-x-1">
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <div className="text-center mt-6">
                    {/* Security Icon Box */}
                    <div className="inline-flex p-5 sm:p-6 bg-slate-50 rounded-[25px] sm:rounded-[30px] border border-slate-100 text-blue-600 mb-6 shadow-sm">
                        <KeyRound size={40} strokeWidth={2.5} className="sm:w-12 sm:h-12" />
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-1">Reset Password</h2>
                    <p className="text-blue-600 font-black text-sm sm:text-base uppercase tracking-widest italic mb-6">{shopName}</p>
                    
                    <p className="text-slate-400 font-medium text-sm sm:text-base leading-relaxed max-w-[300px] mx-auto">
                        Enter the email address associated with your account to receive a reset link.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                    
                    {/* Email Input Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Email Address</label>
                        <div className="relative flex items-center group">
                            <Mail className="absolute left-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input 
                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none font-bold text-slate-900 transition-all focus:border-blue-600 focus:bg-white"
                                type="email" 
                                placeholder="name@example.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
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
                            <>Send Reset Link</>
                        )}
                    </button>
                </form>

                {/* Footer Hint */}
                <div className="mt-10 text-center text-slate-400 font-bold text-sm">
                    Remembered your password? 
                    <Link to="/login" className="ml-2 text-blue-600 font-black hover:underline underline-offset-4 transition-all">Sign In</Link>
                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;