import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vi: {
    translation: {
      brand: 'Khách sạn Anh Đào',
      nav: {
        home: 'Trang chủ',
        booking: 'Đặt phòng',
        history: 'Lịch sử đặt phòng',
        admin: 'Quản trị',
        login: 'Đăng nhập',
        register: 'Đăng ký',
        logout: 'Đăng xuất'
      },
      home: {
        headline: 'Khách sạn Anh Đào',
        subhead: 'Không gian nghỉ dưỡng hiện đại, yên tĩnh và thân thiện tại trung tâm thành phố.',
        cta: 'Xem phòng',
        rooms: 'Phòng tiện nghi',
        service: 'Dịch vụ 24/7',
        guests: 'Khách hàng hài lòng',
        introTitle: 'Trải nghiệm lưu trú tối giản và thoải mái',
        intro: 'Anh Đào kết hợp phong cách hiện đại với dịch vụ chu đáo, phù hợp cho chuyến công tác, du lịch gia đình và kỳ nghỉ ngắn ngày.'
      },
      booking: {
        title: 'Danh sách phòng',
        detail: 'Xem chi tiết',
        bookNow: 'Đặt ngay',
        checkIn: 'Ngày nhận phòng',
        checkOut: 'Ngày trả phòng',
        success: 'Đặt phòng thành công. Đơn đang chờ xác nhận.',
        empty: 'Chưa có phòng nào.'
      },
      auth: {
        email: 'Email',
        password: 'Mật khẩu',
        nickname: 'Nickname',
        phone: 'Số điện thoại',
        loginTitle: 'Đăng nhập',
        registerTitle: 'Đăng ký tài khoản',
        loginButton: 'Đăng nhập',
        registerButton: 'Tạo tài khoản'
      },
      history: {
        title: 'Quản lý đặt chỗ',
        pending: 'Đang chờ',
        checkedIn: 'Đã nhận phòng',
        completed: 'Lịch sử',
        cancelled: 'Đã hủy',
        empty: 'Không có đơn đặt phòng trong mục này.'
      },
      admin: {
        title: 'Admin Dashboard',
        rooms: 'Quản lý phòng',
        bookings: 'Danh sách đặt phòng',
        saveRoom: 'Lưu phòng',
        newRoom: 'Phòng mới',
        update: 'Cập nhật',
        delete: 'Xóa',
        deleteSelected: 'Xóa mục đã chọn',
        edit: 'Sửa',
        customer: 'Khách hàng',
        status: 'Trạng thái đơn',
        images: 'Hình ảnh phòng',
        imagesHint: 'Tối đa 6 ảnh. Ảnh đầu tiên là ảnh chính.',
        viewCustomer: 'Xem chi tiết',
        customerInfo: 'Chi tiết khách hàng',
        selected: 'Đã chọn'
      },
      common: {
        type: 'Loại phòng',
        price: 'Giá',
        rating: 'Đánh giá',
        description: 'Mô tả',
        status: 'Trạng thái',
        available: 'Còn phòng',
        maintenance: 'Bảo trì',
        single: 'Phòng đơn',
        double: 'Phòng đôi',
        vip: 'VIP',
        pending: 'Đang chờ',
        'checked-in': 'Đã nhận phòng',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
        total: 'Tổng tiền',
        close: 'Đóng',
        cancel: 'Hủy',
        name: 'Tên phòng',
        image: 'Hình ảnh'
      }
    }
  },
  en: {
    translation: {
      brand: 'Anh Dao Hotel',
      nav: {
        home: 'Home',
        booking: 'Booking',
        history: 'My bookings',
        admin: 'Admin',
        login: 'Login',
        register: 'Register',
        logout: 'Logout'
      },
      home: {
        headline: 'Anh Dao Hotel',
        subhead: 'A modern, calm and friendly stay in the heart of the city.',
        cta: 'Browse rooms',
        rooms: 'Comfort rooms',
        service: '24/7 service',
        guests: 'Happy guests',
        introTitle: 'Minimal, comfortable hotel experience',
        intro: 'Anh Dao combines modern interiors with thoughtful service for business trips, family travel and short vacations.'
      },
      booking: {
        title: 'Available rooms',
        detail: 'View details',
        bookNow: 'Book now',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        success: 'Booking created. Your request is pending.',
        empty: 'No rooms available.'
      },
      auth: {
        email: 'Email',
        password: 'Password',
        nickname: 'Nickname',
        phone: 'Phone',
        loginTitle: 'Login',
        registerTitle: 'Create account',
        loginButton: 'Login',
        registerButton: 'Register'
      },
      history: {
        title: 'Booking management',
        pending: 'Pending',
        checkedIn: 'Checked-in',
        completed: 'History',
        cancelled: 'Cancelled',
        empty: 'No bookings in this tab.'
      },
      admin: {
        title: 'Admin Dashboard',
        rooms: 'Room management',
        bookings: 'Booking list',
        saveRoom: 'Save room',
        newRoom: 'New room',
        update: 'Update',
        delete: 'Delete',
        deleteSelected: 'Delete selected',
        edit: 'Edit',
        customer: 'Customer',
        status: 'Booking status',
        images: 'Room images',
        imagesHint: 'Maximum 6 images. The first image is the main image.',
        viewCustomer: 'View details',
        customerInfo: 'Customer details',
        selected: 'Selected'
      },
      common: {
        type: 'Room type',
        price: 'Price',
        rating: 'Rating',
        description: 'Description',
        status: 'Status',
        available: 'Available',
        maintenance: 'Maintenance',
        single: 'Single',
        double: 'Double',
        vip: 'VIP',
        pending: 'Pending',
        'checked-in': 'Checked-in',
        completed: 'Completed',
        cancelled: 'Cancelled',
        total: 'Total',
        close: 'Close',
        cancel: 'Cancel',
        name: 'Room name',
        image: 'Image'
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('anhdao_lang') || 'vi',
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
