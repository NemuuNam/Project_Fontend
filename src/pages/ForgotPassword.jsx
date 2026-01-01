import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ArrowLeft, Loader2, Home } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState('SOOO GUICHAI'); // ค่าเริ่มต้น
  const navigate = useNavigate();

  // ✅ ดึงข้อมูลชื่อร้านค้าผ่าน Endpoint /public
  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
        if (res.success && res.data?.shop_name && res.data.shop_name !== "EMPTY") {
          setShopName(res.data.shop_name); //
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
      // Normalize อีเมลให้เป็นตัวพิมพ์เล็ก
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
    <div className="forgot-wrapper">
      <Toaster position="top-right" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@200;300;400;500;600;700;800&display=swap');
        
        :root {
          --navy: #1B2559;
          --gold: #C5A059;
          --bg-soft: #F4F7FE;
        }

        .forgot-wrapper { 
          display: flex; justify-content: center; align-items: center; 
          min-height: 100vh; background: var(--bg-soft); 
          font-family: 'Kanit', sans-serif; padding: 20px; box-sizing: border-box;
        }

        .forgot-card { 
          background: #fff; padding: 50px 35px; border-radius: 40px; 
          box-shadow: 0 40px 80px -15px rgba(27, 37, 89, 0.15); 
          width: 100%; max-width: 440px; text-align: center;
          border: 1px solid rgba(197, 160, 89, 0.25); position: relative;
        }

        .back-nav {
          position: absolute; top: 30px; left: 35px; color: var(--navy);
          text-decoration: none; display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 600; opacity: 0.6; transition: 0.3s;
        }
        .back-nav:hover { opacity: 1; color: var(--gold); transform: translateX(-3px); }

        .icon-box { 
          display: inline-flex; padding: 22px; background: rgba(197, 160, 89, 0.1); 
          border-radius: 30px; margin-bottom: 25px; color: var(--gold); 
        }

        h2 { font-weight: 800; font-size: 30px; color: var(--navy); margin: 0; letter-spacing: -0.5px; }
        .shop-tag { color: var(--gold); font-size: 14px; font-weight: 600; margin-top: 6px; text-transform: uppercase; letter-spacing: 2px; }
        .desc { color: #718096; font-size: 15px; margin-top: 20px; line-height: 1.6; }

        .form-area { margin-top: 35px; }
        .input-group { text-align: left; margin-bottom: 25px; }
        .input-group label { display: block; margin-bottom: 10px; font-size: 14px; font-weight: 700; color: var(--navy); margin-left: 6px; }

        .input-box { position: relative; display: flex; align-items: center; }
        .input-box svg { position: absolute; left: 20px; color: var(--navy); opacity: 0.4; }
        
        .forgot-input { 
          width: 100%; padding: 18px 20px 18px 58px; border-radius: 22px; 
          border: 2px solid #E2E8F0; background: #F8FAFC; font-family: 'Kanit'; 
          font-size: 16px; outline: none; transition: 0.4s; box-sizing: border-box;
        }
        .forgot-input:focus { border-color: var(--gold); background: #fff; box-shadow: 0 10px 25px -5px rgba(197, 160, 89, 0.15); }

        .submit-btn { 
          width: 100%; padding: 18px; background: linear-gradient(135deg, #1B2559 0%, #11183A 100%); 
          color: #fff; border: none; border-radius: 24px; font-size: 17px; font-weight: 700; 
          cursor: pointer; display: flex; justify-content: center; align-items: center; 
          gap: 12px; transition: 0.3s; box-shadow: 0 15px 30px -10px rgba(27, 37, 89, 0.35);
        }
        .submit-btn:hover { transform: translateY(-3px); box-shadow: 0 20px 35px -10px rgba(27, 37, 89, 0.45); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .footer-link { margin-top: 35px; font-size: 14px; color: #718096; }
        .footer-link a { color: var(--gold); font-weight: 800; text-decoration: none; transition: 0.3s; }
        .footer-link a:hover { color: var(--navy); }

        @media (max-width: 480px) {
          .forgot-card { padding: 50px 25px 40px; }
          h2 { font-size: 26px; }
        }
      `}</style>

      <div className="forgot-card">
        <Link to="/login" className="back-nav"><ArrowLeft size={18}/> กลับไปเข้าสู่ระบบ</Link>
        
        <div className="icon-box">
          <KeyRound size={42} />
        </div>
        
        <h2>ลืมรหัสผ่าน?</h2>
        <div className="shop-tag">{shopName}</div>
        
        <p className="desc">
          ระบุอีเมลที่คุณใช้สมัครสมาชิก <br/>
          เราจะส่งลิงก์เพื่อตั้งรหัสผ่านใหม่ให้คุณ
        </p>

        <form onSubmit={handleSubmit} className="form-area">
          <div className="input-group">
            <label>อีเมลสมาชิก</label>
            <div className="input-box">
              <Mail size={18} />
              <input 
                type="email" 
                className="forgot-input" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={24} /> : <>ส่งลิงก์กู้คืนรหัสผ่าน</>}
          </button>
        </form>

        <div className="footer-link">
          จำรหัสผ่านได้แล้ว? <Link to="/login">เข้าสู่ระบบที่นี่</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;