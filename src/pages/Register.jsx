import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, Home, UserPlus } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Register = () => {
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [shopName, setShopName] = useState('SOOO GUICHAI'); // ค่าเริ่มต้น
    const navigate = useNavigate();

    // ✅ 1. ดึงชื่อร้านค้าผ่าน Endpoint /public เหมือนที่ Footer และ Login ทำ
    useEffect(() => {
        const fetchShopInfo = async () => {
            try {
                const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
                if (res.success && res.data) {
                    const d = res.data;
                    // ดึงค่า shop_name จากฐานข้อมูล
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
            // Normalize อีเมลให้เป็นตัวพิมพ์เล็กเสมอ
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

    const handleGoogleLogin = () => {
        window.location.href = `${API_ENDPOINTS.AUTH}/google`;
    };

    return (
        <div className="register-wrapper">
            <Toaster position="top-right" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@200;300;400;500;600;700;800&display=swap');
                
                :root {
                    --navy: #1B2559;
                    --gold: #C5A059;
                    --bg-soft: #F4F7FE;
                }

                .register-wrapper { 
                    display: flex; justify-content: center; align-items: center; 
                    min-height: 100vh; background: var(--bg-soft); 
                    font-family: 'Kanit', sans-serif; padding: 20px; box-sizing: border-box;
                }

                .register-card { 
                    background: #fff; padding: 45px 35px; border-radius: 40px; 
                    box-shadow: 0 40px 80px -15px rgba(27, 37, 89, 0.15); 
                    width: 100%; max-width: 480px; text-align: center;
                    border: 1px solid rgba(197, 160, 89, 0.25); position: relative;
                }

                .back-home {
                    position: absolute; top: 30px; left: 35px; color: var(--navy);
                    text-decoration: none; display: flex; align-items: center; gap: 8px;
                    font-size: 14px; font-weight: 600; opacity: 0.6; transition: 0.3s;
                }
                .back-home:hover { opacity: 1; color: var(--gold); transform: translateX(-3px); }

                .brand-icon { 
                    display: inline-flex; padding: 20px; background: rgba(27, 37, 89, 0.04); 
                    border-radius: 28px; margin-bottom: 20px; color: var(--gold); 
                }

                h2 { font-weight: 800; font-size: 28px; color: var(--navy); margin: 0; }
                .shop-display { color: var(--gold); font-size: 14px; font-weight: 600; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px; }

                .form-area { margin-top: 35px; }
                .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .input-group { text-align: left; margin-bottom: 20px; }
                .input-group label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 700; color: var(--navy); margin-left: 5px; }

                .input-box { position: relative; display: flex; align-items: center; }
                .input-box svg { position: absolute; left: 18px; color: var(--navy); opacity: 0.4; }
                
                .reg-input { 
                    width: 100%; padding: 15px 15px 15px 48px; border-radius: 18px; 
                    border: 2px solid #E2E8F0; background: #F8FAFC; font-family: 'Kanit'; 
                    font-size: 15px; outline: none; transition: 0.4s; box-sizing: border-box;
                }
                .reg-input:focus { border-color: var(--gold); background: #fff; box-shadow: 0 10px 25px -5px rgba(197, 160, 89, 0.15); }

                .submit-btn { 
                    width: 100%; padding: 18px; background: linear-gradient(135deg, #1B2559 0%, #11183A 100%); 
                    color: #fff; border: none; border-radius: 22px; font-size: 17px; font-weight: 700; 
                    cursor: pointer; display: flex; justify-content: center; align-items: center; 
                    gap: 12px; transition: 0.3s; box-shadow: 0 15px 30px -10px rgba(27, 37, 89, 0.3);
                }
                .submit-btn:hover { transform: translateY(-3px); box-shadow: 0 20px 35px -10px rgba(27, 37, 89, 0.4); }

                .divider { display: flex; align-items: center; margin: 25px 0; color: #A0AEC0; font-size: 12px; font-weight: 600; }
                .divider::before, .divider::after { content: ""; flex: 1; height: 1.5px; background: #E2E8F0; }
                .divider span { padding: 0 15px; }

                .google-btn { 
                    width: 100%; padding: 14px; border: 2.5px solid #F4F7FE; border-radius: 20px; 
                    background: #fff; cursor: pointer; display: flex; justify-content: center; 
                    align-items: center; gap: 12px; font-weight: 700; font-family: 'Kanit'; 
                    transition: 0.2s; color: var(--navy);
                }
                .google-btn:hover { border-color: var(--gold); background: #F8FAFC; }

                .login-link { margin-top: 30px; font-size: 14px; color: #718096; }
                .login-link a { color: var(--gold); font-weight: 800; text-decoration: none; }

                @media (max-width: 480px) {
                    .input-row { grid-template-columns: 1fr; gap: 0; }
                    .register-card { padding: 50px 25px 40px; }
                }
            `}</style>

            <div className="register-card">
                <Link to="/" className="back-home"><Home size={18}/> หน้าหลัก</Link>
                
                <div className="brand-icon">
                    <UserPlus size={40} />
                </div>
                
                <h2>สมัครสมาชิก</h2>
                <div className="shop-display">{shopName}</div>

                <form onSubmit={handleRegister} className="form-area">
                    <div className="input-row">
                        <div className="input-group">
                            <label>ชื่อ</label>
                            <div className="input-box">
                                <User size={18} />
                                <input className="reg-input" type="text" placeholder="ชื่อ" onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>นามสกุล</label>
                            <div className="input-box">
                                <User size={18} />
                                <input className="reg-input" type="text" placeholder="นามสกุล" onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>อีเมล</label>
                        <div className="input-box">
                            <Mail size={18} />
                            <input className="reg-input" type="email" placeholder="example@mail.com" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>รหัสผ่าน</label>
                        <div className="input-box">
                            <Lock size={18} />
                            <input className="reg-input" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                        </div>
                    </div>

                    <button className="submit-btn" type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <>สร้างบัญชีสมาชิก <ArrowRight size={22} /></>}
                    </button>
                </form>

                <div className="divider"><span>หรือสมัครผ่าน</span></div>

                <button className="google-btn" type="button" onClick={handleGoogleLogin}>
                    <FcGoogle size={24} /> Google Account
                </button>

                <div className="login-link">
                    มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบที่นี่</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;