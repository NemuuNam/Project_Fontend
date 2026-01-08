import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// --- นำเข้า Pages ---
import Home from './pages/customer/Home';
import CustomerProducts from './pages/customer/CustomerProducts';
import About from './pages/customer/About';
import Contact from './pages/customer/Contact';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Profile from './pages/customer/Profile';
import MyOrders from './pages/customer/MyOrders';
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// --- นำเข้า Admin Pages ---
import Dashboard from "./pages/Dashboard";
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import UserManagement from './pages/UserManagement';
import SystemLog from './pages/SystemLog';
import InventoryLog from './pages/InventoryLog';
import SalesReport from './pages/SalesReport';
import ShopSetting from './pages/ShopSetting';

// ✅ ปรับปรุง ProtectedRoute ให้เช็ค Level ตามตารางขอบเขตโครงการ
const ProtectedRoute = ({ children, allowedLevels }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    // หากมีการระบุ allowedLevels ให้ตรวจสอบว่า role_level ของ User ตรงกันหรือไม่
    if (allowedLevels && !allowedLevels.includes(Number(decoded.role_level))) {
      return <Navigate to="/" replace />; // หากไม่มีสิทธิ์ ให้กลับหน้าแรก
    }
    return children;
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

function App() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserData(decoded);
      } catch (error) {
        console.error("Invalid token");
        setUserData(null);
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* --- ส่วนของลูกค้า (Public & Protected) --- */}
        {/* กิจกรรม 1: เข้าชมหน้าเว็บไซต์ (ทุกคน) */}
        <Route path="/" element={<Home userData={userData} />} />
        <Route path="/products" element={<CustomerProducts userData={userData} />} />
        <Route path="/about" element={<About userData={userData} />} />
        <Route path="/contact" element={<Contact userData={userData} />} />

        {/* กิจกรรม 3: เพิ่ม/ลบสินค้าในตะกร้า (ยกเว้นเจ้าของร้าน ตามตาราง) */}
        <Route path="/cart" element={<Cart />} />

        {/* กิจกรรม 4: สั่งซื้อและดูประวัติ (Admin, Manager, Customer) */}
        <Route path="/my-orders" element={
          <ProtectedRoute allowedLevels={[1, 3, 4]}><MyOrders userData={userData} /></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute allowedLevels={[1, 3, 4]}><Checkout userData={userData} /></ProtectedRoute>
        } />

        {/* กิจกรรม 2: สมัครสมาชิกและเข้าสู่ระบบ */}
        <Route path="/profile" element={<ProtectedRoute><Profile userData={userData} /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />

        {/* --- ส่วนของ Admin & Staff (Protected) ตามระดับสิทธิ์ในตาราง --- */}

        {/* กิจกรรม 10: รายงานยอดขาย (Admin, Owner, Manager) */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedLevels={[1, 2, 3]}><Dashboard /></ProtectedRoute>
        } />

        {/* กิจกรรม 7: จัดการสินค้า (Admin, Manager) */}
        <Route path="/admin/products" element={
          <ProtectedRoute allowedLevels={[1, 3]}><ProductManagement /></ProtectedRoute>
        } />
        <Route path="/admin/shop-setting" element={
          <ProtectedRoute allowedLevels={[1, 3]}><ShopSetting /></ProtectedRoute>
        } />

        {/* กิจกรรม 5 & 6: ตรวจสอบและอัปเดตสถานะออเดอร์ (Admin, Manager) */}
        <Route path="/admin/orders" element={
          <ProtectedRoute allowedLevels={[1, 3]}><OrderManagement /></ProtectedRoute>
        } />

        {/* กิจกรรม 8: จัดการผู้ใช้งานและประวัติระบบ (Admin เท่านั้น) */}
        <Route path="/admin/users" element={
          <ProtectedRoute allowedLevels={[1]}><UserManagement /></ProtectedRoute>
        } />
        <Route path="/admin/system-log" element={
          <ProtectedRoute allowedLevels={[1]}><SystemLog /></ProtectedRoute>
        } />

        {/* กิจกรรม 9: รายงานอัปเดตสต็อก (Admin, Owner) */}
        <Route path="/admin/inv-log" element={
          <ProtectedRoute allowedLevels={[1, 2]}><InventoryLog /></ProtectedRoute>
        } />

        {/* กิจกรรม 10: ดูรายงานยอดขาย (Admin, Owner) */}
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedLevels={[1, 2]}><SalesReport /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;