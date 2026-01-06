import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, Home, UserPlus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Register = () => {
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [shopName, setShopName] = useState('กรุณาใส่ชื่อร้าน'); 
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
        <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Kanit'] overflow-x-hidden">
            <Toaster position="top-right" />
            
            {/* Main Register Card */}
            <div className="w-full max-w-xl bg-white p-8 sm:p-12 md:p-14 rounded-[40px] md:rounded-[60px] border border-slate-50 shadow-[0_20px_70px_rgba(0,0,0,0.03)] relative animate-in fade-in zoom-in duration-500">
                
                {/* Back Home Button */}
                <Link to="/" className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-all hover:-translate-x-1">
                    <Home size={16} /> Home
                </Link>

                <div className="text-center mt-6">
                    {/* Header Icon */}
                    <div className="inline-flex p-5 sm:p-6 bg-slate-50 rounded-[25px] sm:rounded-[30px] border border-slate-100 text-blue-600 mb-6 shadow-sm">
                        <UserPlus size={40} strokeWidth={2.5} className="sm:w-12 sm:h-12" />
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-1">Join Us</h2>
                    <p className="text-blue-600 font-black text-sm sm:text-base uppercase tracking-widest italic">{shopName}</p>
                </div>

                <form onSubmit={handleRegister} className="mt-10 sm:mt-12 space-y-5">
                    
                    {/* First & Last Name Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">First Name</label>
                            <div className="relative flex items-center group">
                                <User className="absolute left-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input 
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none font-bold text-slate-900 transition-all focus:border-blue-600 focus:bg-white"
                                    type="text" 
                                    placeholder="ชื่อ" 
                                    onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Last Name</label>
                            <div className="relative flex items-center group">
                                <User className="absolute left-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input 
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none font-bold text-slate-900 transition-all focus:border-blue-600 focus:bg-white"
                                    type="text" 
                                    placeholder="นามสกุล" 
                                    onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Email Address</label>
                        <div className="relative flex items-center group">
                            <Mail className="absolute left-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input 
                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none font-bold text-slate-900 transition-all focus:border-blue-600 focus:bg-white"
                                type="email" 
                                placeholder="example@mail.com" 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
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
                                placeholder="อย่างน้อย 6 ตัวอักษร" 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        className="w-full py-5 bg-slate-900 text-white rounded-[25px] font-black text-lg flex justify-center items-center gap-3 transition-all hover:bg-black hover:-translate-y-1 shadow-xl shadow-slate-100 mt-6 disabled:bg-slate-200 disabled:cursor-not-allowed"
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>Create Account <ArrowRight size={22} /></>
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-10 text-center text-slate-400 font-bold text-sm">
                    Already have an account? 
                    <Link to="/login" className="ml-2 text-blue-600 font-black hover:underline underline-offset-4 transition-all">Sign In</Link>
                </div>

            </div>
        </div>
    );
};

export default Register;