import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Users, ShieldCheck, UserCheck, Search, Trash2, Edit, Loader2, X,
    Menu, ShieldAlert, CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState({ total: 0, systemAdmins: 0, owners: 0, managers: 0, customers: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 
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

    const getRoleStyle = (roleId) => {
        const styles = {
            1: { text: '#000000', label: 'ADMIN', icon: <ShieldAlert size={18} /> },
            2: { text: '#000000', label: 'OWNER', icon: <ShieldCheck size={18} /> },
            3: { text: '#000000', label: 'MANAGER', icon: <UserCheck size={18} /> },
            4: { text: '#000000', label: 'CUSTOMER', icon: <Users size={18} /> }
        };
        return styles[roleId] || { text: '#000000', label: 'UNKNOWN', icon: <Users size={18} /> };
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
            showCancelButton: true, confirmButtonColor: '#000000', confirmButtonText: 'ลบข้อมูล',
            customClass: { popup: 'rounded-[2.5rem] font-["Kanit"]' }
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

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter]);

    if (loading && users.length === 0) return <div className="h-screen flex items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-slate-800" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] overflow-x-hidden relative max-w-full">
            <Toaster position="top-right" containerStyle={{ zIndex: 9999 }} />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="users" />

            {/* 🚀 ปรับ Margin Left ตามความกว้าง 280px และลด Padding ขวา */}
            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[280px]'} p-4 md:p-5 lg:p-6 lg:pr-4 w-full relative z-10`}>
                <div className="mb-4 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-xl text-[#111827] border border-slate-300"><Menu size={24} /></button>
                    <Header title="จัดการผู้ใช้งาน" isCollapsed={isCollapsed} />
                </div>

                {/* 🚀 pt-24 หลบ Header ทึบ */}
                <div className="pt-24"> 
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6 px-2">
                        <StatCardSmall title="ทั้งหมด" value={summary.total} />
                        <StatCardSmall title="แอดมิน" value={summary.systemAdmins} />
                        <StatCardSmall title="เจ้าของ" value={summary.owners} />
                        <StatCardSmall title="ผู้จัดการ" value={summary.managers} />
                        <StatCardSmall title="ลูกค้า" value={summary.customers} />
                    </div>

                    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm overflow-hidden">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex gap-2 p-1 bg-slate-50 rounded-full border border-slate-200">
                                    <button onClick={() => setRoleFilter('all')} 
                                        className={`px-4 py-1.5 rounded-full text-base font-medium uppercase transition-all ${roleFilter === 'all' ? 'bg-white border border-[#111827] text-[#111827] shadow-sm' : 'text-[#374151] hover:bg-white'}`}>
                                        ทั้งหมด
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <select className="bg-white border border-slate-300 px-6 py-1.5 rounded-full font-medium text-lg text-[#111827] outline-none shadow-sm italic" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                        <option value="all">กรองระดับสิทธิ์...</option>
                                        <option value="1">ADMIN</option><option value="2">OWNER</option><option value="3">MANAGER</option><option value="4">CUSTOMER</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="relative w-full lg:max-w-md">
                                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#374151]" />
                                <input className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-50 border border-slate-200 outline-none text-xl font-medium text-[#111827] focus:bg-white shadow-inner" placeholder="ค้นหาชื่อหรืออีเมล..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[#000000] bg-slate-50 uppercase text-xl font-medium tracking-widest border-b border-slate-300">
                                        <th className="px-6 py-4">ข้อมูลผู้ใช้งาน</th>
                                        <th className="px-6 py-4">อีเมล</th>
                                        <th className="px-6 py-4 text-center">ระดับสิทธิ์</th>
                                        <th className="px-6 py-4 text-right">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {currentUsers.map(user => {
                                        const role = getRoleStyle(user.role_id);
                                        return (
                                            <tr key={user.user_id} className="hover:bg-slate-50/50 transition-colors">
                                                {/* 📉 py-4 เพื่อความกระชับ */}
                                                <td className="py-4 px-6 text-left">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-slate-100 border border-slate-300 text-[#000000] rounded-xl flex items-center justify-center font-medium text-lg uppercase shadow-sm">{user.first_name?.charAt(0)}</div>
                                                        <span className="text-2xl font-medium text-[#000000] uppercase truncate max-w-[250px] italic leading-tight">{user.first_name} {user.last_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-xl font-medium text-[#111827]">{user.email}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-slate-300 text-base font-medium uppercase tracking-widest whitespace-nowrap text-[#000000]">
                                                        {role.icon} {role.label}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {/* 📉 ปุ่มแก้ไขขอบบาง 1px */}
                                                        <button onClick={() => { setSelectedUser(user); setNewRole(user.role_id.toString()); setIsModalOpen(true); }} className="p-3 bg-white border border-slate-300 rounded-xl text-[#374151] hover:text-[#000000] shadow-sm"><Edit size={24} /></button>
                                                        {canDelete && <button onClick={() => handleDelete(user.user_id, user.first_name)} className="p-3 bg-white border border-slate-200 rounded-xl text-rose-300 hover:text-rose-600 shadow-sm"><Trash2 size={24} /></button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-6">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`p-3 rounded-xl border border-slate-300 text-[#111827] ${currentPage === 1 ? 'opacity-30' : ''}`}><ChevronLeft size={28} /></button>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-medium text-[#374151] uppercase">Page</span>
                                    <div className="bg-white border border-[#111827] text-[#111827] px-6 py-1 rounded-lg text-3xl font-medium italic shadow-sm">{currentPage}</div>
                                    <span className="text-xl font-medium text-[#374151]">/ {totalPages}</span>
                                </div>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`p-3 rounded-xl border border-slate-300 text-[#111827] ${currentPage === totalPages ? 'opacity-30' : ''}`}><ChevronRight size={28} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- Edit Role Modal (🚀 Compact & Thin Border) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 border border-slate-300 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8 text-left">
                            <h2 className="text-2xl font-medium uppercase italic text-[#000000]">Edit Access Hub</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-[#111827] border border-slate-300 rounded-full"><X size={24} /></button>
                        </div>
                        <div className="space-y-3">
                            {[
                                { id: 1, label: 'ADMIN', desc: 'Full System Control' },
                                { id: 2, label: 'Owner', desc: 'Shop Analytics Access' },
                                { id: 3, label: 'Manager', desc: 'Inventory & Orders' },
                                { id: 4, label: 'Customer', desc: 'Standard User Access' }
                            ].map(role => (
                                <button key={role.id} onClick={() => setNewRole(role.id.toString())} 
                                    className={`w-full p-5 rounded-xl text-left border flex justify-between items-center transition-all ${newRole === role.id.toString() ? 'border-[#000000] bg-slate-50 shadow-sm' : 'border-slate-100 bg-white'}`}>
                                    <div>
                                        <p className="font-medium text-xl uppercase italic text-[#000000]">Level {role.id}: {role.label}</p>
                                        <p className="text-base text-[#374151]">{role.desc}</p>
                                    </div>
                                    {newRole === role.id.toString() && <CheckCircle size={20} className="text-[#000000]" />}
                                </button>
                            ))}
                            <button onClick={handleUpdateRole} disabled={isUpdating} 
                                className="w-full mt-4 py-5 bg-white border border-[#000000] text-[#000000] rounded-full font-medium text-xl uppercase tracking-widest shadow-md active:scale-95 italic">
                                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 💎 StatCard: ปรับระยะ p-6 และขอบบาง 1px
const StatCardSmall = ({ title, value }) => (
    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm flex flex-col gap-1 text-left">
        <p className="text-xl font-medium text-[#374151] uppercase tracking-widest italic leading-none">{title}</p>
        <h2 className="text-5xl font-medium italic tracking-tighter text-[#000000] leading-none mt-2 truncate">{value || 0}</h2>
    </div>
);

export default UserManagement;