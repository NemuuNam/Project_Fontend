import axios from 'axios';
import BASE_URL from './config';

// สร้าง Instance ของ Axios พร้อมกำหนดค่าเริ่มต้น
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Request Interceptor: ใส่ Token ให้อัตโนมัติทุกครั้งที่ยิง API ---
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; //
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Response Interceptor: จัดการ Error ทั่วไประดับ Global ---
axiosInstance.interceptors.response.use(
    (response) => {
        // หาก API ส่งกลับมาในรูปแบบ { success: true, data: ... } 
        // เราสามารถส่งแค่ส่วน data ออกไปให้หน้าบ้านได้เลย
        return response.data;
    },
    (error) => {
        // หากเจอ Error 401 (Unauthorized) เช่น Token หมดอายุ
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login'; // เตะกลับไปหน้า Login
        }
        
        // ส่ง Error ต่อไปให้หน้าบ้านรับไปแสดงผล (เช่น toast.error)
        return Promise.reject(error);
    }
);

export default axiosInstance;