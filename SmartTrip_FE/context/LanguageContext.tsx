import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.discover': 'Discover',
    'nav.myTrips': 'My Trips',
    'nav.planner': 'Planner',
    'nav.admin': 'Admin',
    'nav.monitoring': 'Monitoring',
    'nav.notifications': 'Notifications',
    'nav.logout': 'Logout',
    'hero.title': 'The Future of Travel',
    'hero.ai': 'AI-Powered',
    'hero.subtitle': 'Experience journeys designed by intelligence, crafted for your soul.',
    'hero.placeholder': 'Where would you like to go?',
    'hero.cta': 'Plan My Journey',
    'hero.suggestions': 'Suggestions: Tokyo, Santorini, Swiss Alps',
    'featured.title': 'Featured Journeys',
    'featured.subtitle': 'Handpicked by our AI for your unique preferences.',
    'featured.viewAll': 'View All',
    'featured.popular': 'Popular',
    'featured.explore': 'Explore Now',
    'concierge.title': 'Your AI Concierge',
    'concierge.subtitle': 'Real-time intelligence that anticipates your needs.',
    'concierge.insights': 'Market Insights',
    'concierge.saved': 'Saved Trips',
    'concierge.flights': 'Live Flights',
    'concierge.budget': 'Budget Tracker',
    'concierge.quote': '"The best way to predict the future is to create it."',
    'concierge.cta': 'Activate Concierge',
    'features.search.title': 'Intelligent Search',
    'features.search.desc': 'Find the perfect destination with our AI-powered search engine.',
    'features.partners.title': 'Global Partners',
    'features.partners.desc': 'Access exclusive deals from our network of global travel partners.',
    'features.flexibility.title': 'Total Flexibility',
    'features.flexibility.desc': 'Change your plans on the fly with our flexible booking options.',
    'features.support.title': '24/7 Support',
    'features.support.desc': 'Our support team is always available to help you with your journey.',
    'footer.rights': 'All rights reserved.',
    'footer.terms': 'Terms',
    'footer.privacy': 'Privacy',
    'footer.support': 'Support',
    'footer.partners': 'Partners',
  },
  vi: {
    'nav.discover': 'Khám phá',
    'nav.myTrips': 'Chuyến đi của tôi',
    'nav.planner': 'Lập kế hoạch',
    'nav.admin': 'Quản trị',
    'nav.monitoring': 'Giám sát',
    'nav.notifications': 'Thông báo',
    'nav.logout': 'Đăng xuất',
    'hero.title': 'Tương lai của Du lịch',
    'hero.ai': 'Sức mạnh AI',
    'hero.subtitle': 'Trải nghiệm những hành trình được thiết kế bởi trí tuệ, dành riêng cho tâm hồn bạn.',
    'hero.placeholder': 'Bạn muốn đi đâu?',
    'hero.cta': 'Lập kế hoạch hành trình',
    'hero.suggestions': 'Gợi ý: Tokyo, Santorini, Swiss Alps',
    'featured.title': 'Hành trình tiêu biểu',
    'featured.subtitle': 'Được AI của chúng tôi lựa chọn dựa trên sở thích của bạn.',
    'featured.viewAll': 'Xem tất cả',
    'featured.popular': 'Phổ biến',
    'featured.explore': 'Khám phá ngay',
    'concierge.title': 'Quản gia AI của bạn',
    'concierge.subtitle': 'Trí tuệ thời gian thực dự đoán nhu cầu của bạn.',
    'concierge.insights': 'Thông tin thị trường',
    'concierge.saved': 'Chuyến đi đã lưu',
    'concierge.flights': 'Chuyến bay trực tiếp',
    'concierge.budget': 'Theo dõi ngân sách',
    'concierge.quote': '"Cách tốt nhất để dự đoán tương lai là tạo ra nó."',
    'concierge.cta': 'Kích hoạt Quản gia',
    'features.search.title': 'Tìm kiếm thông minh',
    'features.search.desc': 'Tìm điểm đến hoàn hảo với công cụ tìm kiếm AI của chúng tôi.',
    'features.partners.title': 'Đối tác toàn cầu',
    'features.partners.desc': 'Truy cập các ưu đãi độc quyền từ mạng lưới đối tác du lịch toàn cầu.',
    'features.flexibility.title': 'Linh hoạt tối đa',
    'features.flexibility.desc': 'Thay đổi kế hoạch của bạn ngay lập tức với các tùy chọn đặt phòng linh hoạt.',
    'features.support.title': 'Hỗ trợ 24/7',
    'features.support.desc': 'Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn trong suốt hành trình.',
    'footer.rights': 'Bảo lưu mọi quyền.',
    'footer.terms': 'Điều khoản',
    'footer.privacy': 'Bảo mật',
    'footer.support': 'Hỗ trợ',
    'footer.partners': 'Đối tác',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
