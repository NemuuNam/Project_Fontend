import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
    User, MapPin, Settings, LogOut, Mail, Phone, 
    ShieldCheck, Loader2, Plus, X, Lock, Trash2, Edit2, 
    CheckCircle, ArrowRight, Heart, ShoppingBag, AlertCircle, Info, Activity,
    Leaf, Cookie, Smile, Sparkles, Undo2, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

// --- 1. ส่วนประกอบย่อย: แบบฟอร์มแก้ไขโปรไฟล์ (Pearl White Style) ---
const ProfileEditForm = ({ initialData, onSubmit, isSubmitting }) => {
    const [form, setForm] = useState(initialData);
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const val = value.replace(/[^0-9]/g, '').slice(0, 10);
            setForm(prev => ({ ...prev, [name]: val }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };
    return (
        <form onSubmit={(e) => onSubmit(e, form)} className="space-y-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-[0.2em] ml-2">ชื่อจริง</label>
                    <input name="first_name" type="text" value={form.first_name} onChange={handleChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2D241E] transition-all font-bold text-[#2D241E] shadow-sm" required />
                </div>
                <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-[0.2em] ml-2">นามสกุล</label>
                    <input name="last_name" type="text" value={form.last_name} onChange={handleChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2D241E] transition-all font-bold text-[#2D241E] shadow-sm" required />
                </div>
            </div>
            <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-[0.2em] ml-2">เบอร์โทรศัพท์ติดต่อ</label>
                <input name="phone" type="text" value={form.phone} onChange={handleChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2D241E] transition-all font-bold text-[#2D241E] shadow-sm" placeholder="08x-xxx-xxxx" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-white border border-[#2D241E] text-[#2D241E] rounded-2xl font-black text-xs shadow-md hover:bg-slate-50 transition-all uppercase tracking-[0.3em] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "บันทึกข้อมูลส่วนตัว"}
            </button>
        </form>
    );
};

// --- 2. ส่วนประกอบย่อย: แบบฟอร์มจัดการที่อยู่ (Pearl White Style) ---
const AddressFormSub = ({ initialData, onSubmit, isSubmitting, isEdit }) => {
    const [form, setForm] = useState(initialData || { recipient_name: '', phone_number: '', address_detail: '' });
    const handleChange = (e) => {
        const { name, value } = e.target;
        const val = name === 'phone_number' ? value.replace(/[^0-9]/g, '').slice(0, 10) : value;
        setForm(prev => ({ ...prev, [name]: val }));
    };
    return (
        <form onSubmit={(e) => onSubmit(e, form)} className="space-y-5 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-[0.2em] ml-2">ชื่อผู้รับสินค้า</label>
                    <input name="recipient_name" type="text" value={form.recipient_name} onChange={handleChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2D241E] font-bold text-[#2D241E] shadow-sm" required />
                </div>
                <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-[0.2em] ml-2">เบอร์โทรศัพท์ผู้รับ</label>
                    <input name="phone_number" type="text" value={form.phone_number} onChange={handleChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2D241E] font-bold text-[#2D241E] shadow-sm" required />
                </div>
            </div>
            <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-[0.2em] ml-2">ที่อยู่โดยละเอียด</label>
                <textarea name="address_detail" value={form.address_detail} onChange={handleChange} className="w-full p-5 bg-white border border-slate-200 rounded-3xl outline-none h-32 resize-none focus:border-[#2D241E] font-medium text-[#2D241E] shadow-sm" required />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-white border border-[#2D241E] text-[#2D241E] rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-md hover:bg-slate-50 transition-all active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : (isEdit ? "อัปเดตข้อมูลที่อยู่" : "เพิ่มที่อยู่ใหม่")}
            </button>
        </form>
    );
};

// --- 3. ส่วนประกอบย่อย: แบบฟอร์มเปลี่ยนรหัสผ่าน (Pearl White Style) ---
const ChangePasswordForm = ({ onSubmit, isSubmitting }) => {
    const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) return toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
        onSubmit(e, form);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white">
            <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-[0.2em] ml-2">รหัสผ่านปัจจุบัน</label>
                <input name="oldPassword" type="password" value={form.oldPassword} onChange={handleChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2D241E] font-bold text-[#2D241E] shadow-sm" required />
            </div>
            <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-[0.2em] ml-2">รหัสผ่านใหม่</label>
                <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2D241E] font-bold text-[#2D241E] shadow-sm" required />
            </div>
            <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-[0.2em] ml-2">ยืนยันรหัสผ่านใหม่</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2D241E] font-bold text-[#2D241E] shadow-sm" required />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-white border border-[#2D241E] text-[#2D241E] rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-md hover:bg-slate-50 transition-all active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "เปลี่ยนรหัสผ่านใหม่"}
            </button>
        </form>
    );
};

// --- ส่วนหลักของคอมโพเนนต์ ---
const Profile = ({ userData }) => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [editingAddress, setEditingAddress] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [profileRes, wishRes] = await Promise.allSettled([
                axiosInstance.get(`${API_ENDPOINTS.AUTH}/profile`),
                axiosInstance.get('/api/wishlist') 
            ]);

            if (profileRes.status === 'fulfilled' && profileRes.value.success) {
                setProfile(profileRes.value.data);
            }

            if (wishRes.status === 'fulfilled' && wishRes.value.success) {
                setFavorites(wishRes.value.data || []);
            }
        } catch (error) {
            toast.error("ดึงข้อมูลล้มเหลว");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const closeModal = () => { setActiveModal(null); setEditingAddress(null); };

    const handleUpdateProfile = async (e, formData) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            const res = await axiosInstance.put(`${API_ENDPOINTS.AUTH}/profile`, formData);
            if (res.success) { toast.success("อัปเดตโปรไฟล์สำเร็จ"); fetchData(); closeModal(); }
        } catch (err) { toast.error("บันทึกล้มเหลว"); } finally { setIsSubmitting(false); }
    };

    const handleSaveAddress = async (e, formData) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            const res = editingAddress 
                ? await axiosInstance.put(`${API_ENDPOINTS.ADDRESSES}/${editingAddress.address_id}`, formData)
                : await axiosInstance.post(API_ENDPOINTS.ADDRESSES, formData);
            if (res.success) { toast.success("จัดการที่อยู่สำเร็จ"); fetchData(); closeModal(); }
        } catch (err) { toast.error("จัดการที่อยู่ล้มเหลว"); } finally { setIsSubmitting(false); }
    };

    const handleDeleteAddress = async (id) => {
        const result = await Swal.fire({ 
            title: 'ต้องการลบที่อยู่นี้?', 
            text: 'ข้อมูลที่อยู่จะถูกลบออกจากระบบอย่างถาวร',
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#2D241E', 
            cancelButtonColor: '#fff',
            confirmButtonText: 'ยืนยันการลบ',
            cancelButtonText: 'ยกเลิก',
            background: '#ffffff',
            customClass: { 
                popup: 'rounded-[3rem] font-["Kanit"]',
                confirmButton: 'rounded-full px-8 py-3 text-white',
                cancelButton: 'rounded-full px-8 py-3 text-[#2D241E] border border-slate-100'
            } 
        });
        if (result.isConfirmed) {
            try {
                const res = await axiosInstance.delete(`${API_ENDPOINTS.ADDRESSES}/${id}`);
                if (res.success) { toast.success("ลบที่อยู่สำเร็จ"); fetchData(); }
            } catch (err) { toast.error("ลบไม่สำเร็จ"); }
        }
    };

    const handleRemoveFavorite = async (productId) => {
        try {
            const res = await axiosInstance.post('/api/wishlist/toggle', { product_id: productId });
            if (res.success) { 
                toast.success("ลบออกจากรายการโปรดแล้ว"); 
                setFavorites(prev => prev.filter(item => (item.product?.product_id !== productId && item.product_id !== productId)));
                fetchData(); 
            }
        } catch (err) { toast.error("เกิดข้อผิดพลาด"); }
    };

    const handleChangePassword = async (e, formData) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            const res = await axiosInstance.put(`${API_ENDPOINTS.AUTH}/change-password`, formData);
            if (res.success) { toast.success("เปลี่ยนรหัสผ่านสำเร็จ"); closeModal(); }
        } catch (err) { toast.error(err.response?.data?.message || "เปลี่ยนรหัสผ่านล้มเหลว"); } finally { setIsSubmitting(false); }
    };

    const Modal = ({ title, children, onClose }) => (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#2D241E]/5 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] md:rounded-[4rem] w-full max-w-2xl p-8 lg:p-14 shadow-2xl relative animate-in zoom-in-95 overflow-hidden border border-slate-100">
                <Smile className="absolute -top-10 -left-10 text-[#2D241E] opacity-[0.02]" size={150} />
                <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white border border-slate-100 text-[#2D241E] hover:text-red-500 rounded-2xl transition-all shadow-sm z-10"><X size={20} /></button>
                <h2 className="text-3xl md:text-4xl font-black mb-10 text-[#2D241E] uppercase tracking-tighter italic text-left">จัดการ <span className="opacity-30">{title}</span></h2>
                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar relative z-10">{children}</div>
            </div>
        </div>
    );

    if (loading || !profile) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden selection:bg-[#F3E9DC] relative">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* ☁️ ลวดลายพื้นหลัง Gimmick (Cozy Patterns) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[-5%] rotate-12 text-[#2D241E] opacity-[0.02]" size={300} />
                <Cookie className="absolute bottom-[20%] right-[-5%] -rotate-12 text-[#2D241E] opacity-[0.03]" size={250} />
                <Smile className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#2D241E] opacity-[0.02]" size={400} />
                <Sparkles className="absolute top-[15%] right-[10%] text-[#2D241E] opacity-[0.02]" size={100} />
            </div>

            {/* --- ส่วนหัวโปรไฟล์ --- */}
            <section className="relative pt-32 pb-16 px-6 bg-white border-b border-slate-50 z-10">
                <div className="container mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="w-40 h-40 md:w-48 md:h-48 bg-white text-[#2D241E] rounded-[3rem] md:rounded-[4rem] shadow-sm flex items-center justify-center relative group overflow-hidden border border-slate-100">
                        <User size={70} className="group-hover:scale-110 transition-transform duration-700 opacity-20" />
                        <Smile className="absolute -bottom-4 -right-4 opacity-[0.05] text-[#2D241E]" size={80} />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="bg-white text-[#2D241E] text-[10px] font-black px-6 py-2 rounded-full tracking-widest uppercase shadow-sm border border-slate-100">{profile.role_name === 'Customer' ? 'สมาชิกคนสำคัญ' : profile.role_name}</span>
                            <span className="bg-white text-emerald-600 text-[10px] font-black px-6 py-2 rounded-full tracking-widest border border-emerald-100 flex items-center gap-2 uppercase tracking-tighter">Verified Account</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-tight text-[#2D241E]">
                            {profile.first_name} <span className="opacity-20 italic font-light">{profile.last_name}</span>
                        </h1>
                    </div>
                </div>
            </section>

            <section className="relative py-12 md:py-20 px-6 container mx-auto z-10 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start">
                    
                    {/* แถบเมนูด้านข้าง */}
                    <div className="lg:col-span-4 space-y-3 sticky top-32">
                        <h3 className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[0.4em] mb-6 px-4">เมนูจัดการบัญชี</h3>
                        {[
                            { id: 'profile', icon: Settings, label: 'แก้ไขโปรไฟล์ส่วนตัว' },
                            { id: 'address', icon: MapPin, label: 'จัดการที่อยู่จัดส่งสินค้า' },
                            { id: 'favorites', icon: Heart, label: 'รายการสินค้าที่คุณรัก' },
                            { id: 'password', icon: Lock, label: 'ความปลอดภัยของบัญชี' }
                        ].map((menu) => (
                            <button 
                                key={menu.id} 
                                onClick={() => menu.id === 'favorites' ? document.getElementById('fav-section').scrollIntoView({ behavior: 'smooth' }) : setActiveModal(menu.id)} 
                                className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 rounded-[2rem] transition-all group border border-slate-100 shadow-sm"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-white border border-slate-50 rounded-xl text-[#2D241E]/30 group-hover:text-[#2D241E] transition-all"><menu.icon size={18}/></div>
                                    <span className="font-black text-sm text-[#2D241E] uppercase tracking-tight">{menu.label}</span>
                                </div>
                                <ChevronRight size={16} className="text-[#2D241E]/20 group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                        <div className="pt-8 mt-4">
                             <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="w-full flex items-center justify-center gap-3 p-5 text-red-400 font-black text-[10px] bg-white rounded-[2rem] transition-all uppercase tracking-widest border border-red-50 hover:bg-red-50">
                                <LogOut size={16}/> ออกจากระบบสมาชิก
                             </button>
                        </div>
                    </div>

                    {/* ส่วนแสดงเนื้อหา */}
                    <div className="lg:col-span-8 space-y-12 md:space-y-16">
                        
                        {/* ข้อมูลประจำตัว */}
                        <div className="bg-white rounded-[3rem] md:rounded-[4rem] p-10 md:p-16 border border-slate-100 shadow-sm relative overflow-hidden group">
                            <Sparkles className="absolute top-10 right-10 text-[#2D241E] opacity-[0.02]" size={100} />
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12 italic">ข้อมูล <span className="opacity-20 font-light">บัญชีสมาชิก</span></h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 md:gap-y-12 gap-x-12">
                                <InfoItem label="ชื่อจริง - นามสกุล" value={`${profile.first_name} ${profile.last_name}`} icon={<User size={12}/>} />
                                <InfoItem label="อีเมลที่ใช้ลงทะเบียน" value={profile.email} icon={<Mail size={12}/>} />
                                <InfoItem label="เบอร์โทรศัพท์" value={profile.phone || 'ยังไม่ได้ระบุข้อมูล'} icon={<Phone size={12}/>} />
                                <InfoItem label="ประเภทสมาชิก" value={profile.role_name === 'Customer' ? 'สมาชิกทั่วไป' : profile.role_name} icon={<ShieldCheck size={12}/>} isGold />
                            </div>

                            {/* จัดการที่อยู่ */}
                            <div className="mt-20 pt-12 border-t border-slate-50">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                                    <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-3 italic">ที่อยู่จัดส่งขนม</h4>
                                    <button onClick={() => setActiveModal('address')} className="px-8 py-3 bg-white text-[#2D241E] border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">เพิ่มที่อยู่ใหม่</button>
                                </div>
                                {profile.addresses?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {profile.addresses.map(addr => (
                                            <div key={addr.address_id} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 group relative hover:shadow-md transition-all duration-500">
                                                <div className="absolute top-6 right-6 flex gap-2">
                                                    <button onClick={() => { setEditingAddress(addr); setActiveModal('address'); }} className="p-2 text-[#2D241E]/30 hover:text-[#2D241E] transition-all"><Edit2 size={14}/></button>
                                                    <button onClick={() => handleDeleteAddress(addr.address_id)} className="p-2 text-[#2D241E]/30 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
                                                </div>
                                                <p className="font-black text-[#2D241E] text-xl mb-3 uppercase tracking-tighter italic">{addr.recipient_name}</p>
                                                <p className="text-sm leading-relaxed text-[#2D241E]/60 font-light line-clamp-2 mb-6 italic">"{addr.address_detail}"</p>
                                                <div className="flex items-center gap-2 text-[#2D241E] font-black text-[10px] uppercase tracking-widest opacity-30"><Phone size={12}/> {addr.phone_number}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-100 text-center">
                                        <p className="text-[#2D241E]/20 font-black uppercase tracking-widest text-[10px] italic">คุณยังไม่ได้เพิ่มที่อยู่จัดส่ง</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* รายการที่ชอบ */}
                        <div id="fav-section" className="bg-white rounded-[3rem] md:rounded-[4rem] p-10 md:p-16 border border-slate-100 shadow-sm relative overflow-hidden group">
                            <Heart className="absolute -top-10 -right-10 text-[#2D241E] opacity-[0.02]" size={200} />
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12 italic">เมนู <span className="opacity-20 font-light">ที่ชอบที่สุด</span></h2>
                            
                            {favorites.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                                    {favorites.map((fav) => {
                                        const prod = fav.product || fav; 
                                        const mainImg = prod.images?.[0]?.image_url || '/placeholder.png';
                                        return (
                                            <div key={fav.wishlist_id || prod.product_id} className="group/card flex flex-col gap-5 p-5 bg-white rounded-[3rem] border border-slate-100 hover:shadow-lg transition-all duration-700">
                                                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-50">
                                                    <img src={mainImg} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-[2s]" alt={prod.product_name} />
                                                    <button 
                                                        onClick={() => handleRemoveFavorite(prod.product_id)} 
                                                        className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-red-400 p-3 rounded-2xl shadow-sm hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <Heart size={16} fill="currentColor"/>
                                                    </button>
                                                </div>
                                                <div className="flex flex-col px-2 space-y-1">
                                                    <h4 className="font-black text-[#2D241E] text-xl tracking-tighter uppercase italic">{prod.product_name}</h4>
                                                    <p className="text-[#2D241E] font-black text-2xl tracking-tighter mb-4 opacity-20">฿{prod.unit_price?.toLocaleString()}</p>
                                                    <button onClick={() => navigate(`/products`)} className="w-full py-4 bg-white border border-[#2D241E] text-[#2D241E] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#2D241E] hover:text-white transition-all">
                                                        สั่งซื้อเมนูนี้
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-100">
                                    <p className="text-[#2D241E]/20 font-black uppercase tracking-widest text-[10px] italic mb-6">ยังไม่มีเมนูที่ถูกใจในขณะนี้</p>
                                    <button onClick={() => navigate('/products')} className="px-10 py-4 bg-white border border-[#2D241E] text-[#2D241E] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">ไปเลือกชมขนม</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- ส่วนจัดการ Modal --- */}
            {activeModal === 'profile' && <Modal title="โปรไฟล์" onClose={closeModal}><ProfileEditForm initialData={{ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone || '' }} onSubmit={handleUpdateProfile} isSubmitting={isSubmitting} /></Modal>}
            {activeModal === 'address' && <Modal title={editingAddress ? "ข้อมูลที่อยู่" : "ที่อยู่จัดส่งใหม่"} onClose={closeModal}><AddressFormSub initialData={editingAddress} onSubmit={handleSaveAddress} isSubmitting={isSubmitting} isEdit={!!editingAddress} /></Modal>}
            {activeModal === 'password' && <Modal title="ความปลอดภัย" onClose={closeModal}><ChangePasswordForm onSubmit={handleChangePassword} isSubmitting={isSubmitting} /></Modal>}

            <Footer userData={userData} />

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E10; border-radius: 10px; }
            `}} />
        </div>
    );
};

// คอมโพเนนต์แสดงข้อมูลแบบใช้ซ้ำ (Pearl White Style)
const InfoItem = ({ label, value, icon, isGold = false }) => (
    <div className="space-y-3 group/item">
        <label className="text-[10px] font-black text-[#2D241E]/30 uppercase tracking-[0.4em] flex items-center gap-2 ml-1">{icon} {label}</label>
        <div className={`text-2xl md:text-3xl font-black border-b border-slate-50 pb-5 leading-none tracking-tighter transition-all group-hover/item:border-[#2D241E] ${isGold ? 'text-[#D97706] italic' : 'text-[#2D241E]'}`}>
            {value || '—'}
        </div>
    </div>
);

export default memo(Profile);