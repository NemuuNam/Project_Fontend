import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
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
  const [shopName, setShopName] = useState('SOOO GUICHAI');

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

  // ✅ แก้ไขส่วน handleReset ในไฟล์ ResetPassword.jsx ของคุณ
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
      // ✅ แก้ไข: ส่ง token ไปที่ URL Parameter (ย้ายออกจาก Object ด้านหลัง)
      const res = await axiosInstance.post(`${API_ENDPOINTS.AUTH}/reset-password/${token}`, {
        userId: userId, // ส่งเฉพาะ userId และ newPassword ใน Body
        newPassword: password
      });

      if (res.success) {
        toast.success("เปลี่ยนรหัสผ่านสำเร็จแล้ว! กำลังพาท่านไปหน้าล็อกอิน");
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      // จะไม่ขึ้น 404 แล้วถ้าแก้ Path ตรงกัน
      toast.error(err.response?.data?.message || "ลิงก์หมดอายุหรือข้อมูลไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-wrapper">
      <Toaster position="top-right" />
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@200;300;400;500;600;700;800&display=swap');
                
                :root {
                    --navy: #1B2559;
                    --gold: #C5A059;
                    --bg-soft: #F4F7FE;
                    --border-color: #E2E8F0;
                }

                .reset-wrapper { 
                    display: flex; justify-content: center; align-items: center; 
                    min-height: 100vh; background: var(--bg-soft); 
                    font-family: 'Kanit', sans-serif; padding: 15px; box-sizing: border-box;
                }

                .reset-card { 
                    background: #fff; padding: 50px 35px; border-radius: 45px; 
                    box-shadow: 0 40px 80px -15px rgba(27, 37, 89, 0.15); 
                    width: 100%; max-width: 440px; text-align: center;
                    border: 1px solid rgba(197, 160, 89, 0.25); position: relative;
                }

                /* ปรับแต่งส่วน Header Icon ให้พรีเมียมขึ้น */
                .brand-icon { 
                    display: inline-flex; padding: 25px; 
                    background: linear-gradient(135deg, rgba(197, 160, 89, 0.1) 0%, rgba(27, 37, 89, 0.05) 100%); 
                    border-radius: 50%; margin-bottom: 25px; color: var(--gold); 
                    box-shadow: inset 0 0 0 2px rgba(197, 160, 89, 0.2);
                }

                h2 { font-weight: 800; font-size: 32px; color: var(--navy); margin: 0; letter-spacing: -0.5px; }
                .shop-tag { color: var(--gold); font-size: 14px; font-weight: 600; margin-top: 8px; text-transform: uppercase; letter-spacing: 2px; }
                .instruction { color: #718096; font-size: 15px; margin-top: 20px; line-height: 1.6; font-weight: 300; }

                .form-area { margin-top: 35px; }
                .input-group { text-align: left; margin-bottom: 22px; }
                .input-group label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 700; color: var(--navy); margin-left: 8px; }

                /* ✅ ปรับปรุง Input Box ให้ Icon อยู่ข้างในทั้งหมด */
                .input-box { 
                    position: relative; 
                    display: flex; 
                    align-items: center; 
                }
                
                .field-icon { 
                    position: absolute; 
                    left: 22px; 
                    color: var(--navy); 
                    opacity: 0.3; 
                    pointer-events: none;
                }

                .reset-input { 
                    width: 100%; 
                    padding: 18px 55px 18px 55px; /* เว้นซ้ายสำหรับ Lock เว้นขวาสำหรับ Eye */
                    border-radius: 25px; 
                    border: 2px solid var(--border-color); 
                    background: #F8FAFC; 
                    font-family: 'Kanit'; 
                    font-size: 16px; 
                    outline: none; 
                    transition: all 0.3s ease; 
                    box-sizing: border-box;
                }

                .reset-input:focus { 
                    border-color: var(--gold); 
                    background: #fff; 
                    box-shadow: 0 10px 20px -5px rgba(197, 160, 89, 0.15); 
                }

                /* ✅ ขยับปุ่มดวงตาเข้ามาใน Input และเพิ่มเส้นแบ่ง (Separator) */
                .eye-btn {
                    position: absolute; 
                    right: 15px; 
                    background: none; 
                    border: none; 
                    cursor: pointer; 
                    color: var(--navy); 
                    opacity: 0.4; 
                    padding: 5px;
                    display: flex;
                    align-items: center;
                    border-left: 1px solid rgba(27, 37, 89, 0.1); /* เพิ่มเส้นแบ่งจางๆ */
                    transition: all 0.2s;
                }
                
                .eye-btn:hover { 
                    opacity: 0.8; 
                    color: var(--gold); 
                }

                .submit-btn { 
                    width: 100%; padding: 18px; 
                    background: linear-gradient(135deg, #1B2559 0%, #11183A 100%); 
                    color: #fff; border: none; border-radius: 25px; 
                    font-size: 18px; font-weight: 700; 
                    cursor: pointer; display: flex; justify-content: center; align-items: center; 
                    gap: 12px; transition: 0.3s; 
                    box-shadow: 0 15px 30px -10px rgba(27, 37, 89, 0.4);
                    margin-top: 15px;
                }

                .submit-btn:hover { 
                    transform: translateY(-3px); 
                    box-shadow: 0 20px 35px -10px rgba(27, 37, 89, 0.5); 
                }

                .submit-btn:disabled { 
                    opacity: 0.7; 
                    cursor: not-allowed; 
                    transform: none;
                }

                .login-link { margin-top: 35px; font-size: 15px; color: #718096; }
                .login-link span { color: var(--gold); font-weight: 800; cursor: pointer; }
                .login-link a { text-decoration: none; }

                /* ✅ Responsive Design ให้เหมาะสมทุกหน้าจอ */
                @media (max-width: 480px) {
                    .reset-card { padding: 45px 25px 35px; border-radius: 35px; }
                    h2 { font-size: 28px; }
                    .brand-icon { padding: 20px; }
                    .reset-input { padding: 16px 50px 16px 52px; font-size: 15px; }
                }
            `}</style>

      <div className="reset-card">
        {/* เปลี่ยนเป็น Icon ShieldCheck เพื่อสื่อถึงความปลอดภัย */}
        <div className="brand-icon">
          <ShieldCheck size={48} strokeWidth={1.5} />
        </div>

        <h2>ตั้งรหัสผ่านใหม่</h2>
        <div className="shop-tag">{shopName}</div>
        <p className="instruction">กรุณากำหนดรหัสผ่านใหม่ที่ปลอดภัย <br />เพื่อให้สามารถเข้าใช้งานระบบได้อีกครั้ง</p>

        <form onSubmit={handleReset} className="form-area">
          <div className="input-group">
            <label>รหัสผ่านใหม่</label>
            <div className="input-box">
              <Lock size={18} className="field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                className="reset-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>ยืนยันรหัสผ่านอีกครั้ง</label>
            <div className="input-box">
              <Lock size={18} className="field-icon" />
              <input
                type="password"
                className="reset-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={24} /> : <>บันทึกรหัสผ่านใหม่ <ArrowRight size={22} /></>}
          </button>
        </form>

        <div className="login-link">
          จำรหัสผ่านได้แล้ว? <Link to="/login"><span>เข้าสู่ระบบที่นี่</span></Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;