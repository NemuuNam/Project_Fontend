import React, { useState, useEffect } from 'react'; // เพิ่ม useState, useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


// --- นำเข้า Pages ---
import Home from './pages/customer/Home';
import CustomerProducts from './pages/customer/CustomerProducts';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';


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

const ProtectedRoute = ({ children, allowedLevels }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (allowedLevels && !allowedLevels.includes(Number(decoded.role_level))) {
      return <Navigate to="/" replace />;
    }
    return children;
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

function App() {
  // สร้าง State สำหรับเก็บข้อมูลผู้ใช้ที่ Login อยู่
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // ถอดรหัส Token เพื่อเอา role_level และข้อมูลอื่นๆ
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
        {/* --- ส่วนของลูกค้า (Public) --- */}

        {/* ส่ง userData ไปให้หน้า Home เพื่อใช้เช็คสิทธิ์แสดงช่อง Input */}
        <Route path="/" element={<Home userData={userData} />} />

        <Route path="/products" element={<CustomerProducts />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout userData={userData} /></ProtectedRoute>} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />

        {/* --- ส่วนของ Admin & Staff (Protected) --- */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedLevels={[1, 2, 3]}><Dashboard /></ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute allowedLevels={[1, 2, 3]}><ProductManagement /></ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute allowedLevels={[1, 2, 3]}><OrderManagement /></ProtectedRoute>
        } />
        <Route path="/admin/shop-setting" element={
          <ProtectedRoute allowedLevels={[1, 2]}><ShopSetting /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedLevels={[1, 2]}><UserManagement /></ProtectedRoute>
        } />
        <Route path="/admin/system-log" element={
          <ProtectedRoute allowedLevels={[1, 2]}><SystemLog /></ProtectedRoute>
        } />
        <Route path="/admin/inv-log" element={
          <ProtectedRoute allowedLevels={[1, 2]}><InventoryLog /></ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedLevels={[1, 2]}><SalesReport /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;