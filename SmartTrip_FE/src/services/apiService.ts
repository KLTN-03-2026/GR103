/**
 * Mock API Service
 * Dùng để giả lập các cuộc gọi API từ Server.
 * Bạn có thể thay đổi dữ liệu ở đây để kiểm tra giao diện.
 */

export const mockApi = {
  // Giả lập lấy gợi ý từ AI cho Dashboard
  getAIInsights: async (category: string): Promise<string> => {
    // Giả lập độ trễ mạng 1 giây
    await new Promise(resolve => setTimeout(resolve, 1000));

    const insights: Record<string, string> = {
      hotels: "Dựa trên dữ liệu thật: Tỷ lệ lấp đầy phòng tại khu vực miền Trung đang tăng 25%. Bạn nên cân nhắc tăng giá phòng vào cuối tuần tới.",
      restaurants: "Xu hướng ẩm thực Fusion đang dẫn đầu. Các món ăn kết hợp Á-Âu của bạn nhận được 4.8 sao từ khách du lịch Pháp.",
      attractions: "Lượng khách tham quan Bảo tàng đang giảm. AI gợi ý bạn nên tạo gói combo 'Vé tham quan + Ăn trưa' để kích cầu.",
      bookings: "Phát hiện 15% đơn đặt chỗ bị hủy vào phút chót. Gợi ý: Áp dụng chính sách đặt cọc 20% cho các nhóm khách trên 10 người."
    };

    return insights[category] || "Đang phân tích dữ liệu hệ thống...";
  },

  // Giả lập lấy nhật ký đồng bộ cho AI Monitoring
  getSyncLogs: async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return [
      { id: `TXN-${Math.floor(Math.random() * 1000)}`, source: 'Hotel_Sync_Global', status: 'Success', latency: '45ms' },
      { id: `TXN-${Math.floor(Math.random() * 1000)}`, source: 'Resto_Vector_Update', status: 'Success', latency: '120ms' },
      { id: `TXN-${Math.floor(Math.random() * 1000)}`, source: 'Attract_Geo_Index', status: 'Failed', latency: 'Timeout' },
      { id: `TXN-${Math.floor(Math.random() * 1000)}`, source: 'User_Profile_Sync', status: 'Success', latency: '32ms' },
    ];
  },

  // Giả lập dữ liệu biểu đồ hiệu suất
  getPerformanceData: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      { time: '00:00', latency: Math.floor(Math.random() * 100) },
      { time: '04:00', latency: Math.floor(Math.random() * 100) },
      { time: '08:00', latency: Math.floor(Math.random() * 100) },
      { time: '12:00', latency: Math.floor(Math.random() * 100) },
      { time: '16:00', latency: Math.floor(Math.random() * 100) },
      { time: '20:00', latency: Math.floor(Math.random() * 100) },
    ];
  }
};
