import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Users, ShieldCheck, UserCheck, Search, Trash2, Edit, Loader2, X, Save,
    Filter, RefreshCw, Menu, ShieldAlert, CheckCircle, Sparkles, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const UserManagement = () => {
    // --- 🏗️ States & Logic (คงเดิม 100%) ---
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState({ total: 0, systemAdmins: 0, owners: 0, managers: 0, customers: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const token = localStorage.getItem('token');
    const decodedToken = useMemo(() => {
        try { return token ? jwtDecode(token) : {}; } catch (err) { return {}; }
    }, [token]);
    const currentUserId = decodedToken.id || decodedToken.user_id;
    const canDelete = Number(decodedToken.role_level) === 1;

    // --- 🎨 Role UI Mapping (สีเข้มพิเศษ) ---
    const getRoleStyle = (roleId) => {
        const styles = {
            1: { text: '#E53E3E', label: 'ADMIN', icon: <ShieldAlert size={14} strokeWidth={3} /> },
            2: { text: '#2D241E', label: 'OWNER', icon: <ShieldCheck size={14} strokeWidth={3} /> },
            3: { text: '#05CD99', label: 'MANAGER', icon: <UserCheck size={14} strokeWidth={3} /> },
            4: { text: '#8B7E66', label: 'CUSTOMER', icon: <Users size={14} strokeWidth={3} /> }
        };
        return styles[roleId] || { text: '#2D241E', label: 'UNKNOWN', icon: <Users size={14} strokeWidth={3} /> };
    };

    const calculateSummary = useCallback((userList) => ({
        total: userList.length,
        systemAdmins: userList.filter(u => u.role_id === 1).length,
        owners: userList.filter(u => u.role_id === 2).length,
        managers: userList.filter(u => u.role_id === 3).length,
        customers: userList.filter(u => u.role_id === 4).length
    }), []);

    const fetchUsers = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.USERS);
            if (res.success) {
                setUsers(res.data);
                setSummary(calculateSummary(res.data));
            }
        } catch (err) { toast.error("ดึงข้อมูลไม่สำเร็จ"); } finally { setLoading(false); }
    }, [calculateSummary]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleUpdateRole = async () => {
        if (!selectedUser || selectedUser.user_id === currentUserId) return toast.error("แก้ไขสิทธิ์ตนเองไม่ได้");
        setIsUpdating(true);
        const load = toast.loading("กำลังอัปเดต...");
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.USERS}/${selectedUser.user_id}/role`, { role_id: parseInt(newRole) });
            if (res.success) {
                toast.success(`เปลี่ยนสิทธิ์เรียบร้อยแล้ว`, { id: load });
                fetchUsers(true);
                setIsModalOpen(false);
            }
        } catch (err) { toast.error("ล้มเหลว", { id: load }); } finally { setIsUpdating(false); }
    };

    const handleDelete = async (userId, name) => {
        if (userId === currentUserId) return toast.error("ลบบัญชีที่ใช้งานอยู่ไม่ได้");
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?', text: `ข้อมูลของคุณ ${name} จะหายไปถาวร`, icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#2D241E', confirmButtonText: 'ลบข้อมูล',
            customClass: { popup: 'rounded-[2rem] font-["Kanit"] border-4 border-[#2D241E]' }
        });
        if (result.isConfirmed) {
            try {
                const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`);
                if (res.success) { toast.success("ลบเรียบร้อยแล้ว"); fetchUsers(true); }
            } catch (err) { toast.error("ไม่สามารถลบได้"); }
        }
    };

    const filteredUsers = useMemo(() => users.filter(user =>
        (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (roleFilter === 'all' || user.role_id === parseInt(roleFilter))
    ), [users, searchTerm, roleFilter]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter]);

    if (loading && users.length === 0) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative max-w-[1920px] mx-auto shadow-2xl">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="users" />

            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[280px]'} p-4 md:p-8 lg:p-10 w-full relative z-10`}>
                <div className="mb-6 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-xl text-[#2D241E] shadow-sm border-2 border-[#2D241E] active:scale-90 transition-all"><Menu size={24} /></button>
                    <Header title="จัดการผู้ใช้งาน" />
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 px-2 text-left">
                    <div className="flex-1 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2D241E] rounded-full shadow-md animate-bounce-slow">
                            <Sparkles size={14} className="text-white" />
                            <span className="text-xs font-black uppercase tracking-widest text-white">Identity Access</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl 2xl:text-7xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">Users</h1>
                    </div>
                    <button onClick={() => fetchUsers()} className="p-4 rounded-2xl bg-white border-2 border-[#2D241E] shadow-lg hover:rotate-180 transition-all active:scale-90 group shrink-0">
                        <RefreshCw size={24} className="text-[#2D241E]" strokeWidth={3} />
                    </button>
                </div>

                {/* 📊 Stat Cards (เข้มชัด) */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10 px-2">
                    <StatCardSmall title="ทั้งหมด" value={summary.total} icon={<Users />} color="#2D241E" />
                    <StatCardSmall title="แอดมิน" value={summary.systemAdmins} icon={<ShieldAlert />} color="#E53E3E" />
                    <StatCardSmall title="เจ้าของ" value={summary.owners} icon={<ShieldCheck />} color="#2D241E" />
                    <StatCardSmall title="ผู้จัดการ" value={summary.managers} icon={<UserCheck />} color="#05CD99" />
                    <StatCardSmall title="ลูกค้า" value={summary.customers} icon={<Users />} color="#8B7E66" />
                </div>

                {/* Table Section (เข้มจัด High Contrast) */}
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
                        <div className="relative w-full lg:max-w-md">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2D241E]" strokeWidth={3} />
                            <input className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-50 border-2 border-slate-100 outline-none font-black text-sm text-[#2D241E] focus:border-[#2D241E] transition-all shadow-inner" placeholder="ค้นหาชื่อหรืออีเมล..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex gap-4">
                            <select className="px-6 py-3 rounded-full bg-slate-50 border-2 border-slate-100 font-black text-xs uppercase tracking-widest outline-none text-[#2D241E] focus:border-[#2D241E]" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                <option value="all">ทุกระดับสิทธิ์</option>
                                <option value="1">ADMIN</option><option value="2">OWNER</option><option value="3">MANAGER</option><option value="4">CUSTOMER</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[#2D241E] uppercase text-xs font-black tracking-widest px-6">
                                    <th className="px-6 pb-2">ข้อมูลผู้ใช้งาน</th>
                                    <th className="px-6 pb-2">อีเมล</th>
                                    <th className="px-6 pb-2 text-center">ระดับสิทธิ์</th>
                                    <th className="px-6 pb-2 text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map(user => {
                                    const role = getRoleStyle(user.role_id);
                                    return (
                                        <tr key={user.user_id} className="group hover:translate-x-1 transition-all">
                                            <td className="py-4 px-6 rounded-l-2xl bg-white border-y border-l border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-[#2D241E] text-white rounded-xl flex items-center justify-center font-black text-sm uppercase shadow-md">{user.first_name?.charAt(0)}</div>
                                                    <span className="font-black text-sm uppercase truncate max-w-[200px] text-[#2D241E]">{user.first_name} {user.last_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 bg-white border-y border-slate-100 text-sm font-black text-[#2D241E]">{user.email}</td>
                                            <td className="py-4 px-6 bg-white border-y border-slate-100 text-center">
                                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border-2 border-[#2D241E] text-[10px] font-black uppercase tracking-widest shadow-sm" style={{ color: role.text }}>
                                                    {role.icon} {role.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 rounded-r-2xl bg-white border-y border-r border-slate-100 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => { setSelectedUser(user); setNewRole(user.role_id.toString()); setIsModalOpen(true); }} className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-[#2D241E] hover:text-white transition-all shadow-sm text-[#2D241E]"><Edit size={16} strokeWidth={3} /></button>
                                                    {canDelete && <button onClick={() => handleDelete(user.user_id, user.first_name)} className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm text-[#2D241E]"><Trash2 size={16} strokeWidth={3} /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center gap-4">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border-2 border-[#2D241E] rounded-xl text-[#2D241E] disabled:opacity-30 active:scale-90 transition-all shadow-md"><ChevronLeft size={20} strokeWidth={3} /></button>
                            <span className="text-xs font-black text-[#2D241E] italic">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border-2 border-[#2D241E] rounded-xl text-[#2D241E] disabled:opacity-30 active:scale-90 transition-all shadow-md"><ChevronRight size={20} strokeWidth={3} /></button>
                        </div>
                    )}
                </div>
            </main>

            {/* 🛡️ Modal ปรับปรุงสิทธิ์ (เข้มจัด) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#2D241E]/30 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-8 border-4 border-[#2D241E] flex flex-col animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase italic text-[#2D241E]">Edit Access</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-[#2D241E] rounded-full hover:text-red-500 transition-all border-2 border-[#2D241E]"><X size={20} strokeWidth={3} /></button>
                        </div>
                        <div className="space-y-3">
                            {[
                                { id: 1, label: 'ADMIN', desc: 'ควบคุมระบบสูงสุด' },
                                { id: 2, label: 'Owner', desc: 'ตรวจสอบวิเคราะห์ร้านค้า' },
                                { id: 3, label: 'Manager', desc: 'จัดการสินค้าและออเดอร์' },
                                { id: 4, label: 'Customer', desc: 'สิทธิ์ผู้ใช้งานทั่วไป' }
                            ].map(role => (
                                <button key={role.id} onClick={() => setNewRole(role.id.toString())} className={`w-full p-4 rounded-2xl text-left border-2 flex justify-between items-center transition-all ${newRole === role.id.toString() ? 'border-[#2D241E] bg-slate-100 shadow-md scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                                    <div>
                                        <p className="font-black text-sm uppercase italic text-[#2D241E]">Level {role.id}: {role.label}</p>
                                        <p className="text-[10px] font-bold text-[#2D241E]">{role.desc}</p>
                                    </div>
                                    {newRole === role.id.toString() && <CheckCircle size={18} className="text-[#2D241E]" strokeWidth={3} />}
                                </button>
                            ))}
                            <button onClick={handleUpdateRole} disabled={isUpdating} className="w-full mt-4 py-4 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl">
                                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 💎 StatCard: เข้มจัด High Contrast
const StatCardSmall = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-2xl border-2 border-[#2D241E] shadow-lg flex items-center justify-between hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
        <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest mb-1 leading-none">{title}</p>
            <h2 className="text-[#2D241E] text-2xl font-black italic leading-none">{value || 0}</h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#2D241E] border-2 border-[#2D241E] shadow-inner group-hover:bg-[#2D241E] group-hover:text-white transition-all duration-500">
            {React.cloneElement(icon, { size: 20, strokeWidth: 3 })}
        </div>
    </div>
);

export default UserManagement;