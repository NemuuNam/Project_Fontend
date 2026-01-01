import React, { useEffect, useState, useCallback } from 'react';
import {
    Package, Plus, Trash2, Edit3, Upload, X, Tag,
    ImageIcon, Check, AlertCircle, Coins, 
    Loader2, Search
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import imageCompression from 'browser-image-compression'; 
import { jwtDecode } from 'jwt-decode'; 
import Swal from 'sweetalert2'; 

// --- นำเข้าระบบ API ส่วนกลาง ---
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalType, setModalType] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ name: '', unitPrice: '', stock: '', category_id: '', image: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [newCatName, setNewCatName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // เช็คสิทธิ์ Admin
    const token = localStorage.getItem('token');
    let userLevel = 0;
    try {
        if (token) {
            const decoded = jwtDecode(token);
            userLevel = decoded.role_level || 0; 
        }
    } catch (err) {}
    const isAdminManager = [1, 2].includes(userLevel);

    // 1. ดึงข้อมูลสินค้าและหมวดหมู่
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                axiosInstance.get(API_ENDPOINTS.ADMIN.PRODUCTS),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.PRODUCTS}/categories`)
            ]);
            if (prodRes.success) setProducts(prodRes.data || []);
            if (catRes.success) setCategories(catRes.data || []);
        } catch (err) {
            toast.error("ดึงข้อมูลไม่สำเร็จ!");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // 2. จัดการรูปภาพ (Compression)
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            const finalFile = new File([compressedFile], file.name, { type: file.type });
            setFormData(prev => ({ ...prev, image: finalFile }));
            setImagePreview(URL.createObjectURL(finalFile)); 
        } catch (error) {
            toast.error('ประมวลผลรูปล้มเหลว');
        }
    };

    // 3. บันทึกข้อมูลสินค้า (Add / Edit)
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('product_name', formData.name);
        data.append('unit_price', formData.unitPrice);
        data.append('stock_quantity', formData.stock);
        data.append('category_id', formData.category_id);
        if (formData.image) data.append('image', formData.image);

        setIsUploading(true);
        const loadToast = toast.loading(isEditing ? "กำลังอัปเดตข้อมูล..." : "กำลังเพิ่มสินค้า...");
        try {
            const url = isEditing ? `${API_ENDPOINTS.ADMIN.PRODUCTS}/${currentId}` : API_ENDPOINTS.ADMIN.PRODUCTS;
            const res = await axiosInstance({
                method: isEditing ? 'PATCH' : 'POST',
                url: url,
                data: data,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.success) {
                toast.success('บันทึกข้อมูลเรียบร้อย', { id: loadToast });
                setModalType(null);
                fetchData();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'บันทึกล้มเหลว!', { id: loadToast });
        } finally {
            setIsUploading(false);
        }
    };

    // 4. ลบสินค้า
    const handleDeleteProduct = async (id) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบสินค้า?',
            text: "ข้อมูลสินค้าและรูปภาพจะถูกลบออกจากระบบถาวร",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ยืนยันการลบ',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`);
                if (res.success) {
                    toast.success('ลบสินค้าสำเร็จ');
                    fetchData();
                }
            } catch (err) {
                toast.error('ลบไม่สำเร็จ!');
            }
        }
    };

    // 5. จัดการหมวดหมู่
    const handleAddCategory = async () => {
        if (!newCatName.trim()) return toast.error("กรุณาระบุชื่อหมวดหมู่");
        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.PRODUCTS}/categories`, { category_name: newCatName });
            if (res.success) {
                toast.success("เพิ่มหมวดหมู่สำเร็จ");
                setNewCatName('');
                fetchData();
            }
        } catch (err) { toast.error("เพิ่มล้มเหลว"); }
    };

    const handleDeleteCategory = async (id) => {
        try {
            const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.PRODUCTS}/categories/${id}`);
            if (res.success) {
                toast.success("ลบหมวดหมู่สำเร็จ");
                fetchData();
            }
        } catch (err) { toast.error("ไม่สามารถลบได้ (อาจมีสินค้าอยู่ในกลุ่มนี้)"); }
    };

    // กรองข้อมูลสินค้า
    const filteredProducts = products.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: products.length,
        low: products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length,
        out: products.filter(p => p.stock_quantity <= 0).length,
        val: products.reduce((acc, p) => acc + (p.unit_price * p.stock_quantity), 0)
    };

    if (loading && products.length === 0) return (
        <div className="h-screen flex items-center justify-center bg-[#f4f7fe]">
            <Loader2 className="animate-spin text-[#4318ff]" size={45} />
        </div>
    );

    return (
        <div className="inventory-layout">
            <Toaster position="top-right" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                .inventory-layout { display: flex; min-height: 100vh; background: #f4f7fe; font-family: 'Kanit', sans-serif; color: #1b2559; }
                .main-content { flex: 1; margin-left: ${isCollapsed ? '80px' : '260px'}; padding: 30px; transition: all 0.3s ease; width: 100%; box-sizing: border-box; }
                @media (max-width: 1024px) { .main-content { margin-left: 0 !important; padding: 20px; } }
                .inventory-section { background: white; border-radius: 35px; padding: 35px; box-shadow: 0 10px 40px rgba(0,0,0,0.02); }
                .input-field-premium { width: 100%; padding: 16px 20px; border-radius: 18px; border: 1.5px solid #eef2f6; outline: none; background: #fcfdfe; transition: 0.2s; font-family: 'Kanit'; box-sizing: border-box; font-size: 15px; }
                .input-field-premium:focus { border-color: #4318ff; box-shadow: 0 10px 20px rgba(67, 24, 255, 0.05); }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 2000; padding: 20px; }
                .modal-box { background: white; width: 100%; max-width: 800px; border-radius: 40px; padding: 45px; position: relative; max-height: 95vh; overflow-y: auto; }
            `}</style>

            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} activePage="products" />

            <main className="main-content">
                <Header title="จัดการสินค้าในคลัง" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 mt-5">
                    <StatBox title="สินค้าทั้งหมด" value={stats.total} icon={<Package size={22} />} color="#4318ff" />
                    <StatBox title="ใกล้หมด" value={stats.low} icon={<AlertCircle size={22} />} color="#ffb547" />
                    <StatBox title="หมดสต็อก" value={stats.out} icon={<X size={22} />} color="#ef4444" />
                    <StatBox title="มูลค่าสต็อก" value={`฿${stats.val.toLocaleString()}`} icon={<Coins size={22} />} color="#05cd99" />
                </div>

                <section className="inventory-section">
                    <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#a3aed0' }} />
                            <input className="input-field-premium" style={{ paddingLeft: '55px' }} placeholder="ค้นหาชื่อสินค้า หรือหมวดหมู่..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setModalType('category')} className="px-6 py-4 bg-slate-50 text-[#4318ff] rounded-2xl font-bold flex items-center gap-2 border-none cursor-pointer hover:bg-slate-100 transition-all"><Tag size={18}/> หมวดหมู่</button>
                            <button onClick={() => { setIsEditing(false); setModalType('product'); setFormData({ name: '', unitPrice: '', stock: '', category_id: '', image: null }); setImagePreview(null); }} className="px-6 py-4 bg-[#4318ff] text-white rounded-2xl font-bold flex items-center gap-2 border-none cursor-pointer hover:shadow-lg transition-all"><Plus size={18}/> เพิ่มสินค้า</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] border-collapse">
                            <thead>
                                <tr className="text-left text-[#a3aed0] text-xs uppercase tracking-widest border-b border-slate-100">
                                    <th className="pb-4 pl-4">รูปสินค้า</th>
                                    <th className="pb-4">ชื่อสินค้า</th>
                                    <th className="pb-4">ราคา</th>
                                    <th className="pb-4">คลัง</th>
                                    <th className="pb-4">สถานะ</th>
                                    <th className="pb-4 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(p => (
                                    <tr key={p.product_id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-5 pl-4">
                                            {p.images?.[0]?.image_url ? 
                                                <img src={p.images[0].image_url} alt="" style={{ width: '55px', height: '55px', borderRadius: '15px', objectFit: 'cover' }} /> 
                                                : <div style={{ width: '55px', height: '55px', borderRadius: '15px', background: '#f4f7fe' }} className="flex items-center justify-center"><ImageIcon color="#a3aed0" /></div>
                                            }
                                        </td>
                                        <td>
                                            <p className="font-bold text-[#1b2559] m-0">{p.product_name}</p>
                                            <p className="text-[11px] text-slate-400 m-0 uppercase">{p.category?.category_name}</p>
                                        </td>
                                        <td className="font-bold">฿{p.unit_price.toLocaleString()}</td>
                                        <td className="font-bold text-slate-500">{p.stock_quantity}</td>
                                        <td><span className={`px-3 py-1 rounded-full text-[10px] font-black ${p.stock_quantity > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>{p.stock_quantity > 0 ? '● พร้อมขาย' : '● หมดสต็อก'}</span></td>
                                        <td className="text-center">
                                            <button onClick={() => { setIsEditing(true); setCurrentId(p.product_id); setFormData({ name: p.product_name, unitPrice: p.unit_price, stock: p.stock_quantity, category_id: p.category_id }); setImagePreview(p.images?.[0]?.image_url); setModalType('product'); }} className="p-2 text-blue-500 bg-blue-50 rounded-lg mr-2 border-none cursor-pointer hover:bg-blue-100"><Edit3 size={16}/></button>
                                            {isAdminManager && <button onClick={() => handleDeleteProduct(p.product_id)} className="p-2 text-red-400 bg-red-50 rounded-lg border-none cursor-pointer hover:bg-red-100"><Trash2 size={16}/></button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* MODAL: สินค้า */}
                {modalType === 'product' && (
                    <div className="modal-overlay" onClick={() => setModalType(null)}>
                        <div className="modal-box" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setModalType(null)} className="absolute top-8 right-8 text-slate-400 bg-transparent border-none cursor-pointer hover:text-red-500 transition-all"><X size={24}/></button>
                            <h2 className="text-2xl font-bold mb-10 text-[#1b2559]">{isEditing ? '📝 แก้ไขข้อมูลสินค้า' : '📦 เพิ่มสินค้าใหม่'}</h2>
                            <form onSubmit={handleProductSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="flex flex-col gap-5">
                                        <div className="input-group">
                                            <label className="input-label">ชื่อสินค้า</label>
                                            <input className="input-field-premium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="ระบุชื่อสินค้า..." />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">หมวดหมู่</label>
                                            <select className="input-field-premium" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                                                <option value="">เลือกกลุ่มสินค้า</option>
                                                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="input-group">
                                                <label className="input-label">ราคา (฿)</label>
                                                <input type="number" className="input-field-premium" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} required />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">สต็อก (ชิ้น)</label>
                                                <input type="number" className="input-field-premium" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center bg-slate-50/50 rounded-[30px] p-8 border border-dashed border-slate-200">
                                        <div style={{ width: '200px', height: '200px', borderRadius: '25px', overflow: 'hidden', marginBottom: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                                            {imagePreview ? <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <ImageIcon size={50} color="#cbd5e1" />}
                                        </div>
                                        <label className="px-6 py-3 bg-white text-[#4318ff] border border-[#4318ff] rounded-xl font-bold cursor-pointer text-sm flex items-center gap-2 hover:bg-[#4318ff] hover:text-white transition-all shadow-sm"><Upload size={16}/> เลือกรูปสินค้า<input type="file" className="hidden" accept="image/*" onChange={handleImageChange} /></label>
                                        <p className="text-[11px] text-slate-400 mt-4 text-center">แนะนำรูปทรงจัตุรัส ขนาดไม่เกิน 5MB</p>
                                    </div>
                                </div>
                                <button type="submit" disabled={isUploading} className="w-full mt-10 py-5 bg-[#4318ff] text-white rounded-[22px] font-bold text-lg border-none cursor-pointer shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                                    {isUploading ? <Loader2 className="animate-spin" /> : <><Check size={22}/> {isEditing ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มสินค้า'}</>}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: หมวดหมู่ */}
                {modalType === 'category' && (
                    <div className="modal-overlay" onClick={() => setModalType(null)}>
                        <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setModalType(null)} className="absolute top-6 right-6 text-slate-400 bg-transparent border-none cursor-pointer"><X size={20}/></button>
                            <h2 className="text-xl font-bold mb-6 text-[#1b2559]">🏷️ จัดการหมวดหมู่สินค้า</h2>
                            <div className="flex gap-2 mb-8">
                                <input className="input-field-premium" placeholder="ชื่อหมวดหมู่ใหม่..." value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                                <button onClick={handleAddCategory} className="px-5 bg-[#4318ff] text-white rounded-xl font-bold border-none cursor-pointer hover:bg-blue-700">เพิ่ม</button>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {categories.map(c => (
                                    <div key={c.category_id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="font-bold text-sm">{c.category_name}</span>
                                        <Trash2 size={16} className="text-red-400 cursor-pointer hover:text-red-600" onClick={() => handleDeleteCategory(c.category_id)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const StatBox = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-[30px] flex justify-between items-center border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
        <div className="min-w-0">
            <p className="text-[#a3aed0] text-[10px] sm:text-xs mb-1 font-bold uppercase truncate">{title}</p>
            <h2 className="text-lg sm:text-2xl font-black text-[#1b2559] truncate">{typeof value === 'number' ? value.toLocaleString() : value}</h2>
        </div>
        <div style={{ background: `${color}10`, color: color }} className="p-3 sm:p-4 rounded-2xl flex-shrink-0">{icon}</div>
    </div>
);

export default ProductManagement;