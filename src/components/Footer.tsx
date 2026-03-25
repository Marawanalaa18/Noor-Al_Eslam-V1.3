import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  BookOpen, 
  Headphones, 
  Clock, 
  Facebook, 
  Github, 
  Linkedin, 
  Send,
  ExternalLink,
  Mail,
  MapPin
} from 'lucide-react';

export function Footer() {
  const socialLinks = [
    { 
      name: 'Telegram', 
      icon: <Send className="w-5 h-5" />, 
      url: 'https://t.me/Marawan_Alaa18',
      color: 'hover:text-[#229ED9]'
    },
    { 
      name: 'Facebook', 
      icon: <Facebook className="w-5 h-5" />, 
      url: 'https://www.facebook.com/marawan.alostora.7',
      color: 'hover:text-[#1877F2]'
    },
    { 
      name: 'GitHub', 
      icon: <Github className="w-5 h-5" />, 
      url: 'https://github.com/Marawanalaa18',
      color: 'hover:text-[#333]'
    },
    { 
      name: 'LinkedIn', 
      icon: <Linkedin className="w-5 h-5" />, 
      url: 'https://www.linkedin.com/in/marawan-alaa-boriam/',
      color: 'hover:text-[#0A66C2]'
    },
  ];

  const quickLinks = [
    { name: 'القرآن الكريم', to: '/quran' },
    { name: 'الاستماع للقرآن', to: '/audio' },
    { name: 'الأذكار', to: '/adhkar' },
    { name: 'السنن النبوية', to: '/sunnah' },
    { name: 'مواقيت الصلاة', to: '/prayer-times' },
  ];

  return (
    <footer className="relative mt-20 pt-16 pb-8 overflow-hidden" dir="rtl">
      {/* Top Divider with Gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
      
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary-dark/20 dark:to-transparent -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Section 1: Brand & Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-3xl font-bold text-gradient font-amiri">
              منصة نور الإسلام
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-tajawal leading-relaxed">
              منصة إسلامية متكاملة تساعدك على قراءة القرآن، الاستماع إليه، متابعة الأذكار، ومعرفة مواقيت الصلاة بسهولة.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-500 transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.color}`}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-tajawal text-primary dark:text-gold">روابط سريعة</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.to} 
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-gold transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/50 group-hover:scale-150 transition-transform"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-tajawal text-primary dark:text-gold">تواصل معنا</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <div className="text-sm">
                  <p className="font-bold mb-1">البريد الإلكتروني</p>
                  <a href="mailto:marawanalaa482006@gmail.com" className="hover:text-primary dark:hover:text-gold transition-colors">
                    marawanalaa482006@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-gold shrink-0" />
                <div className="text-sm">
                  <p className="font-bold mb-1">الموقع</p>
                  <p>مصر، القاهرة</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Extra Info / Support */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-tajawal text-primary dark:text-gold">دعم المنصة</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              ساهم في نشر الخير من خلال مشاركة المنصة مع أصدقائك وعائلتك. الدال على الخير كفاعله.
            </p>
            <button className="w-full py-3 rounded-xl bg-primary/10 dark:bg-gold/10 text-primary dark:text-gold font-bold hover:bg-primary dark:hover:bg-gold hover:text-white dark:hover:text-primary transition-all flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 fill-current" />
              ادعمنا بالدعاء
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-tajawal">
            © 2026 منصة نور الإسلام. جميع الحقوق محفوظة.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-tajawal flex items-center gap-1">
            تم التطوير بواسطة <span className="font-bold text-primary dark:text-gold">مروان علاء</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
