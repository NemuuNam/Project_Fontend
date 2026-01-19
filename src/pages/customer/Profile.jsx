import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    User, MapPin, Settings, LogOut, Mail, Phone,
    ShieldCheck, Loader2, X, Lock, Trash2, Edit2,
    Heart, ShoppingBag, Sparkles, ChevronRight, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

// --- 1. แบบฟอร์มแก้ไขโปรไฟล์ (ตัวอักษรใหญ่ text-xl) ---
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#374151] uppercase tracking-widest ml-2">First Name</label>
                    <input name="first_name" type="text" value={form.first_name} onChange={handleChange} className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl outline-none focus:border-[#000000] text-xl font-medium text-[#111827]" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#374151] uppercase tracking-widest ml-2">Last Name</label>
                    <input name="last_name" type="text" value={form.last_name} onChange={handleChange} className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl outline-none focus:border-[#000000] text-xl font-medium text-[#111827]" required />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151] uppercase tracking-widest ml-2">Phone Number</label>
                <input name="phone" type="text" value={form.phone} onChange={handleChange} className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl outline-none focus:border-[#000000] text-xl font-medium text-[#111827]" placeholder="08x-xxx-xxxx" maxLength={12} />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-white border-2 border-slate-300 text-[#000000] rounded-full font-medium uppercase tracking-widest hover:bg-slate-50 transition-all italic shadow-sm active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Save Profile Details"}
            </button>
        </form>
    );
};

// --- 2. แบบฟอร์มจัดการที่อยู่ (ตัวอักษรใหญ่) ---
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#374151] uppercase tracking-widest ml-2">Recipient Name</label>
                    <input name="recipient_name" type="text" value={form.recipient_name} onChange={handleChange} className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl outline-none focus:border-[#000000] text-xl font-medium text-[#111827]" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#374151] uppercase tracking-widest ml-2">Phone</label>
                    <input name="phone_number" type="text" value={form.phone_number} onChange={handleChange} className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl outline-none focus:border-[#000000] text-xl font-medium text-[#111827]" placeholder="08x-xxx-xxxx" maxLength={12} required />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151] uppercase tracking-widest ml-2">Address Details</label>
                <textarea name="address_detail" value={form.address_detail} onChange={handleChange} className="w-full p-5 bg-white border-2 border-slate-300 rounded-3xl outline-none h-32 resize-none focus:border-[#000000] font-medium text-lg text-[#111827] italic" required />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-white border-2 border-slate-300 text-[#000000] rounded-full font-medium uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 italic">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : (isEdit ? "Update Registry" : "Add Address")}
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151] uppercase tracking-widest ml-2">Current Password</label>
                <input name="oldPassword" type="password" value={form.oldPassword} onChange={handleChange} className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl focus:border-[#000000] outline-none text-xl" required />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151] uppercase tracking-widest ml-2">New Password</label>
                <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl focus:border-[#000000] outline-none text-xl" required />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151] uppercase tracking-widest ml-2">Confirm New Password</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl focus:border-[#000000] outline-none text-xl" required />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-white border-2 border-slate-300 text-[#000000] rounded-full font-medium uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 italic mt-4 shadow-sm">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Update Security"}
            </button>
        </form>
    );
};

// --- 4. Main Component ---
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
        e.preventDefault();
        setIsSubmitting(true);

        // --- ✨ UI FIX: เตรียมข้อมูลให้ตรงกับที่ Controller/DB ต้องการ ---
        const dataToSubmit = {
            ...formData,
            // ลบขีด (-) ออกจากเบอร์โทรให้เหลือแค่ตัวเลข 10 หลัก
            phone: formData.phone.replace(/\D/g, '')
        };

        try {
            const res = await axiosInstance.put(`${API_ENDPOINTS.AUTH}/profile`, dataToSubmit);
            if (res.success) {
                toast.success("อัปเดตโปรไฟล์สำเร็จ");
                fetchData();
                closeModal();
            }
        } catch (err) {
            toast.error("บันทึกล้มเหลว");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleSaveAddress = async (e, formData) => {
        e.preventDefault();
        setIsSubmitting(true);

        // --- ✨ UI FIX: ทำความสะอาดเบอร์โทรศัพท์สำหรับที่อยู่ ---
        const dataToSubmit = {
            ...formData,
            phone_number: formData.phone_number.replace(/\D/g, '')
        };

        try {
            const res = editingAddress
                ? await axiosInstance.put(`${API_ENDPOINTS.ADDRESSES}/${editingAddress.address_id}`, dataToSubmit)
                : await axiosInstance.post(API_ENDPOINTS.ADDRESSES, dataToSubmit);
            if (res.success) {
                toast.success("จัดการที่อยู่สำเร็จ");
                fetchData();
                closeModal();
            }
        } catch (err) {
            toast.error("จัดการที่อยู่ล้มเหลว");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Address?', text: 'Action cannot be undone.', icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#111827', confirmButtonText: 'Confirm',
            customClass: { popup: 'rounded-[3rem] font-["Kanit"] border-2 border-slate-300 bg-white' }
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
            if (res.success) { toast.success("Removed from wishlist"); fetchData(); }
        } catch (err) { toast.error("Error occurred"); }
    };

    const handleChangePassword = async (e, formData) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            const res = await axiosInstance.put(`${API_ENDPOINTS.AUTH}/change-password`, formData);
            if (res.success) { toast.success("Password updated"); closeModal(); }
        } catch (err) { toast.error(err.response?.data?.message || "Update failed"); } finally { setIsSubmitting(false); }
    };

    const Modal = ({ title, children, onClose }) => (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-500/20 backdrop-blur-md p-4 animate-in fade-in" onClick={onClose}>
            <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl relative animate-in zoom-in-95 border-2 border-slate-300" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white text-black border-2 border-slate-300 rounded-full hover:bg-slate-50 transition-all shadow-sm"><X size={20} strokeWidth={3} /></button>
                <h2 className="text-2xl font-medium mb-8 text-[#000000] uppercase italic border-b-4 border-slate-100 pb-2">Manage <span className="text-[#374151] not-italic">{title}</span></h2>
                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left">{children}</div>
            </div>
        </div>
    );

    if (loading || !profile) return <div className="h-screen flex items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-[#000000]" size={48} /></div>;

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] relative overflow-x-hidden selection:bg-slate-200">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- 🚀 Profile Header: pt-16 (ลดจาก 24), pb-4 (ลดจาก 12) --- */}
            <section className="relative pt-16 pb-4 px-8 bg-white border-b-2 border-slate-300 text-left">
                <div className="container mx-auto flex flex-col md:flex-row items-center gap-8">
                    <div className="w-40 h-40 bg-[#FDFCFB] text-[#000000] rounded-[3.5rem] shadow-sm flex items-center justify-center relative border-2 border-slate-300">
                        <User size={72} strokeWidth={2} />
                        <div className="absolute -bottom-2 -right-2 bg-white border-2 border-slate-300 text-[#000000] p-3 rounded-2xl shadow-lg"><ShieldCheck size={24} /></div>
                    </div>
                    <div className="flex-1 space-y-3">
                        <h1 className="text-5xl md:text-7xl font-medium tracking-tighter uppercase italic leading-none text-[#000000]">
                            {profile.first_name} <span className="font-light not-italic text-[#374151]">{profile.last_name}</span>
                        </h1>
                    </div>
                </div>
            </section>

            {/* --- py-6: ลดจาก 12 เพื่อให้เนื้อหากระชับ --- */}
            <section className="relative py-6 px-8 container mx-auto text-left">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* 🛠️ Sidebar Menu: space-y-2 */}
                    <div className="lg:col-span-3 space-y-2 lg:sticky lg:top-28">
                        <p className="text-[10px] font-medium text-[#374151] uppercase tracking-[0.4em] mb-4 ml-4 italic">Registry Settings</p>
                        {[
                            { id: 'profile', icon: Settings, label: 'Identity Information' },
                            { id: 'address', icon: MapPin, label: 'Shipping Registry' },
                            { id: 'favorites', icon: Heart, label: 'Wishlist History' },
                            { id: 'password', icon: Lock, label: 'Security Access' }
                        ].map((menu) => (
                            <button key={menu.id} onClick={() => menu.id === 'favorites' ? document.getElementById('fav-section').scrollIntoView({ behavior: 'smooth' }) : setActiveModal(menu.id)} className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl transition-all hover:border-[#000000] hover:bg-[#FDFCFB] group">
                                <div className="flex items-center gap-4 text-lg font-medium uppercase italic text-[#111827]">
                                    <menu.icon size={20} className="text-[#374151] group-hover:text-black" /> {menu.label}
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-black" />
                            </button>
                        ))}
                        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="w-full mt-6 flex items-center justify-center gap-4 p-4 text-red-700 font-medium text-xs bg-white rounded-2xl border-2 border-red-100 hover:bg-red-50 transition-all uppercase tracking-widest italic shadow-sm">
                            <LogOut size={16} /> Logout Session
                        </button>
                    </div>

                    <div className="lg:col-span-9 space-y-6">
                        {/* Member Identity Card */}
                        <div className="bg-white rounded-[3rem] p-8 border-2 border-slate-300 shadow-sm relative">
                            <h2 className="text-4xl font-medium uppercase tracking-tighter mb-8 italic text-[#000000]">Member <span className="font-light not-italic text-[#374151]">Identity</span></h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                <InfoItem label="Full Registered Name" value={`${profile.first_name} ${profile.last_name}`} icon={<User size={22} />} />
                                <InfoItem label="Email Account" value={profile.email} icon={<Mail size={22} />} />
                                <InfoItem label="Mobile Phone" value={profile.phone || 'NOT SPECIFIED'} icon={<Phone size={22} />} />
                                <InfoItem label="Role Privileges" value={profile.role_name} icon={<ShieldCheck size={22} />} />
                            </div>

                            <div className="mt-8 pt-8 border-t-2 border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-2xl font-medium uppercase italic text-[#000000]">Location Registry</h4>
                                    <button onClick={() => setActiveModal('address')} className="px-5 py-2 bg-white border-2 border-slate-300 text-black rounded-full text-xs font-medium uppercase tracking-widest hover:bg-slate-50 shadow-sm">+ Add New</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {profile.addresses?.map(addr => (
                                        <div key={addr.address_id} className="p-6 bg-[#FDFCFB] rounded-[2rem] border-2 border-slate-200 relative group transition-all hover:border-[#000000] shadow-sm">
                                            <div className="absolute top-5 right-5 flex gap-1">
                                                <button onClick={() => { setEditingAddress(addr); setActiveModal('address'); }} className="p-2 text-slate-400 hover:text-black"><Edit2 size={18} /></button>
                                                <button onClick={() => handleDeleteAddress(addr.address_id)} className="p-2 text-red-200 hover:text-red-700"><Trash2 size={18} /></button>
                                            </div>
                                            <p className="font-medium text-[#000000] text-2xl uppercase italic mb-1 tracking-tight">{addr.recipient_name}</p>
                                            <p className="text-lg text-[#374151] italic leading-relaxed mb-4 font-medium">"{addr.address_detail}"</p>
                                            <div className="flex items-center gap-2 text-xs font-medium text-[#111827] uppercase tracking-widest"><Phone size={14} /> {addr.phone_number}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Wishlist Archive */}
                        <div id="fav-section" className="bg-white rounded-[3rem] p-8 border-2 border-slate-300 shadow-sm">
                            <h2 className="text-4xl font-medium uppercase tracking-tighter mb-8 italic text-[#000000]">Wishlist <span className="font-light not-italic text-[#374151]">Archive</span></h2>
                            {favorites.length > 0 ? (
                                <div className="space-y-3">
                                    {favorites.map((fav) => {
                                        const prod = fav.product || fav;
                                        return (
                                            <div key={fav.wishlist_id || prod.product_id} className="flex flex-col md:flex-row items-center gap-8 p-5 bg-[#FDFCFB] rounded-[2rem] border-2 border-slate-200 hover:border-[#000000] transition-all">
                                                <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-slate-100 bg-white p-1 shadow-sm">
                                                    <img src={prod.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover rounded-xl" alt="" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h4 className="font-medium text-2xl uppercase italic text-[#000000] tracking-tight">{prod.product_name}</h4>
                                                    <p className="text-base text-[#374151] italic font-medium">Premium Handcrafted Cookie</p>
                                                </div>
                                                <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                                                    <p className="text-3xl font-medium italic text-[#000000]">฿{prod.unit_price?.toLocaleString()}</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleRemoveFavorite(prod.product_id)} className="p-3.5 text-red-700 bg-white border-2 border-red-50 rounded-xl hover:bg-red-50 transition-all"><Trash2 size={18} /></button>
                                                        <button onClick={() => navigate(`/products`)} className="px-6 py-3 bg-white border-2 border-slate-300 text-black rounded-xl font-medium text-sm uppercase italic hover:bg-slate-50 shadow-sm flex items-center gap-2 active:scale-95"><ShoppingBag size={16} /> Buy Now</button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-24 text-center bg-[#FDFCFB] rounded-[2.5rem] border-2 border-dashed border-slate-300">
                                    <ShoppingBag size={64} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-slate-400 uppercase font-medium tracking-widest text-lg italic">Wishlist is empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer userData={userData} />

            {/* Modal Components */}
            {activeModal === 'profile' && (
                <Modal title="Personal Info" onClose={closeModal}>
                    <ProfileEditForm initialData={{ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone || '' }} onSubmit={handleUpdateProfile} isSubmitting={isSubmitting} />
                </Modal>
            )}
            {activeModal === 'address' && (
                <Modal title={editingAddress ? "Location Registry" : "New Address"} onClose={closeModal}>
                    <AddressFormSub initialData={editingAddress} onSubmit={handleSaveAddress} isSubmitting={isSubmitting} isEdit={!!editingAddress} />
                </Modal>
            )}
            {activeModal === 'password' && (
                <Modal title="Security Access" onClose={closeModal}>
                    <ChangePasswordForm onSubmit={handleChangePassword} isSubmitting={isSubmitting} />
                </Modal>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
            `}} />
        </div>
    );
};

const InfoItem = ({ label, value, icon }) => (
    <div className="space-y-2 text-left border-b-2 border-slate-100 pb-4 group">
        <label className="text-sm font-medium text-[#374151] uppercase tracking-[0.3em] flex items-center gap-3 leading-none italic">{icon} {label}</label>
        <p className="text-2xl font-medium tracking-tight uppercase text-[#000000] italic leading-none">{value || '—'}</p>
    </div>
);

export default memo(Profile);