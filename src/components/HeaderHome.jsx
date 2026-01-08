import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingCart, Search, ChevronDown, LogOut,
  User, Mail, Menu, X, LayoutDashboard, History, Package, ShieldCheck, Sparkles,
  Cookie, Smile, Leaf, Heart
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const HeaderHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [shopName, setShopName] = useState('THE BAKERY');

  const menuItems = [
    { name: 'หน้าแรก', path: '/' },
    { name: 'เมนูสินค้า', path: '/products' },
    { name: 'เกี่ยวกับเรา', path: '/about' },
    { name: 'ติดต่อเรา', path: '/contact' }
  ];

  // --- 🔄 Logic (คงเดิมตามต้นฉบับ) ---
  const fetchShopName = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
      if (res.success && res.data) {
        setShopName(res.data.shop_name || 'THE BAKERY');
      }
    } catch (err) { console.error("Fetch shop name error:", err); }
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.PROFILE}`);
      if (res.success) { setUserData(res.data); }
    } catch (err) { setUserData(null); }
  }, []);

  const updateCart = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
  }, []);

  useEffect(() => {
    fetchShopName();
    fetchProfile();
    updateCart();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
    };
    window.addEventListener('storage', updateCart);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('storage', updateCart);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchShopName, fetchProfile, updateCart]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchTerm.trim()) {
        navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        setIsMobileMenuOpen(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserData(null);
    setShowDropdown(false);
    navigate('/');
    window.location.reload();
  };

  const isStaff = userData && [1, 2, 3].includes(Number(userData.role_level));

  return (
    <nav className="sticky top-0 z-[100] bg-white border-b border-slate-100 font-['Kanit'] transition-all duration-500">

      {/* ☁️ Cozy Gimmick Patterns (Opacity 0.02) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Leaf className="absolute top-2 left-[10%] rotate-12 text-[#2D241E] opacity-[0.02]" size={60} />
        <Cookie className="absolute bottom-1 right-[20%] -rotate-12 text-[#2D241E] opacity-[0.02]" size={50} />
        <Smile className="absolute top-3 right-[15%] text-[#2D241E] opacity-[0.02]" size={45} />
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-4 lg:py-5 flex justify-between items-center relative z-10">

        {/* 🍪 Logo Section - Pearl White Button Style */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden bg-white text-[#2D241E] p-2.5 rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-95"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[#D97706] shadow-sm border border-slate-100 group-hover:shadow-md transition-all">
              <Sparkles size={20} fill="currentColor" />
            </div>
            <span className="hidden sm:block text-xl font-black text-[#2D241E] tracking-tighter uppercase italic">{shopName}</span>
          </div>
        </div>

        {/* ☕ Desktop Menu - ปรับปรุงใหม่ให้เส้นตรงเป๊ะ */}
        <div className="hidden lg:flex items-center gap-10">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                className={`text-sm font-bold cursor-pointer transition-all relative py-2 outline-none ${isActive ? 'text-[#2D241E]' : 'text-[#8B7E66] hover:text-[#2D241E]'
                  } group`}
                onClick={() => navigate(item.path)}
              >
                {item.name}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#D97706] rounded-full transition-all duration-300 transform origin-center ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                ></span>
              </button>
            );
          })}
        </div>

        {/* 🍯 Actions Section - Pearl Style Buttons */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Search Input - Pearl Style */}
          <div className="hidden md:flex relative items-center group">
            <Search
              size={18}
              className="absolute left-4 text-[#8B7E66] group-focus-within:text-[#D97706] transition-colors cursor-pointer"
              onClick={handleSearch}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="pl-11 pr-5 py-2.5 w-44 lg:w-52 rounded-2xl bg-white border border-slate-100 focus:border-[#F3E9DC] focus:ring-0 focus:w-64 transition-all text-sm text-[#2D241E] placeholder-[#C2B8A3] shadow-sm"
              placeholder="ค้นหาเมนูโฮมเมด..."
            />
          </div>

          {/* Cart - Pearl White Card */}
          <div
            className="relative cursor-pointer bg-white p-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart size={22} className="text-[#2D241E]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#2D241E] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-sm ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </div>

          {/* User Section */}
          {userData ? (
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-2 cursor-pointer bg-white p-1.5 pr-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="w-9 h-9 bg-white text-[#2D241E] border border-slate-100 rounded-xl flex items-center justify-center font-black text-sm shadow-inner uppercase">
                  {userData.first_name?.charAt(0)}
                </div>
                <ChevronDown size={14} className={`hidden sm:block text-[#C2B8A3] transition-transform duration-500 ${showDropdown ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Modal Style - Only White */}
              {showDropdown && (
                <div className="absolute top-14 right-0 w-72 bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 p-2 animate-in fade-in slide-in-from-top-3 duration-300">
                  <div className="px-6 py-5 border-b border-slate-50 mb-1">
                    <p className="font-black text-[#2D241E] text-sm truncate">{userData.first_name} {userData.last_name}</p>
                    <p className="text-[10px] text-[#C2B8A3] flex items-center gap-2 mt-1 truncate italic tracking-wider"><Mail size={12} /> {userData.email}</p>
                  </div>

                  <div className="space-y-1">
                    <button onClick={() => { navigate('/profile'); setShowDropdown(false); }} className="w-full flex items-center gap-4 px-5 py-3.5 text-xs font-bold text-[#2D241E] hover:bg-slate-50 rounded-2xl transition-all"><User size={18} className="text-[#C2B8A3]" /> โปรไฟล์ส่วนตัว</button>
                    <button onClick={() => { navigate('/my-orders'); setShowDropdown(false); }} className="w-full flex items-center gap-4 px-5 py-3.5 text-xs font-bold text-[#2D241E] hover:bg-slate-50 rounded-2xl transition-all"><Package size={18} className="text-[#C2B8A3]" /> คำสั่งซื้อของฉัน</button>

                    {isStaff && (
                      <div className="mt-1 pt-1 border-t border-slate-50">
                        <button
                          onClick={() => { navigate('/admin/dashboard'); setShowDropdown(false); }}
                          className="w-full flex items-center gap-4 px-5 py-3.5 text-xs font-black text-[#D97706] hover:bg-amber-50/50 rounded-2xl transition-all"
                        >
                          <ShieldCheck size={18} /> ระบบจัดการร้านค้า
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-1 pt-1 border-t border-slate-50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-3.5 text-xs text-red-400 font-bold hover:bg-red-50 rounded-2xl transition-all"><LogOut size={18} /> ลงชื่อออก</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-7 py-3 bg-white text-[#2D241E] rounded-full font-black text-xs uppercase tracking-widest shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
            >
              ลงชื่อเข้าใช้
            </button>
          )}
        </div>
      </div>

      {/* 🍂 Mobile Menu Slide Down - Pearl White */}
      <div className={`lg:hidden overflow-hidden transition-all duration-500 bg-white ${isMobileMenuOpen ? 'max-h-[600px] border-t border-slate-50' : 'max-h-0'}`}>
        <div className="px-6 py-8 space-y-6">
          <div className="relative">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C2B8A3]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white border border-slate-100 text-sm text-[#2D241E] shadow-sm"
              placeholder="ค้นหาเมนู..."
            />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {menuItems.map((item) => (
              <button
                key={item.name}
                className={`text-sm font-bold p-5 rounded-3xl transition-all text-left flex justify-between items-center border ${location.pathname === item.path
                    ? 'bg-white shadow-md border-slate-100 text-[#D97706]'
                    : 'bg-white border-transparent text-[#8B7E66]'
                  }`}
                onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
              >
                {item.name}
                {location.pathname === item.path && <Heart size={16} fill="currentColor" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HeaderHome;