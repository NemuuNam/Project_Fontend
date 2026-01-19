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
    const [shopName, setShopName] = useState('COOKIE SHOP');
    const [cartCount, setCartCount] = useState(0);

    const navItems = [
        { label: 'HOME', path: '/', icon: <Home size={20} /> },
        { label: 'PRODUCTS', path: '/products', icon: <Package size={20} /> },
        { label: 'ABOUT', path: '/about', icon: <Info size={20} /> },
        { label: 'CONTACT', path: '/contact', icon: <PhoneCall size={20} /> },
    ];

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
        updateCartBadge();
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
        <header className="sticky top-0 w-full bg-[#ffffff] z-[1000] font-['Kanit'] py-5 px-6 border-b border-slate-100 text-left">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                {/* --- Logo Area --- */}
                <Link to="/" className="flex items-center gap-4 group">
                    {/* 🚀 โลโก้: ไอคอนดำ พื้นขาว ขอบบาง */}
                    <div className="w-12 h-12 bg-white border border-slate-200 text-[#000000] rounded-2xl flex items-center justify-center shadow-sm">
                        <Sparkles size={26} strokeWidth={2.5} />
                    </div>
                    <span className="text-3xl font-medium text-[#000000] uppercase tracking-tighter italic">
                        {shopName}
                    </span>
                </Link>

                {/* --- Desktop Navigation --- */}
                <nav className="hidden lg:flex items-center gap-2">
                    {navItems.map((item) => (
                        <Link 
                            key={item.path}
                            to={item.path}
                            className={`px-6 py-2.5 rounded-2xl font-medium text-[18px] uppercase tracking-widest transition-all
                                ${location.pathname === item.path 
                                    ? 'bg-slate-100 text-[#000000] italic' 
                                    : 'text-[#374151] hover:bg-slate-50 hover:text-[#000000]'}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* --- Actions --- */}
                <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                    {/* 🚀 ตะกร้า: ไอคอนดำ พื้นขาว ขอบบาง */}
                    <Link to="/cart" className="p-4 bg-white rounded-2xl text-[#000000] border border-slate-200 hover:bg-slate-50 transition-all active:scale-90 relative shadow-sm">
                        <ShoppingCart size={24} strokeWidth={2.5} />
                        {cartCount > 0 && (
                            <span className="absolute top-2 right-2 bg-black text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#FDFCFB]">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {isLoggedIn ? (
                        <div className="relative">
                            <button 
                                className="flex items-center gap-4 p-2 pr-6 bg-white rounded-2xl hover:bg-slate-50 transition-all active:scale-95 border border-slate-100"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                {/* 🚀 โปรไฟล์: ตัวอักษรดำ พื้นขาว ขอบบาง */}
                                <div className="w-11 h-11 bg-white border border-slate-200 text-[#000000] rounded-xl flex items-center justify-center font-medium text-lg uppercase shadow-inner">
                                    {userData?.first_name?.charAt(0) || <Loader2 size={16} className="animate-spin text-black" />}
                                </div>
                                <span className="hidden sm:block text-base font-medium text-[#000000] uppercase italic">
                                    {userData?.first_name || 'USER'}
                                </span>
                                <ChevronDown size={18} strokeWidth={3} className="text-[#000000]" />
                            </button>

                            {showDropdown && (
                                <div className="absolute top-16 right-0 w-72 bg-white rounded-[2.5rem] shadow-2xl z-[1001] p-6 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-100 text-left">
                                    <div className="text-center pb-5 border-b border-slate-50 mb-5">
                                        <div className="w-16 h-16 bg-white border border-slate-200 text-[#000000] rounded-3xl flex items-center justify-center font-medium text-2xl mx-auto mb-3 shadow-sm">
                                            {userData?.first_name?.charAt(0)}
                                        </div>
                                        <h3 className="text-xl font-medium text-[#000000] uppercase italic leading-none">{userData?.first_name} {userData?.last_name}</h3>
                                        <p className="text-[12px] font-medium text-[#64748B] tracking-wider mt-2 lowercase">{userData?.email}</p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Link to="/profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-4 p-3 text-[14px] font-medium text-[#374151] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">
                                            <UserCircle size={20} className="text-black" /> Profile
                                        </Link>
                                        <Link to="/my-orders" onClick={() => setShowDropdown(false)} className="flex items-center gap-4 p-3 text-[14px] font-medium text-[#374151] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">
                                            <History size={20} className="text-black" /> My Orders
                                        </Link>
                                        {userData?.role_level <= 3 && (
                                            <Link to="/admin/dashboard" onClick={() => setShowDropdown(false)} className="flex items-center gap-4 p-3 text-[14px] font-medium text-[#000000] bg-slate-100 uppercase tracking-widest hover:bg-slate-200 rounded-xl transition-all mt-1">
                                                <LayoutDashboard size={20} className="text-black" /> Dashboard
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} className="flex items-center gap-4 p-3 text-[14px] font-medium text-red-600 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all mt-2 italic">
                                            <LogOut size={20} className="text-red-500" /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="px-8 py-3 bg-[#000000] text-white rounded-xl font-medium text-base uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm">
                            Sign In
                        </Link>
                    )}

                    <button className="lg:hidden p-4 bg-white rounded-xl text-[#000000] border border-slate-200 hover:bg-slate-50" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[88px] bg-white z-[999] p-8 animate-in slide-in-from-right duration-300">
                    <div className="flex flex-col gap-3">
                        {navItems.map((item) => (
                            <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-5 p-5 rounded-2xl transition-all ${location.pathname === item.path ? 'bg-slate-100 text-[#000000] italic font-medium' : 'text-[#374151] font-medium uppercase'}`}>
                                {React.cloneElement(item.icon, { size: 24, className: 'text-black' })} 
                                <span className="text-xl italic tracking-tighter">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default HeaderHome;