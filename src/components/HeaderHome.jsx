import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    ShoppingCart, User, LogOut, ChevronDown, Store, 
    History, UserCircle, Loader2, Sparkles, Home,
    Package, Info, PhoneCall, Menu, X
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
    const [shopName, setShopName] = useState('SOOO GUICHAI');
    const [loading, setLoading] = useState(false);

    const navItems = [
        { label: 'หน้าหลัก', path: '/', icon: <Home size={18} strokeWidth={2.5} /> },
        { label: 'สินค้า', path: '/products', icon: <Package size={18} strokeWidth={2.5} /> },
        { label: 'เกี่ยวกับเรา', path: '/about', icon: <Info size={18} strokeWidth={2.5} /> },
        { label: 'ติดต่อเรา', path: '/contact', icon: <PhoneCall size={18} strokeWidth={2.5} /> },
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchUserProfile();
        }

        const fetchShopInfo = async () => {
            try {
                const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
                if (res.success && res.data?.shop_name && res.data.shop_name !== "EMPTY") {
                    setShopName(res.data.shop_name);
                }
            } catch (err) { console.error(err); }
        };

        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
        };

        fetchShopInfo();
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`${API_ENDPOINTS.AUTH}/profile`);
            if (res.success) setUserData(res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleLogout = () => {
        if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
            localStorage.clear();
            setIsLoggedIn(false);
            setUserData(null);
            navigate('/login');
        }
    };

    return (
        <header className="sticky top-0 w-full bg-white z-[1000] font-['Kanit'] py-3 px-6 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                {/* --- Logo Area --- */}
                <Link to="/" className="flex items-center gap-2 group z-[1001]">
                    <div className="p-2 bg-[#2D241E] text-white rounded-xl shadow-md group-hover:scale-105 transition-transform">
                        <Store size={22} strokeWidth={2.5} />
                    </div>
                    <span className="text-xl md:text-2xl font-black text-[#2D241E] uppercase tracking-tighter italic">
                        {shopName}
                    </span>
                </Link>

                {/* --- Desktop Navigation --- */}
                <nav className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link 
                            key={item.path}
                            to={item.path}
                            className={`px-4 py-2 rounded-xl font-black text-sm uppercase tracking-widest transition-all
                                ${location.pathname === item.path 
                                    ? 'bg-[#2D241E] text-white shadow-lg' 
                                    : 'text-[#2D241E] hover:bg-slate-100'}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* --- Actions Area --- */}
                <div className="flex items-center gap-2 md:gap-3 relative" ref={dropdownRef}>
                    
                    {/* Cart Button */}
                    <Link to="/cart" className="p-2.5 bg-slate-50 rounded-xl text-[#2D241E] hover:bg-slate-100 transition-all active:scale-90 relative shadow-sm">
                        <ShoppingCart size={20} strokeWidth={2.5} />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">0</span>
                    </Link>

                    {isLoggedIn ? (
                        <div className="relative">
                            <button 
                                className="flex items-center gap-2 p-1.5 pr-3 bg-slate-50 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <div className="w-8 h-8 bg-[#2D241E] text-white rounded-lg flex items-center justify-center font-black text-sm shadow-inner uppercase">
                                    {userData?.first_name ? userData.first_name.charAt(0) : <Loader2 size={14} className="animate-spin" />}
                                </div>
                                <ChevronDown size={14} strokeWidth={2.5} className={`text-[#2D241E] transition-transform hidden sm:block ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Dropdown */}
                            {showDropdown && (
                                <div className="absolute top-14 right-0 w-64 bg-white rounded-[1.5rem] shadow-2xl z-[1001] p-5 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="text-center pb-4 border-b border-slate-100 mb-4">
                                        <div className="w-12 h-12 bg-[#2D241E] text-white rounded-xl flex items-center justify-center font-black text-lg mx-auto mb-2 shadow-lg uppercase">
                                            {userData?.first_name?.charAt(0)}
                                        </div>
                                        <h3 className="text-sm font-black text-[#2D241E] uppercase italic leading-none">{userData?.first_name} {userData?.last_name}</h3>
                                        <p className="text-[10px] text-slate-400 mt-1">{userData?.email}</p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => { navigate('/profile'); setShowDropdown(false); }} className="w-full py-2.5 bg-slate-50 text-[#2D241E] rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#2D241E] hover:text-white transition-all group">
                                            <UserCircle size={14} strokeWidth={2.5} /> ข้อมูลส่วนตัว
                                        </button>
                                        <button onClick={() => { navigate('/orders'); setShowDropdown(false); }} className="w-full py-2.5 bg-slate-50 text-[#2D241E] rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#2D241E] hover:text-white transition-all group">
                                            <History size={14} strokeWidth={2.5} /> ประวัติสั่งซื้อ
                                        </button>
                                        <button onClick={handleLogout} className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 mt-2 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                            <LogOut size={14} strokeWidth={2.5} /> ออกจากระบบ
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="px-5 py-2.5 bg-[#2D241E] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-md italic">
                            Sign In
                        </Link>
                    )}

                    {/* Mobile Menu Button */}
                    <button 
                        className="lg:hidden p-2.5 bg-slate-50 rounded-xl text-[#2D241E] shadow-sm active:scale-95 transition-all"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[68px] bg-white z-[999] p-6 animate-in slide-in-from-right duration-300 overflow-y-auto shadow-inner">
                    <div className="flex flex-col gap-3">
                        {navItems.map((item) => (
                            <Link 
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all shadow-sm
                                    ${location.pathname === item.path 
                                        ? 'bg-[#2D241E] text-white shadow-lg' 
                                        : 'bg-slate-50 text-[#2D241E] font-black hover:bg-slate-100'}`}
                            >
                                {item.icon}
                                <span className="text-xl font-black uppercase italic tracking-tighter">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default HeaderHome;