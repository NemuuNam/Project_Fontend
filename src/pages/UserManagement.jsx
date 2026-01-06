import React, { useEffect, useState, useCallback } from 'react';
import { 
    Users, ShieldCheck, UserCog, UserCheck, Search, 
    Trash2, Edit, Loader2, X, Save, Filter, RefreshCw, Menu
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2'; 
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState({ total: 0, owners: 0, admins: 0, managers: 0, customers: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const calculateSummary = useCallback((userList) => {
        return {
            total: userList.length,
            owners: userList.filter(u => u.role_id === 1).length,
            admins: userList.filter(u => u.role_id === 2).length,
            managers: userList.filter(u => u.role_id === 3).length,
            customers: userList.filter(u => u.role_id === 4).length
        };
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.USERS);
            if (res.success) {
                setUsers(res.data);
                setSummary(calculateSummary(res.data));
            }
        } catch (err) { 
            toast.error("ดึงข้อมูลผู้ใช้ไม่สำเร็จ"); 
        } finally { 
            setLoading(false); 
        }
    }, [calculateSummary]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleUpdateRole = async () => {
        if (!selectedUser) return;
        setIsUpdating(true);
        const loadingToast = toast.loading("กำลังอัปเดตสิทธิ์...");
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.USERS}/${selectedUser.user_id}/role`, { 
                role_id: parseInt(newRole) 
            });
            
            if (res.success) {
                toast.success(`เปลี่ยนสิทธิ์เรียบร้อย`, { id: loadingToast });
                fetchUsers();
                setIsModalOpen(false);
            }
        } catch (err) { 
            toast.error("อัปเดตล้มเหลว", { id: loadingToast }); 
        } finally { 
            setIsUpdating(false); 
        }
    };

    const handleDelete = async (userId, name) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบผู้ใช้?',
            text: `คุณกำลังจะลบคุณ ${name} ออกจากระบบ`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e293b',
            confirmButtonText: 'ลบข้อมูล',
            cancelButtonText: 'ยกเลิก',
            borderRadius: '25px'
        });

        if (result.isConfirmed) {
            try {
                const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`);
                if (res.success) {
                    toast.success("ลบผู้ใช้เรียบร้อยแล้ว");
                    fetchUsers();
                }
            } catch (err) { 
                toast.error("ไม่สามารถลบผู้ใช้ได้"); 
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'all' || user.role_id === parseInt(roleFilter);
        return matchesSearch && matchesRole;
    });

    const getRoleStyle = (roleId) => {
        const styles = {
            1: { bg: '#fff1f2', text: '#ef4444', label: 'Owner' },
            2: { bg: '#fff9eb', text: '#f59e0b', label: 'Admin' },
            3: { bg: '#f0fdf4', text: '#10b981', label: 'Manager' },
            4: { bg: '#f4f7fe', text: '#4318ff', label: 'Customer' }
        };
        return styles[roleId] || { bg: '#f8fafc', text: '#64748b', label: 'Unknown' };
    };

    if (loading && users.length === 0) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <Loader2 className="animate-spin text-slate-900" size={65} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-slate-900 overflow-x-hidden">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="users" />

            <main className={`flex-1 p-4 md:p-8 lg:p-10 transition-all duration-300 ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[300px]'} w-full`}>
                
                {/* Header with Mobile Menu */}
                <div className="mb-6 md:mb-10 flex items-center gap-4">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 bg-slate-100 rounded-xl text-slate-600"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex-1">
                        <Header title="User Management" />
                    </div>
                </div>

                {/* Welcome & Refresh Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
                    <div className="flex-1">
                        <p className="text-sm md:text-lg font-bold text-slate-400 mb-1 uppercase tracking-widest">ROLES AND PERMISSION</p>
                        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">Users</h1>
                    </div>
                    <button onClick={fetchUsers} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm hover:border-slate-900 transition-all text-slate-400">
                        <RefreshCw size={24} />
                    </button>
                </div>

                {/* KPI Stats Grid - Adjusted for Tablet/Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-12 text-center">
                    <StatCardPureWhite title="ทั้งหมด" value={summary.total} icon={<Users size={24} />} color="#4318ff" />
                    <StatCardPureWhite title="Owner" value={summary.owners} icon={<ShieldCheck size={24} />} color="#ef4444" />
                    <StatCardPureWhite title="Admin" value={summary.admins} icon={<UserCog size={24} />} color="#f59e0b" />
                    <StatCardPureWhite title="Manager" value={summary.managers} icon={<UserCheck size={24} />} color="#10b981" />
                    <StatCardPureWhite title="ลูกค้า" value={summary.customers} icon={<Users size={24} />} color="#64748b" />
                </div>

                {/* Main Content Card */}
                <div className="bg-white p-5 md:p-8 lg:p-10 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
                        <h3 className="text-xl md:text-3xl font-black text-slate-900">👥 รายชื่อผู้ใช้งาน</h3>
                        <div className="flex flex-col md:flex-row gap-4 w-full xl:max-w-3xl">
                            {/* Filter Dropdown */}
                            <div className="relative w-full md:w-48">
                                <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <select 
                                    className="w-full pl-12 pr-4 py-4 rounded-xl md:rounded-2xl bg-slate-50 border-none outline-none font-bold text-sm md:text-md appearance-none transition-all focus:ring-2 focus:ring-slate-100"
                                    value={roleFilter} 
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">ทุกระดับ</option>
                                    <option value="1">Owner</option>
                                    <option value="2">Admin</option>
                                    <option value="3">Manager</option>
                                    <option value="4">Customer</option>
                                </select>
                            </div>
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    className="w-full pl-14 pr-6 py-4 rounded-xl md:rounded-2xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all" 
                                    placeholder="ค้นหาชื่อ หรือ อีเมล..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto -mx-2 px-2">
                        <table className="w-full text-left border-separate border-spacing-y-3 min-w-[800px]">
                            <thead>
                                <tr className="text-slate-400 uppercase text-[10px] md:text-xs font-black tracking-widest text-center">
                                    <th className="px-4 pb-4 text-left">ชื่อ-นามสกุล</th>
                                    <th className="px-4 pb-4 text-left">ช่องทางติดต่อ</th>
                                    <th className="px-4 pb-4">ระดับ (Role)</th>
                                    <th className="px-4 pb-4">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => {
                                    const role = getRoleStyle(user.role_id);
                                    return (
                                        <tr key={user.user_id} className="group hover:bg-slate-50 transition-all text-center">
                                            <td className="px-4 py-4 md:py-6 rounded-l-2xl md:rounded-l-3xl border-y border-l border-slate-50 group-hover:border-slate-100 text-left font-black text-base md:text-xl text-slate-900 whitespace-nowrap">
                                                {user.first_name} {user.last_name}
                                            </td>
                                            <td className="px-4 py-4 md:py-6 border-y border-slate-50 group-hover:border-slate-100 text-left font-bold text-slate-500 text-sm md:text-lg whitespace-nowrap">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-4 md:py-6 border-y border-slate-50 group-hover:border-slate-100">
                                                <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border" style={{ background: role.bg, color: role.text, borderColor: `${role.text}20` }}>
                                                    {role.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 md:py-6 rounded-r-2xl md:rounded-r-3xl border-y border-r border-slate-50 group-hover:border-slate-100">
                                                <div className="flex justify-center gap-2">
                                                    <button className="p-2 md:p-3 bg-white text-slate-400 border border-slate-100 rounded-lg md:rounded-xl hover:text-blue-600 hover:border-blue-100 shadow-sm transition-all" onClick={() => { setSelectedUser(user); setNewRole(user.role_id.toString()); setIsModalOpen(true); }}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="p-2 md:p-3 bg-white text-slate-400 border border-slate-100 rounded-lg md:rounded-xl hover:text-rose-600 hover:border-rose-100 shadow-sm transition-all" onClick={() => handleDelete(user.user_id, user.first_name)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal - Responsive Adjustments */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white w-full max-w-lg rounded-[30px] md:rounded-[50px] shadow-2xl border border-slate-50 overflow-hidden animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                        <div className="p-6 md:p-10">
                            <div className="flex justify-between items-start mb-6 md:mb-8">
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight truncate">แก้ไขระดับสมาชิก</h3>
                                    <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] md:text-xs tracking-widest truncate">{selectedUser?.first_name} {selectedUser?.last_name}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 md:p-3 bg-slate-50 rounded-xl text-slate-400 transition-all hover:text-slate-900"><X size={20}/></button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 mb-3 block">เลือกบทบาทใหม่</label>
                                    <select 
                                        className="w-full p-4 md:p-5 rounded-xl md:rounded-[25px] bg-slate-50 border-none outline-none font-bold text-base md:text-lg text-slate-900 transition-all focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer" 
                                        value={newRole} 
                                        onChange={(e) => setNewRole(e.target.value)}
                                    >
                                        <option value="1">Owner (เจ้าของร้าน)</option>
                                        <option value="2">Admin (ผู้ดูแลระบบ)</option>
                                        <option value="3">Manager (ผู้จัดการร้าน)</option>
                                        <option value="4">Customer (ลูกค้าสมาชิก)</option>
                                    </select>
                                </div>

                                <button 
                                    onClick={handleUpdateRole} 
                                    disabled={isUpdating} 
                                    className="w-full py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl md:rounded-[30px] font-black text-base md:text-lg transition-all shadow-xl shadow-blue-100 flex justify-center items-center gap-3 mt-4"
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> บันทึกสิทธิ์ใหม่</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// StatCard Component - Adjusted Padding for Mobile
const StatCardPureWhite = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 md:p-8 rounded-[25px] md:rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all hover:-translate-y-1">
        <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 truncate">{title}</p>
            <h2 className="text-slate-900 text-2xl md:text-4xl font-black italic tracking-tighter leading-none truncate">{value || 0}</h2>
        </div>
        <div 
            style={{ background: `${color}08`, color: color }} 
            className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[22px] flex items-center justify-center border-2 md:border-4 border-white shadow-lg shadow-slate-50 shrink-0 ml-2"
        >
            {icon}
        </div>
    </div>
);

export default UserManagement;