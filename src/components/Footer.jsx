import React from 'react';
import { Mail, Phone, MapPin, Settings, Facebook, Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
  // สร้างตัวแปรปีปัจจุบัน (ตามคำแนะนำคือปี 2026)
  const currentYear = 2026;

  return (
    <footer className="bg-white border-t border-slate-100 font-['Kanit']">
      {/* ส่วนเนื้อหาหลัก */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Column 1: Brand & Slogan */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">KAIKA</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              ถูก อร่อย และดี <br className="hidden lg:block" /> 
              เราคัดสรรวัตถุดิบคุณภาพเพื่อคุณในทุกๆ วัน
            </p>
            <div className="flex space-x-3">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: MessageCircle, href: "#" }
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.href} 
                  className="p-2.5 border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-90"
                >
                  <social.Icon size={20} />
                </a>
              ))}
            </div>
            
            <button className="flex items-center space-x-2 bg-slate-50 text-slate-900 border border-slate-100 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-900 hover:text-white transition-all active:scale-95">
              <Settings size={16} />
              <span>SHOP SETTINGS</span>
            </button>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-6 tracking-[0.2em] uppercase">Navigation</h3>
            <ul className="space-y-4 text-slate-500 font-semibold">
              {['หน้าแรก', 'เมนูสินค้า', 'ตะกร้าของฉัน', 'ติดตามออเดอร์'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-slate-900 transition-colors flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-slate-900 mr-0 transition-all group-hover:mr-2 rounded-full"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-6 tracking-[0.2em] uppercase">Support</h3>
            <ul className="space-y-4 text-slate-500 font-semibold">
              {['Privacy Policy', 'Terms of Service', 'FAQ', 'ติดต่อเจ้าหน้าที่'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-slate-900 transition-colors flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-slate-900 mr-0 transition-all group-hover:mr-2 rounded-full"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-50 lg:bg-transparent lg:p-0 lg:border-none">
            <h3 className="text-sm font-black text-slate-900 mb-6 tracking-[0.2em] uppercase">Contact Us</h3>
            <ul className="space-y-5 text-slate-600 font-medium">
              <li className="flex items-start space-x-4 group">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <MapPin size={18} className="shrink-0" />
                </div>
                <span className="text-sm leading-relaxed">000/00 แขวงไก่กา เขตไก่ <br/>กรุงเทพ 10000</span>
              </li>
              <li className="flex items-center space-x-4 group">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Phone size={18} className="shrink-0" />
                </div>
                <span className="text-sm font-bold">080-000-0000</span>
              </li>
              <li className="flex items-center space-x-4 group">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Mail size={18} className="shrink-0" />
                </div>
                <span className="text-sm font-bold break-all">kaika.official@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-50 py-8 bg-slate-50/30">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
              © {currentYear} Kaika. All rights reserved.
            </p>
            <p className="text-[10px] font-black text-slate-300 tracking-tighter uppercase">
              Crafted with Quality & Passion
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;