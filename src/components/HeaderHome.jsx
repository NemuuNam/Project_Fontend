import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    ShoppingCart, User, LogOut, ChevronDown, Store, 
    History, UserCircle, Loader2, Sparkles, Home,
    Package, Info, PhoneCall, Menu, X, LayoutDashboard
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const HeaderHome = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    
    // 1. ปรับชื่อร้านเริ่มต้นให้เป็นเรื่องคุกกี้ตามโครงงานใหม่
    const [shopName, setShopName] = useState('COOKIE SHOP');
    
    // 2. เพิ่ม State สำหรับเก็บจำนวนสินค้าในตะกร้า
    const [cartCount, setCartCount] = useState(0);

    const navItems = [
        { label: 'HOME', path: '/', icon: <Home size={18} strokeWidth={3} /> },
        { label: 'PRODUCTS', path: '/products', icon: <Package size={18} strokeWidth={3} /> },
        { label: 'ABOUT', path: '/about', icon: <Info size={18} strokeWidth={3} /> },
        { label: 'CONTACT', path: '/contact', icon: <PhoneCall size={18} strokeWidth={3} /> },
    ];

    // 3. ฟังก์ชันสำหรับคำนวณจำนวนสินค้าทั้งหมดใน LocalStorage
    const updateCartBadge = useCallback(() => {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = localCart.reduce((acc, item) => acc + (item.quantity || 0), 0);
        setCartCount(total);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchUserProfile();
        }
        fetchShopInfo();

        // 4. เรียกใช้ครั้งแรกเพื่อดึงค่าจำนวนสินค้า
        updateCartBadge();

        // 5. ติดตั้ง Listener เพื่อดักฟัง "สัญญาณ" จากหน้า Cart.js (Zustand)
        // เมื่อมีการ setCartItems ในหน้า Cart มันจะส่ง Event มาที่นี่
        window.addEventListener('storage', updateCartBadge);

        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener('storage', updateCartBadge);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [updateCartBadge]);

    const fetchShopInfo = async () => {
        try {
            const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
            if (res.success && res.data?.shop_name) {
                // หากใน DB ยังเป็นชื่อเก่า ให้ใช้ชื่อที่สื่อถึงคุกกี้แทน
                setShopName(res.data.shop_name !== "EMPTY" ? res.data.shop_name : 'COOKIE SHOP');
            }
        } catch (err) { console.error(err); }
    };

    const fetchUserProfile = async () => {
        try {
            const res = await axiosInstance.get(`${API_ENDPOINTS.AUTH}/profile`);
            if (res.success) setUserData(res.data);
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <header className="sticky top-0 w-full bg-white/90 backdrop-blur-md z-[1000] font-['Kanit'] py-4 px-6 shadow-sm border-b border-slate-200 text-left">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                {/* --- Logo Area --- */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-11 h-11 bg-[#2D241E] text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
                        <Sparkles size={22} strokeWidth={2.5} />
                    </div>
                    <span className="text-xl md:text-2xl font-black text-[#2D241E] uppercase tracking-tighter italic leading-none">
                        {shopName}
                    </span>
                </Link>

                {/* --- Desktop Navigation --- */}
                <nav className="hidden lg:flex items-center gap-2">
                    {navItems.map((item) => (
                        <Link 
                            key={item.path}
                            to={item.path}
                            className={`px-5 py-2.5 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all
                                ${location.pathname === item.path 
                                    ? 'bg-[#2D241E] text-white shadow-md italic' 
                                    : 'text-[#2D241E] hover:bg-slate-100'}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* --- Actions --- */}
                <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                    <Link to="/cart" className="p-3 bg-white rounded-xl text-[#2D241E] border-2 border-[#2D241E] hover:shadow-md transition-all active:scale-90 relative">
                        <ShoppingCart size={20} strokeWidth={3} />
                        
                        {/* 6. แสดงตัวเลขจำนวนสินค้าจริงจาก State */}
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {isLoggedIn ? (
                        <div className="relative">
                            <button 
                                className="flex items-center gap-3 p-1.5 pr-4 bg-white rounded-xl border-2 border-[#2D241E] shadow-sm hover:shadow-md transition-all active:scale-95"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <div className="w-9 h-9 bg-[#2D241E] text-white rounded-lg flex items-center justify-center font-black text-sm uppercase">
                                    {userData?.first_name?.charAt(0) || <Loader2 size={14} className="animate-spin" />}
                                </div>
                                <span className="hidden sm:block text-xs font-black text-[#2D241E] uppercase italic">
                                    {userData?.first_name || 'USER'}
                                </span>
                                <ChevronDown size={14} strokeWidth={3} className={`text-[#2D241E] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showDropdown && (
                                <div className="absolute top-14 right-0 w-64 bg-white rounded-[2rem] shadow-2xl z-[1001] p-6 animate-in fade-in slide-in-from-top-4 duration-300 border-2 border-[#2D241E] text-left">
                                    <div className="text-center pb-4 border-b-2 border-slate-100 mb-4">
                                        <div className="w-14 h-14 bg-[#2D241E] text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-md uppercase italic">
                                            {userData?.first_name?.charAt(0)}
                                        </div>
                                        <h3 className="text-base font-black text-[#2D241E] uppercase italic leading-none">{userData?.first_name} {userData?.last_name}</h3>
                                        <p className="text-[10px] font-black text-[#2D241E] opacity-70 tracking-widest mt-2 uppercase">{userData?.email}</p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Link to="/" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 text-[12px] font-black text-[#2D241E] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">
                                            <Home size={18} strokeWidth={3} /> หน้าแรก
                                        </Link>

                                        <Link to="/profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 text-[12px] font-black text-[#2D241E] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">
                                            <UserCircle size={18} strokeWidth={3} /> Profile
                                        </Link>
                                         
                                        <Link to="/my-orders" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 text-[12px] font-black text-[#2D241E] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">
                                            <History size={18} strokeWidth={3} /> My Orders
                                        </Link>

                                        {userData?.role_level <= 3 && (
                                            <Link to="/admin/dashboard" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 text-[12px] font-black text-[#2D241E] bg-[#F3E9DC] uppercase tracking-widest hover:bg-[#EBDCC9] rounded-xl transition-all border border-[#2D241E]/10">
                                                <LayoutDashboard size={18} strokeWidth={3} /> แผงควบคุมแอดมิน
                                            </Link>
                                        )}

                                        <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-[12px] font-black text-red-600 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all mt-2 italic border-2 border-red-100 text-left">
                                            <LogOut size={18} strokeWidth={3} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="px-6 py-3 bg-[#2D241E] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg italic">
                            Sign In
                        </Link>
                    )}

                    <button className="lg:hidden p-3 bg-white rounded-xl text-[#2D241E] border-2 border-[#2D241E] shadow-sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[76px] bg-white z-[999] p-6 animate-in slide-in-from-right duration-300">
                    <div className="flex flex-col gap-3">
                        {navItems.map((item) => (
                            <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-4 p-4 rounded-2xl transition-all shadow-sm ${location.pathname === item.path ? 'bg-[#2D241E] text-white italic font-black' : 'bg-slate-50 text-[#2D241E] font-black uppercase'}`}>
                                {item.icon} <span className="text-lg italic tracking-tighter">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default HeaderHome;