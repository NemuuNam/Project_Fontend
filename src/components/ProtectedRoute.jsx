import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    // ดึงข้อมูล User จาก localStorage ที่บันทึกไว้ตอน Login
    const user = JSON.parse(localStorage.getItem('user')); 
    const token = localStorage.getItem('token');

    // 1. ถ้าไม่มี Token หรือไม่ได้ Login ให้กลับไปหน้า Login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // 2. ถ้า Role ID ของ User ไม่อยู่ในกลุ่มที่อนุญาต ให้ไปหน้า No Access
    if (!allowedRoles.includes(user.role_id)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. ถ้าผ่านเงื่อนไขทั้งหมด ให้แสดงผลหน้านั้นๆ
    return children;
};

export default ProtectedRoute;