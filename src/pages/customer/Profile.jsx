import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
    User, MapPin, Settings, LogOut, Mail, Phone, 
    ShieldCheck, Loader2, Plus, X, Lock, Trash2, Edit2, 
    CheckCircle, Heart, ShoppingBag, Sparkles, ChevronRight, Leaf, Cookie, Smile
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

// --- 1. แบบฟอร์มแก้ไขโปรไฟล์ (เข้มจัด) ---
const ProfileEditForm = ({ initialData, onSubmit, isSubmitting }) => {
    const [form, setForm] = useState(initialData);
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const nums = value.replace(/\D/g, '');
            let val = nums;
            if (nums.length > 6) val = `${nums.slice(0, 3)}-${nums.slice(3, 6)}-${nums.slice(6, 10)}`;
            else if (nums.length > 3) val = `${nums.slice(0, 3)}-${nums.slice(3)}`;
            setForm(prev => ({ ...prev, [name]: val }));
        } else setForm(prev => ({ ...prev, [name]: value }));
    };
    return (
        <form onSubmit={(e) => onSubmit(e, form)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest ml-2">First Name</label>
                    <input name="first_name" type="text" value={form.first_name} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-[#2D241E]/20 rounded-2xl outline-none focus:border-[#2D241E] font-black text-[#2D241E]" required />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest ml-2">Last Name</label>
                    <input name="last_name" type="text" value={form.last_name} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-[#2D241E]/20 rounded-2xl outline-none focus:border-[#2D241E] font-black text-[#2D241E]" required />
                </div>
            </div>
            <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest ml-2">Phone Number</label>
                <input name="phone" type="text" value={form.phone} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-[#2D241E]/20 rounded-2xl outline-none focus:border-[#2D241E] font-black text-[#2D241E]" placeholder="08x-xxx-xxxx" maxLength={12} />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 italic">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Save Profile Details"}
            </button>
        </form>
    );
};

// --- 2. แบบฟอร์มจัดการที่อยู่ ---
const AddressFormSub = ({ initialData, onSubmit, isSubmitting, isEdit }) => {
    const [form, setForm] = useState(initialData || { recipient_name: '', phone_number: '', address_detail: '' });
    const handleChange = (e) => {
        const { name, value } = e.target;
        let val = value;
        if (name === 'phone_number') {
            const nums = value.replace(/\D/g, '');
            if (nums.length > 6) val = `${nums.slice(0, 3)}-${nums.slice(3, 6)}-${nums.slice(6, 10)}`;
            else if (nums.length > 3) val = `${nums.slice(0, 3)}-${nums.slice(3)}`;
            else val = nums;
        }
        setForm(prev => ({ ...prev, [name]: val }));
    };
    return (
        <form onSubmit={(e) => onSubmit(e, form)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest ml-2">Recipient Name</label>
                    <input name="recipient_name" type="text" value={form.recipient_name} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-[#2D241E]/20 rounded-2xl outline-none focus:border-[#2D241E] font-black text-[#2D241E]" required />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest ml-2">Phone</label>
                    <input name="phone_number" type="text" value={form.phone_number} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-[#2D241E]/20 rounded-2xl outline-none focus:border-[#2D241E] font-black text-[#2D241E]" placeholder="08x-xxx-xxxx" maxLength={12} required />
                </div>
            </div>
            <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest ml-2">Address Details</label>
                <textarea name="address_detail" value={form.address_detail} onChange={handleChange} className="w-full p-5 bg-slate-50 border-2 border-[#2D241E]/20 rounded-3xl outline-none h-32 resize-none focus:border-[#2D241E] font-black text-[#2D241E] italic" required />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 italic">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : (isEdit ? "Update Address" : "Add New Address")}
            </button>
        </form>
    );
};

// --- 3. แบบฟอร์มเปลี่ยนรหัสผ่าน ---
const ChangePasswordForm = ({ onSubmit, isSubmitting }) => {
    const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) return toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
        onSubmit(e, form);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest ml-2">Current Password</label>
                <input name="oldPassword" type="password" value={form.oldPassword} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-[#2D241E]/20 rounded-2xl outline-none focus:border-[#2D241E] font-black text-[#2D241E]" required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest ml-2">New Password</label>
                <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-[#2D241E]/20 rounded-2xl outline-none focus:border-[#2D241E] font-black text-[#2D241E]" required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest ml-2">Confirm New Password</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-[#2D241E]/20 rounded-2xl outline-none focus:border-[#2D241E] font-black text-[#2D241E]" required />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 italic mt-4">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Update Security Password"}
            </button>
        </form>
    );
};

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
            if (profileRes.status === 'fulfilled' && profileRes.value.success) setProfile(profileRes.value.data);
            if (wishRes.status === 'fulfilled' && wishRes.value.success) setFavorites(wishRes.value.data || []);
        } catch (error) { toast.error("ดึงข้อมูลล้มเหลว"); } 
        finally { setLoading(false); }
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
            title: 'ต้องการลบที่อยู่นี้?', text: 'ข้อมูลจะถูกลบออกจากระบบถาวร', icon: 'warning', 
            showCancelButton: true, confirmButtonColor: '#2D241E', confirmButtonText: 'ยืนยันการลบ',
            customClass: { popup: 'rounded-[3rem] font-["Kanit"] border-4 border-[#2D241E]' } 
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
            if (res.success) { toast.success("ลบออกจากรายการโปรดแล้ว"); fetchData(); }
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#2D241E]/30 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 lg:p-12 shadow-2xl relative animate-in zoom-in-95 border-4 border-[#2D241E]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 text-[#2D241E] hover:text-red-500 rounded-full transition-all border-2 border-[#2D241E]"><X size={20} strokeWidth={3} /></button>
                <h2 className="text-2xl font-black mb-8 text-[#2D241E] uppercase tracking-tighter italic text-left">Manage <span className="opacity-40 not-italic font-light">{title}</span></h2>
                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left">{children}</div>
            </div>
        </div>
    );

    if (loading || !profile) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden selection:bg-[#F3E9DC] relative">
            <Toaster position="top-right" />
            <HeaderHome userData={userData} />

            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[-5%] rotate-12 text-[#2D241E] opacity-[0.02]" size={300} />
                <Cookie className="absolute bottom-[20%] right-[-5%] -rotate-12 text-[#2D241E] opacity-[0.03]" size={250} />
                <Smile className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#2D241E] opacity-[0.02]" size={400} />
            </div>

            {/* --- Profile Header --- */}
            <section className="relative pt-32 pb-16 px-6 bg-[#FAFAFA] border-b-2 border-slate-100 z-10 text-left">
                <div className="container mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="w-40 h-40 md:w-48 md:h-48 bg-white text-[#2D241E] rounded-[4rem] shadow-xl flex items-center justify-center relative border-4 border-[#2D241E]">
                        <User size={70} strokeWidth={3} />
                        <div className="absolute -bottom-2 -right-2 bg-[#2D241E] text-white p-3 rounded-2xl shadow-lg"><ShieldCheck size={24} strokeWidth={3} /></div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-3">
                        <span className="bg-[#2D241E] text-white text-xs font-black px-5 py-1.5 rounded-full tracking-widest uppercase shadow-lg italic">Premium Account</span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-tight text-[#2D241E]">
                            {profile.first_name} <span className="font-light italic text-[#2D241E]/60">{profile.last_name}</span>
                        </h1>
                    </div>
                </div>
            </section>

            <section className="relative py-12 md:py-20 px-6 container mx-auto z-10 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* 🛠️ Sidebar Menu */}
                    <div className="lg:col-span-4 space-y-3 sticky top-32">
                        <h3 className="text-[10px] font-black text-[#2D241E] uppercase tracking-[0.25em] mb-6 px-4 italic">Account Settings</h3>
                        {[
                            { id: 'profile', icon: Settings, label: 'Personal Information' },
                            { id: 'address', icon: ShoppingBag, label: 'Shipping Addresses' },
                            { id: 'favorites', icon: Heart, label: 'Wishlist History' },
                            { id: 'password', icon: Lock, label: 'Security & Access' }
                        ].map((menu) => (
                            <button key={menu.id} onClick={() => menu.id === 'favorites' ? document.getElementById('fav-section').scrollIntoView({ behavior: 'smooth' }) : setActiveModal(menu.id)} className="w-full flex items-center justify-between p-5 bg-white hover:bg-[#2D241E] hover:text-white rounded-3xl transition-all group border-2 border-slate-200 hover:border-[#2D241E] shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-slate-100 rounded-2xl text-[#2D241E] group-hover:bg-white/10 group-hover:text-white transition-all"><menu.icon size={20} strokeWidth={3}/></div>
                                    <span className="font-black text-sm uppercase tracking-tighter">{menu.label}</span>
                                </div>
                                <ChevronRight size={18} strokeWidth={3} className="text-[#2D241E] group-hover:text-white transition-all" />
                            </button>
                        ))}
                        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="w-full mt-6 flex items-center justify-center gap-3 p-5 text-red-600 font-black text-sm bg-white rounded-3xl transition-all uppercase tracking-widest border-2 border-red-100 hover:bg-red-600 hover:text-white shadow-sm italic">
                            <LogOut size={18} strokeWidth={3}/> Logout Session
                        </button>
                    </div>

                    <div className="lg:col-span-8 space-y-12">
                        <div className="bg-white rounded-[3.5rem] p-10 md:p-14 border-2 border-slate-100 shadow-xl relative overflow-hidden group">
                            <Sparkles className="absolute top-10 right-10 text-[#2D241E] opacity-[0.05]" size={100} />
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-12 italic text-[#2D241E]">Member <span className="font-light not-italic opacity-40">Identity</span></h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                                <InfoItem label="Full Name" value={`${profile.first_name} ${profile.last_name}`} icon={<User size={20} strokeWidth={3}/>} />
                                <InfoItem label="Email Account" value={profile.email} icon={<Mail size={20} strokeWidth={3}/>} />
                                <InfoItem label="Contact Phone" value={profile.phone || 'Not Specified'} icon={<Phone size={20} strokeWidth={3}/>} />
                                <InfoItem label="Account Role" value={profile.role_name === 'Customer' ? 'Gold Member' : profile.role_name} icon={<ShieldCheck size={20} strokeWidth={3}/>} isHigh />
                            </div>

                            <div className="mt-16 pt-12 border-t-2 border-slate-100 text-left">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                                    <h4 className="text-2xl font-black uppercase tracking-tighter italic text-[#2D241E]">Address Registry</h4>
                                    <button onClick={() => setActiveModal('address')} className="px-6 py-2.5 bg-[#2D241E] text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all">+ Register New</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {profile.addresses?.map(addr => (
                                        <div key={addr.address_id} className="p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-200 relative group hover:border-[#2D241E]/40 transition-all shadow-sm">
                                            <div className="absolute top-6 right-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => { setEditingAddress(addr); setActiveModal('address'); }} className="p-2 text-[#2D241E] hover:scale-110"><Edit2 size={16} strokeWidth={3}/></button>
                                                <button onClick={() => handleDeleteAddress(addr.address_id)} className="p-2 text-red-600 hover:scale-110"><Trash2 size={16} strokeWidth={3}/></button>
                                            </div>
                                            <p className="font-black text-[#2D241E] text-lg uppercase tracking-tighter italic mb-2">{addr.recipient_name}</p>
                                            <p className="text-sm font-bold text-[#2D241E] italic leading-relaxed mb-6">"{addr.address_detail}"</p>
                                            <div className="flex items-center gap-2 text-xs font-black text-[#2D241E] uppercase tracking-widest"><Phone size={14} strokeWidth={3}/> {addr.phone_number}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* --- Wishlist Archive --- */}
                        <div id="fav-section" className="bg-white rounded-[3.5rem] p-10 md:p-14 border-2 border-slate-100 shadow-xl relative overflow-hidden group">
                            <Heart className="absolute -top-10 -right-10 text-[#2D241E] opacity-[0.03]" size={200} strokeWidth={3} />
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-12 italic text-[#2D241E]">Wishlist <span className="font-light not-italic opacity-40">Archive</span></h2>
                            
                            {favorites.length > 0 ? (
                                <div className="space-y-4 relative z-10">
                                    {favorites.map((fav) => {
                                        const prod = fav.product || fav; 
                                        const mainImg = prod.images?.[0]?.image_url || '/placeholder.png';
                                        return (
                                            <div key={fav.wishlist_id || prod.product_id} className="group/card flex flex-col md:flex-row items-center gap-6 p-4 bg-white rounded-[2.5rem] border-2 border-slate-200 hover:border-[#2D241E] transition-all duration-500 hover:shadow-lg text-left">
                                                <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-slate-50 border-2 border-slate-200 shadow-inner">
                                                    <img src={mainImg} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-[1.5s]" alt={prod.product_name} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2D241E] rounded-lg text-[9px] font-black text-white uppercase tracking-widest mb-1 shadow-md">
                                                        <Sparkles size={10} strokeWidth={3} /> Best Flavor
                                                    </div>
                                                    <h4 className="font-black text-[#2D241E] text-lg uppercase italic leading-tight">{prod.product_name}</h4>
                                                    <p className="text-xs font-bold text-[#2D241E]/60 italic">Handcrafted with premium ingredients</p>
                                                </div>
                                                <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end gap-4 min-w-[150px] pt-4 md:pt-0 border-t-2 md:border-t-0 md:border-l-2 border-slate-100 md:pl-6">
                                                    <div className="text-left md:text-right flex-1 md:flex-none">
                                                        <p className="text-[9px] font-black text-[#2D241E] uppercase tracking-widest mb-1 leading-none">Price</p>
                                                        <p className="text-2xl font-black text-[#2D241E] italic leading-none">฿{prod.unit_price?.toLocaleString()}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleRemoveFavorite(prod.product_id)} className="p-3 bg-slate-100 text-red-600 rounded-2xl border-2 border-transparent hover:border-red-600 transition-all shadow-sm"><Trash2 size={18} strokeWidth={3} /></button>
                                                        <button onClick={() => navigate(`/products`)} className="px-6 py-3 bg-[#2D241E] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 flex items-center gap-2 italic"><ShoppingBag size={14} strokeWidth={3} /> Order</button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-300 flex flex-col items-center gap-6">
                                    <ShoppingBag size={48} strokeWidth={1} className="text-[#2D241E] opacity-20" />
                                    <p className="text-[#2D241E] font-black uppercase tracking-widest text-sm italic">Wishlist is currently empty</p>
                                    <button onClick={() => navigate('/products')} className="px-8 py-3 bg-[#2D241E] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95">Explore Bakery</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer userData={userData} />
            
            {/* Modal Components */}
            {activeModal === 'profile' && <Modal title="Profile Details" onClose={closeModal}><ProfileEditForm initialData={{ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone || '' }} onSubmit={handleUpdateProfile} isSubmitting={isSubmitting} /></Modal>}
            {activeModal === 'address' && <Modal title={editingAddress ? "Location Info" : "New Registry"} onClose={closeModal}><AddressFormSub initialData={editingAddress} onSubmit={handleSaveAddress} isSubmitting={isSubmitting} isEdit={!!editingAddress} /></Modal>}
            {activeModal === 'password' && <Modal title="Security Access" onClose={closeModal}><ChangePasswordForm onSubmit={handleChangePassword} isSubmitting={isSubmitting} /></Modal>}

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E; border-radius: 10px; }
            `}} />
        </div>
    );
};

const InfoItem = ({ label, value, icon, isHigh = false }) => (
    <div className="space-y-1 text-left border-b-2 border-slate-100 pb-4 group/item">
        <label className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest flex items-center gap-2 mb-2 leading-none">{icon} {label}</label>
        <p className={`text-xl font-black tracking-tighter uppercase ${isHigh ? 'text-[#D4A373] italic' : 'text-[#2D241E]'}`}>{value || '—'}</p>
    </div>
);

export default memo(Profile);