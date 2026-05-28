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
        intro: 'Anh Đào kết hợp phong cách hiện đại với dịch vụ chu đáo, phù hợp cho chuyến công tác, du lịch gia đình và kỳ nghỉ ngắn ngày.',
        roomCardsTitle: 'Không gian nghỉ phù hợp cho từng nhu cầu',
        roomCardsSubtitle: 'Ba lựa chọn phòng được thiết kế gọn gàng, sáng sủa và dễ đặt ngay khi bạn cần.',
        singleCardTitle: 'Phòng Đơn',
        singleCardDesc:
          'Không gian riêng tư cho chuyến công tác hoặc nghỉ ngắn ngày. Bố cục tinh gọn, giường êm, ánh sáng dịu và đầy đủ tiện nghi cần thiết.',
        familyCardTitle: 'Phòng Gia Đình',
        familyCardDesc:
          'Diện tích thoải mái cho gia đình hoặc nhóm nhỏ. Khu vực sinh hoạt rộng, nhiều tiện ích và cảm giác ấm cúng như ở nhà.',
        vipCardTitle: 'Phòng VIP',
        vipCardDesc:
          'Trải nghiệm cao cấp với không gian rộng, nội thất tinh tế và tầm nhìn đẹp. Phù hợp cho kỳ nghỉ cần sự riêng tư và thư giãn.',
        bookRoomNow: 'Đặt phòng ngay'
      },
      booking: {
        title: 'Danh sách phòng',
        detail: 'Xem chi tiết',
        bookNow: 'Đặt ngay',
        checkIn: 'Ngày nhận phòng',
        checkOut: 'Ngày trả phòng',
        success: 'Đặt phòng thành công. Đơn đang chờ xác nhận.',
        empty: 'Chưa có phòng nào.',
        amenitiesTitle: 'Tiện ích',
        amenities: {
          wifi: 'Wifi tốc độ cao',
          workspace: 'Bàn làm việc',
          shower: 'Phòng tắm riêng',
          family: 'Không gian gia đình',
          breakfast: 'Bữa sáng',
          window: 'Cửa sổ thoáng',
          cityView: 'Tầm nhìn đẹp',
          bathtub: 'Bồn tắm',
          lounge: 'Khu thư giãn'
        }
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
      notification: {
        title: 'Thông báo',
        empty: 'Không có thông báo mới',
        reviewTitle: 'Đánh giá phòng',
        rating: 'Số sao',
        comment: 'Bình luận',
        submit: 'Gửi đánh giá'
      },
      admin: {
        title: 'Admin Dashboard',
        dashboard: 'Dashboard',
        rooms: 'Quản lý phòng',
        bookings: 'Booking list',
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
        selected: 'Đã chọn',
        roomMap: 'Sơ đồ phòng',
        totalRooms: 'Tổng số phòng',
        maintenanceSelected: 'Chuyển bảo trì',
        quickStatus: 'Đổi trạng thái nhanh',
        currentGuest: 'Khách đang ở / đang chờ',
        noGuest: 'Chưa có khách đang ở hoặc đang chờ nhận phòng',
        recentBookings: 'Đơn gần đây',
        overview: 'Tổng quan vận hành',
        roomPreview: 'Tình trạng phòng nhanh',
        roomManagement: 'Danh sách và thêm phòng'
      },
      common: {
        type: 'Loại phòng',
        price: 'Giá',
        rating: 'Đánh giá',
        description: 'Mô tả',
        status: 'Trạng thái',
        available: 'Trống',
        maintenance: 'Bảo trì',
        occupied: 'Đang dùng',
        booked: 'Đã đặt',
        single: 'Phòng đơn',
        double: 'Phòng Gia Đình',
        vip: 'VIP',
        pending: 'Đang chờ',
        'checked-in': 'Đã nhận phòng',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
        total: 'Tổng tiền',
        close: 'Đóng',
        cancel: 'Hủy',
        name: 'Tên phòng',
        roomNumber: 'Số phòng',
        image: 'Hình ảnh',
        mainImage: 'Chính'
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
        intro: 'Anh Dao combines modern interiors with thoughtful service for business trips, family travel and short vacations.',
        roomCardsTitle: 'Rooms designed for every stay',
        roomCardsSubtitle: 'Three calm, practical room choices with a simple path to book.',
        singleCardTitle: 'Single Room',
        singleCardDesc:
          'A private space for business trips or short stays. Compact layout, soft bedding, gentle lighting and all essential amenities.',
        familyCardTitle: 'Family Room',
        familyCardDesc:
          'A comfortable room for families or small groups. More living space, practical amenities and a warm home-like feeling.',
        vipCardTitle: 'VIP Room',
        vipCardDesc:
          'A premium stay with generous space, refined interiors and a pleasant view. Ideal for privacy, rest and a slower pace.',
        bookRoomNow: 'Book now'
      },
      booking: {
        title: 'Available rooms',
        detail: 'View details',
        bookNow: 'Book now',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        success: 'Booking created. Your request is pending.',
        empty: 'No rooms available.',
        amenitiesTitle: 'Amenities',
        amenities: {
          wifi: 'High-speed wifi',
          workspace: 'Workspace',
          shower: 'Private bathroom',
          family: 'Family space',
          breakfast: 'Breakfast',
          window: 'Open window',
          cityView: 'Nice view',
          bathtub: 'Bathtub',
          lounge: 'Lounge area'
        }
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
      notification: {
        title: 'Notifications',
        empty: 'No new notifications',
        reviewTitle: 'Room review',
        rating: 'Rating',
        comment: 'Comment',
        submit: 'Submit review'
      },
      admin: {
        title: 'Admin Dashboard',
        dashboard: 'Dashboard',
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
        selected: 'Selected',
        roomMap: 'Room map',
        totalRooms: 'Total rooms',
        maintenanceSelected: 'Set maintenance',
        quickStatus: 'Quick status update',
        currentGuest: 'Current / pending guest',
        noGuest: 'No current or pending guest',
        recentBookings: 'Recent bookings',
        overview: 'Operations overview',
        roomPreview: 'Quick room status',
        roomManagement: 'Room list and creation'
      },
      common: {
        type: 'Room type',
        price: 'Price',
        rating: 'Rating',
        description: 'Description',
        status: 'Status',
        available: 'Available',
        maintenance: 'Maintenance',
        occupied: 'Occupied',
        booked: 'Booked',
        single: 'Single',
        double: 'Family',
        vip: 'VIP',
        pending: 'Pending',
        'checked-in': 'Checked-in',
        completed: 'Completed',
        cancelled: 'Cancelled',
        total: 'Total',
        close: 'Close',
        cancel: 'Cancel',
        name: 'Room name',
        roomNumber: 'Room number',
        image: 'Image',
        mainImage: 'Main'
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
