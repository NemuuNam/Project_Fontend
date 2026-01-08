import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedLevels }) => {
    const token = localStorage.getItem('token');

    // 1. ถ้าไม่มี Token ให้กลับไปหน้า Login ทันที
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        // 2. Decode ข้อมูลจาก Token เพื่อความปลอดภัย (ป้องกันการแก้ไขข้อมูลหน้าบ้าน)
        const decoded = jwtDecode(token);
        
        // ตรวจสอบวันหมดอายุของ Token (Optional)
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            return <Navigate to="/login" replace />;
        }

        // 3. ตรวจสอบสิทธิ์ตาม role_level (1: Admin, 2: Owner, 3: Manager, 4: Customer)
        // อ้างอิงตามตารางขอบเขตโครงการ
        if (allowedLevels && !allowedLevels.includes(Number(decoded.role_level))) {
            // หากไม่มีสิทธิ์ ให้ส่งกลับไปหน้าหลัก หรือหน้าแจ้งเตือน No Access
            return <Navigate to="/unauthorized" replace />;
        }

        // 4. ถ้าผ่านเงื่อนไข ให้แสดงผลหน้าที่ต้องการ
        return children;
    } catch (error) {
        // หาก Token ผิดพลาดหรือ Decode ไม่ได้ ให้ล้างทิ้งแล้วไปหน้า Login
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;