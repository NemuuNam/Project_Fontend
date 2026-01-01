import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Home, Store, KeyRound } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import toast, { Toaster } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [shopName, setShopName] = useState('SOOO GUICHAI'); // ค่าเริ่มต้น
    const navigate = useNavigate();

    // ✅ 1. ดึงชื่อร้านค้าผ่าน Endpoint /public (โครงสร้างเดียวกับ Footer)
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

    // ✅ 2. นำทางตามระดับสิทธิ์ของผู้ใช้
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

    // ✅ 3. จัดการ Google Login Callback
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('token');
        if (tokenFromUrl) {
            localStorage.setItem('token', tokenFromUrl);
            toast.success("เข้าสู่ระบบด้วย Google สำเร็จ");
            window.history.replaceState({}, document.title, "/login");
            setTimeout(() => { redirectByUserRole(tokenFromUrl); }, 800);
        }
    }, [navigate]);

    const handleGoogleLogin = () => {
        window.location.href = `${API_ENDPOINTS.AUTH}/google`;
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
        <div className="login-wrapper">
            <Toaster position="top-right" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@200;300;400;500;600;700;800&display=swap');
                
                :root {
                    --navy: #1B2559;
                    --gold: #C5A059;
                    --bg-soft: #F4F7FE;
                }

                .login-wrapper { 
                    display: flex; justify-content: center; align-items: center; 
                    min-height: 100vh; background: var(--bg-soft); 
                    font-family: 'Kanit', sans-serif; padding: 15px; box-sizing: border-box;
                }

                .login-card { 
                    background: #fff; padding: 50px 35px; border-radius: 45px; 
                    box-shadow: 0 40px 80px -15px rgba(27, 37, 89, 0.15); 
                    width: 100%; max-width: 440px; text-align: center;
                    border: 1px solid rgba(197, 160, 89, 0.25); position: relative;
                }

                .back-home {
                    position: absolute; top: 30px; left: 35px; color: var(--navy);
                    text-decoration: none; display: flex; align-items: center; gap: 8px;
                    font-size: 14px; font-weight: 600; opacity: 0.6; transition: 0.3s;
                }
                .back-home:hover { opacity: 1; color: var(--gold); transform: translateX(-3px); }

                .brand-icon { 
                    display: inline-flex; padding: 22px; background: rgba(27, 37, 89, 0.04); 
                    border-radius: 30px; margin-bottom: 20px; color: var(--gold); 
                }

                h2 { font-weight: 800; font-size: 30px; color: var(--navy); margin: 0; letter-spacing: -0.5px; }
                .shop-display { color: var(--gold); font-size: 15px; font-weight: 600; margin-top: 6px; text-transform: uppercase; letter-spacing: 2px; }

                .form-area { margin-top: 40px; }
                .input-group { text-align: left; margin-bottom: 22px; }
                .input-group label { display: block; margin-bottom: 10px; font-size: 13px; font-weight: 700; color: var(--navy); margin-left: 6px; }

                .input-box { position: relative; display: flex; align-items: center; }
                .input-box svg { position: absolute; left: 20px; color: var(--navy); opacity: 0.4; }
                
                .login-input { 
                    width: 100%; padding: 18px 20px 18px 58px; border-radius: 22px; 
                    border: 2px solid #E2E8F0; background: #F8FAFC; font-family: 'Kanit'; 
                    font-size: 15px; outline: none; transition: 0.4s; box-sizing: border-box;
                }
                .login-input:focus { border-color: var(--gold); background: #fff; box-shadow: 0 10px 25px -5px rgba(197, 160, 89, 0.15); }

                /* ✅ ปรับแต่งส่วน ลืมรหัสผ่าน ให้สวยงามขึ้น */
                .forgot-row { 
                    display: flex; 
                    justify-content: flex-end; 
                    margin-top: -12px; 
                    margin-bottom: 30px; 
                }
                .forgot-link { 
                    color: var(--gold); 
                    text-decoration: none; 
                    font-size: 14px; 
                    font-weight: 600; 
                    display: flex; 
                    align-items: center; 
                    gap: 5px; 
                    transition: all 0.3s ease;
                    padding: 5px 2px;
                }
                .forgot-link:hover { 
                    color: var(--navy); 
                    transform: translateY(-1px);
                }
                .forgot-link span { position: relative; }
                .forgot-link span::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 1.5px;
                    bottom: -2px;
                    left: 0;
                    background-color: var(--gold);
                    transition: width 0.3s ease;
                }
                .forgot-link:hover span::after { width: 100%; }

                .submit-btn { 
                    width: 100%; padding: 18px; background: linear-gradient(135deg, #1B2559 0%, #11183A 100%); 
                    color: #fff; border: none; border-radius: 24px; font-size: 17px; font-weight: 700; 
                    cursor: pointer; display: flex; justify-content: center; align-items: center; 
                    gap: 12px; transition: 0.3s; box-shadow: 0 15px 30px -10px rgba(27, 37, 89, 0.35);
                }
                .submit-btn:hover { transform: translateY(-3px); box-shadow: 0 20px 35px -10px rgba(27, 37, 89, 0.45); }

                .google-btn { 
                    width: 100%; padding: 15px; border: 2.5px solid #F4F7FE; border-radius: 22px; 
                    background: #fff; cursor: pointer; display: flex; justify-content: center; 
                    align-items: center; gap: 12px; font-weight: 700; font-family: 'Kanit'; 
                    transition: 0.2s; color: var(--navy); margin-top: 30px;
                }
                .google-btn:hover { border-color: var(--gold); background: #F8FAFC; }

                .register-hint { margin-top: 35px; font-size: 15px; color: #718096; }
                .register-hint a { color: var(--gold); font-weight: 800; text-decoration: none; margin-left: 5px; }

                @media (max-width: 480px) {
                    .login-card { padding: 50px 25px 40px; border-radius: 35px; }
                    h2 { font-size: 26px; }
                }
            `}</style>

            <div className="login-card">
                <Link to="/" className="back-home"><Home size={18}/> หน้าหลัก</Link>
                <div className="brand-icon"><Store size={42} /></div>
                <h2>เข้าสู่ระบบ</h2>
                <div className="shop-display">{shopName}</div>

                <form onSubmit={handleLogin} className="form-area">
                    <div className="input-group">
                        <label>อีเมลสมาชิก</label>
                        <div className="input-box">
                            <Mail size={18} />
                            <input type="email" className="login-input" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>รหัสผ่าน</label>
                        <div className="input-box">
                            <Lock size={18} />
                            <input type="password" className="login-input" placeholder="ระบุรหัสผ่านของคุณ" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </div>

                    {/* ✅ ลิงก์ลืมรหัสผ่านที่ปรับแต่งใหม่ */}
                    <div className="forgot-row">
                        <Link to="/forgot-password" className="forgot-link">
                            <KeyRound size={15} strokeWidth={2.5} />
                            <span>ลืมรหัสผ่าน?</span>
                        </Link>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <>ล็อกอินเข้าสู่ระบบ <ArrowRight size={22} /></>}
                    </button>
                </form>

                <button className="google-btn" type="button" onClick={handleGoogleLogin}>
                    <FcGoogle size={24} /> ดำเนินการต่อด้วย Google
                </button>

                <div className="register-hint">
                    ยังไม่เป็นสมาชิก? <Link to="/register">สมัครสมาชิกที่นี่</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;