import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit as firestoreLimit,
  serverTimestamp,
} from 'firebase/firestore';
import { app, db } from '../firebaseConfig';
import apiClient from './apiClient';

export const CATEGORIES = [
  { id: 'all', label: 'Tất cả\nDanh mục', icon: 'grid-outline', color: '#1a1c1f', background: '#f0f0f4' },
  { id: 'books', label: 'Giáo trình\n& Sách', icon: 'book-outline', color: '#a04100', background: '#ffdbcc' },
  { id: 'electronics', label: 'Đồ điện tử\nLaptop', icon: 'laptop-outline', color: '#0031e8', background: '#dee0ff' },
  { id: 'furniture', label: 'Nội thất\nKTX', icon: 'bed-outline', color: '#006b55', background: '#6dfad2' },
  { id: 'vehicles', label: 'Xe máy\nXe điện', icon: 'bicycle-outline', color: '#f26f21', background: '#ffe4d4' },
  { id: 'fashion', label: 'Thời trang\nPhụ kiện', icon: 'shirt-outline', color: '#a04100', background: '#ffb693' },
  { id: 'free', label: 'Tặng đồ\nFree 0đ', icon: 'heart-outline', color: '#ba1a1a', background: '#ffdad6' },
];

export const MOCK_PRODUCTS = [
  {
    id: 'prf192-pro197',
    title: 'Combo Giáo trình Kỹ thuật phần mềm K18 (PRF192 + PRO197)',
    category: 'books',
    price: 95000,
    priceDisplay: '95.000 ₫',
    originalPrice: '320.000 ₫',
    discount: '-70%',
    location: 'KTX Dom A • Sảnh chính',
    campus: 'FPT Hòa Lạc',
    seller: {
      name: 'Nguyễn Minh Quân',
      tag: 'K17 SE',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
      rating: '4.9',
      reviews: '38 đánh giá',
      responseRate: '98%',
      responseTime: '~5 phút',
      verified: true,
      phone: '0981234567',
    },
    badge: 'Mới 95%',
    condition: 'Mới 95%',
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1000&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&q=80',
    ],
    verified: true,
    description: {
      conditionDetail: 'Bộ sách gồm 2 cuốn PRF192 và PRO197 được bọc plastic cẩn thận, không quăn góc, không gạch xóa bẩn. Highlight các tips thi PE/FE quan trọng chuẩn kỳ.',
      gift: 'Tặng kèm QR drive riêng truy cập full source code 10 bài Lab Java OOP, các mini-project mẫu C Programming và bộ đề ôn tập thực hành thi qua môn 100%.',
      reason: 'Đã pass môn A+ kỳ Spring 2024, hiện chuẩn bị làm thủ tục đi OJT thực tập doanh nghiệp nên pass lại rẻ cho các em tân sinh viên K18/K19.',
      pickupSchedule: 'Sau 17h30 các ngày trong tuần hoặc cả ngày Thứ 7 & Chủ nhật.',
    },
    createdAt: '10 phút trước',
  },
  {
    id: 'lock-lock-rice-cooker',
    title: 'Nồi cơm điện mini Lock&Lock 0.8L (Dùng tốt phòng trọ KTX)',
    category: 'furniture',
    price: 180000,
    priceDisplay: '180.000 ₫',
    originalPrice: '450.000 ₫',
    discount: '-60%',
    location: 'Làng ĐH / Dom E • P.205',
    campus: 'FPT Hòa Lạc',
    seller: {
      name: 'Trần Bảo Ngọc',
      tag: 'K18 IA',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      rating: '4.8',
      reviews: '19 đánh giá',
      responseRate: '95%',
      responseTime: '~10 phút',
      verified: true,
      phone: '0978901234',
    },
    badge: 'Likenew',
    condition: 'Như mới 98%',
    images: [
      'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=1000&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=1000&q=80',
    ],
    verified: false,
    description: {
      conditionDetail: 'Nồi Lock&Lock chính hãng 0.8L, lòng nồi chống dính ceramic nguyên vẹn không trầy xước, nấu cơm dẻo ngon cho 1-2 người.',
      gift: 'Tặng kèm muôi xới cơm chịu nhiệt và xửng hấp mini hấp bánh bao ăn sáng.',
      reason: 'Đổi sang nấu chung nhóm bạn tại căn hộ nên dư dùng, pass lại cho bạn nào ở trọ hoặc KTX.',
      pickupSchedule: 'Gặp nhận tại sảnh Dom E hoặc quán cafe cổng trường bất kỳ lúc nào.',
    },
    createdAt: '25 phút trước',
  },
  {
    id: 'dell-monitor',
    title: 'Màn hình Dell 24 inch IPS FHD (Kèm cáp HDMI zin)',
    category: 'electronics',
    price: 1250000,
    priceDisplay: '1.250.000 ₫',
    originalPrice: '2.800.000 ₫',
    discount: '-55%',
    location: 'KTX Dom B • P.304',
    campus: 'FPT Hòa Lạc',
    seller: {
      name: 'Lê Huy Hoàng',
      tag: 'K16 SE (Dev)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      rating: '5.0',
      reviews: '42 đánh giá',
      responseRate: '100%',
      responseTime: '~2 phút',
      verified: true,
      phone: '0912345678',
    },
    badge: '98% FHD',
    condition: 'Đẹp 98%, không điểm chết',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1000&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1000&q=80',
      'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=1000&q=80',
    ],
    verified: true,
    description: {
      conditionDetail: 'Màn hình Dell tấm nền IPS góc nhìn rộng, độ phân giải Full HD 1080p, màu sắc chuẩn đồ họa/code đêm không mỏi mắt.',
      gift: 'Tặng kèm cáp HDMI bọc dù cao cấp và dây nguồn zin.',
      reason: 'Mới nâng cấp lên màn hình 2K 27 inch để làm đồ án tốt nghiệp Capstone.',
      pickupSchedule: 'Mời qua phòng 304 Dom B cắm laptop test trực tiếp thoải mái.',
    },
    createdAt: '1 giờ trước',
  },
  {
    id: 'nijia-electric-bike',
    title: 'Xe đạp điện Nijia chính chủ, ắc quy mới thay 2 tháng',
    category: 'vehicles',
    price: 2800000,
    priceDisplay: '2.800.000 ₫',
    originalPrice: '7.500.000 ₫',
    discount: '-62%',
    location: 'Bãi xe KTX Dom B • Hola',
    campus: 'FPT Hòa Lạc',
    seller: {
      name: 'Vũ Đức Thắng',
      tag: 'K16 AI',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
      rating: '4.7',
      reviews: '15 đánh giá',
      responseRate: '92%',
      responseTime: '~15 phút',
      verified: false,
      phone: '0901234567',
    },
    badge: 'Chính chủ',
    condition: 'Xe chạy êm, pin tốt',
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1000&q=80',
      'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1000&q=80',
    ],
    verified: false,
    description: {
      conditionDetail: 'Xe đạp điện Nijia đời mới, khung sườn chắc chắn, đèn còi xi nhan hoạt động hoàn hảo. Bình ắc quy vừa thay mới đi được 45km/lần sạc.',
      gift: 'Tặng kèm khóa chữ U chống trộm, sạc zin ngắt tự động và mũ bảo hiểm FPT.',
      reason: 'Chuẩn bị tốt nghiệp về quê nên chuyển nhượng lại cho bạn nào cần phương tiện đi lại giữa KTX và giảng đường.',
      pickupSchedule: 'Có thể chạy thử xe tại sân bóng KTX vào các buổi chiều.',
    },
    createdAt: '2 giờ trước',
  },
  {
    id: 'foldable-desk-fan',
    title: 'Bàn học gấp gọn đa năng + Quạt mini tích điện cho KTX',
    category: 'furniture',
    price: 120000,
    priceDisplay: '120.000 ₫',
    originalPrice: '250.000 ₫',
    discount: '-52%',
    location: 'KTX Dom C • Tầng 2',
    campus: 'FPT Hòa Lạc',
    seller: {
      name: 'Phạm Lan Anh',
      tag: 'K19 Thiết kế',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
      rating: '4.9',
      reviews: '23 đánh giá',
      responseRate: '99%',
      responseTime: '~3 phút',
      verified: false,
      phone: '0934567890',
    },
    badge: 'Tiện dụng',
    condition: 'Còn rất mới 95%',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1000&q=80',
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=1000&q=80',
    ],
    verified: false,
    description: {
      conditionDetail: 'Bàn học gỗ chân gấp có khe để iPad/điện thoại và vị trí để cốc nước, quạt sạc pin USB 3 tốc độ gió êm ái khi ngủ KTX.',
      gift: 'Tặng thêm đèn học kẹp bàn cổng USB.',
      reason: 'Mua bàn lớn để học vẽ nên không còn chỗ kê.',
      pickupSchedule: 'Nhận tại sảnh Dom C mọi khung giờ.',
    },
    createdAt: '3 giờ trước',
  },
  {
    id: 'sony-wh-ch520',
    title: 'Tai nghe chụp tai Bluetooth Sony WH-CH520 màu kem',
    category: 'electronics',
    price: 650000,
    priceDisplay: '650.000 ₫',
    originalPrice: '1.290.000 ₫',
    discount: '-50%',
    location: 'KTX Dom A • Thư viện Beta',
    campus: 'FPT Hòa Lạc',
    seller: {
      name: 'Đặng Thanh Tùng',
      tag: 'K17 Graphic',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      rating: '5.0',
      reviews: '56 đánh giá',
      responseRate: '100%',
      responseTime: '~2 phút',
      verified: true,
      phone: '0967890123',
    },
    badge: 'Fullbox 99%',
    condition: 'Fullbox như mới, pin 50h',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000&q=80',
    ],
    verified: true,
    description: {
      conditionDetail: 'Tai nghe Sony WH-CH520 chính hãng Sony VN, màu kem thời trang, đệm tai êm ái, pin trâu 50 tiếng nghe nhạc liên tục.',
      gift: 'Tặng hộp đựng tai nghe cứng chống va đập khi bỏ balo.',
      reason: 'Được tặng tai nghe chống ồn mới nên nhượng lại cho bạn nào thích nghe podcast học tiếng Anh.',
      pickupSchedule: 'Hẹn gặp test âm thanh tại Thư viện Beta hoặc sảnh Dom A.',
    },
    createdAt: '5 giờ trước',
  },
  {
    id: 'mad101-discrete-math',
    title: 'Giáo trình Toán Rời Rạc MAD101 + Đề cương ôn thi Final',
    category: 'books',
    price: 45000,
    priceDisplay: '45.000 ₫',
    originalPrice: '150.000 ₫',
    discount: '-70%',
    location: 'Căn tin C7 • Hola',
    campus: 'FPT Hòa Lạc',
    seller: {
      name: 'Hoàng Quốc Việt',
      tag: 'K18 SE',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&q=80',
      rating: '4.8',
      reviews: '12 đánh giá',
      responseRate: '94%',
      responseTime: '~10 phút',
      verified: true,
      phone: '0945678901',
    },
    badge: 'Mới 90%',
    condition: 'Tài liệu chuẩn kì thi',
    images: [
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1000&q=80',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1000&q=80',
    ],
    verified: true,
    description: {
      conditionDetail: 'Sách in rõ nét, ghi chú cẩn thận các dạng bài tập Logic mệnh đề, Cây đồ thị, Thuật toán Dijkstra thường thi.',
      gift: 'File PDF giải chi tiết 5 đề thi các kỳ trước kèm theo link Drive.',
      reason: 'Đã hoàn thành môn học với điểm 9.2.',
      pickupSchedule: 'Gặp nhau tại Căn tin C7 giờ nghỉ trưa.',
    },
    createdAt: '6 giờ trước',
  },
  {
    id: 'logitech-m331-mouse',
    title: 'Chuột không dây Logitech M331 Silent chống ồn thư viện',
    category: 'electronics',
    price: 95000,
    priceDisplay: '95.000 ₫',
    originalPrice: '350.000 ₫',
    discount: '-72%',
    location: 'Thư viện Beta • Tầng 1',
    campus: 'FPT Hòa Lạc',
    seller: {
      name: 'Đỗ Hải Đăng',
      tag: 'K17 AI',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
      rating: '4.9',
      reviews: '27 đánh giá',
      responseRate: '97%',
      responseTime: '~5 phút',
      verified: true,
      phone: '0971234567',
    },
    badge: 'Silent Click',
    condition: 'Dùng mượt, click êm',
    images: [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=1000&q=80',
    ],
    verified: true,
    description: {
      conditionDetail: 'Chuột không dây Logitech bấm cực êm không phát ra tiếng động, lý tưởng học và làm việc trong thư viện hoặc KTX ban đêm.',
      gift: 'Kèm pin AA Energizer mới lắp.',
      reason: 'Đổi sang chuột Magic Mouse dùng với Macbook.',
      pickupSchedule: 'Giao dịch tại sảnh thư viện.',
    },
    createdAt: '8 giờ trước',
  },
  {
    id: 'free-clothes-hanger',
    title: 'Tặng combo 15 móc áo nhôm + 2 kẹp phơi đồ KTX',
    category: 'free',
    price: 0,
    priceDisplay: '0 ₫ (Miễn phí)',
    originalPrice: '80.000 ₫',
    discount: 'TẶNG 0đ',
    location: 'KTX Dom D • Sảnh B',
    campus: 'FPT Hòa Lạc',
    seller: {
      name: 'Nguyễn Thị Mai',
      tag: 'K16 QTKD',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      rating: '5.0',
      reviews: '31 đánh giá',
      responseRate: '100%',
      responseTime: '~1 phút',
      verified: true,
      phone: '0987654321',
    },
    badge: 'Miễn phí 0đ',
    condition: 'Còn tốt 100%',
    images: [
      'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1000&q=80',
    ],
    verified: true,
    description: {
      conditionDetail: '15 móc nhôm dày dặn không rỉ sét, tặng các bạn tân sinh viên mới vào KTX chưa kịp sắm sửa đồ phơi.',
      gift: 'Tặng kèm 1 giỏ đựng xà phòng tắm.',
      reason: 'Chuyển ra ngoài trọ nên tặng lại cho các bạn sinh viên cần.',
      pickupSchedule: 'Ưu tiên bạn nào nhắn trước và qua lấy tại sảnh Dom D.',
    },
    createdAt: '12 giờ trước',
  },
  {
    id: 'hoodie-fpt-orange',
    title: 'Áo Hoodie FPT University bản giới hạn màu cam đen Size L',
    category: 'fashion',
    price: 150000,
    priceDisplay: '150.000 ₫',
    originalPrice: '380.000 ₫',
    discount: '-60%',
    location: 'Sân bóng KTX • Hola',
    campus: 'FPT Hòa Lạc',
    seller: {
      name: 'Bùi Tuấn Anh',
      tag: 'K18 SE',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80',
      rating: '4.9',
      reviews: '17 đánh giá',
      responseRate: '96%',
      responseTime: '~5 phút',
      verified: true,
      phone: '0919876543',
    },
    badge: 'FPT Limited',
    condition: 'Mặc 2 lần, như mới',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1000&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1000&q=80',
    ],
    verified: true,
    description: {
      conditionDetail: 'Áo nỉ bông ấm áp, form rộng rãi unisex, hình in logo FPT thêu nổi sắc nét.',
      gift: 'Tặng kèm móc khóa gấu bông FPT.',
      reason: 'Nhiều áo hoodie quá mặc không hết.',
      pickupSchedule: 'Xem thử áo tại sảnh Dom A.',
    },
    createdAt: '1 ngày trước',
  },
];

/**
 * Fetch products from Firestore with fallback to MOCK_PRODUCTS.
 * Supports category filtering, search keyword, quick filters, and pagination.
 */
export async function getProducts({
  category = 'all',
  search = '',
  filter = 'all', // 'all', 'near', 'under100k', 'free'
  page = 1,
  limit = 6,
  sort = 'newest',
} = {}) {
  let list = [];

  // 1. Try to fetch from Firebase Firestore if available
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (['hidden', 'pending', 'rejected', 'sold'].includes(data.status)) return;
        list.push({
          id: docSnap.id,
          title: data.title || 'Sản phẩm không tên',
          category: data.category || 'other',
          price: Number(data.price) || 0,
          priceDisplay: data.priceDisplay || `${Number(data.price || 0).toLocaleString('vi-VN')} ₫`,
          originalPrice: data.originalPrice || '',
          discount: data.discount || '',
          location: data.location || 'FPT Campus',
          campus: data.campus || 'FPT Hòa Lạc',
          seller: {
            name: data.sellerName || 'Sinh viên FPT',
            tag: data.sellerTag || 'Sinh viên',
            avatar: data.sellerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
            rating: data.sellerRating || '5.0',
            reviews: `${data.reviewCount || 10} đánh giá`,
            responseRate: '98%',
            responseTime: '~5 phút',
            verified: true,
            phone: data.sellerPhone || '0900000000',
          },
          badge: data.condition || 'Mới',
          condition: data.condition || 'Tốt',
          images: Array.isArray(data.images) && data.images.length > 0
            ? data.images
            : (data.image ? [data.image] : ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&q=80']),
          verified: Boolean(data.verified),
          description: typeof data.description === 'object'
            ? data.description
            : { conditionDetail: data.description || 'Mô tả chi tiết sản phẩm.', gift: 'Hỗ trợ giao dịch trực tiếp.', reason: 'Pass đồ sinh viên.', pickupSchedule: 'Hẹn trực tiếp tại Campus.' },
          createdAt: data.createdAt ? 'Vừa xong' : 'Hôm nay',
        });
      });
    }
  } catch (err) {
    // Graceful fallback to mock data if Firestore has offline/permission/network issues
    console.log('[productApi] Firestore offline or empty, using rich mock data:', err.message);
  }

  // Merge or fallback to MOCK_PRODUCTS
  if (list.length === 0) {
    list = [...MOCK_PRODUCTS];
  } else {
    // Append mock products that aren't duplicated by id
    const existingIds = new Set(list.map((item) => item.id));
    MOCK_PRODUCTS.forEach((mock) => {
      if (!existingIds.has(mock.id)) {
        list.push(mock);
      }
    });
  }

  // 2. Filter by Category
  if (category && category !== 'all') {
    list = list.filter((item) => item.category === category);
  }

  // 3. Filter by Search keyword
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    list = list.filter((item) => {
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDesc = typeof item.description === 'string'
        ? item.description.toLowerCase().includes(q)
        : JSON.stringify(item.description || {}).toLowerCase().includes(q);
      const matchLocation = item.location?.toLowerCase().includes(q);
      const matchSeller = item.seller?.name?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLocation || matchSeller;
    });
  }

  // 4. Quick filters
  if (filter === 'near' || filter === 'Gần bạn (KTX)') {
    list = list.filter((item) => item.location?.toLowerCase().includes('ktx') || item.location?.toLowerCase().includes('dom'));
  } else if (filter === 'under100k' || filter === 'Giá < 100k') {
    list = list.filter((item) => item.price < 100000);
  } else if (filter === 'free' || filter === 'Tặng đồ 0đ') {
    list = list.filter((item) => item.price === 0 || item.category === 'free');
  }

  // 5. Sorting
  if (sort === 'priceAsc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'priceDesc') {
    list.sort((a, b) => b.price - a.price);
  }

  // 6. Pagination (Infinite Scroll)
  const total = list.length;
  const startIndex = 0;
  const endIndex = page * limit;
  const paginatedItems = list.slice(startIndex, endIndex);
  const hasMore = endIndex < total;

  return {
    products: paginatedItems,
    hasMore,
    total,
    page,
  };
}

/**
 * Get product details by ID
 */
export async function getProductById(productId) {
  if (!productId) return MOCK_PRODUCTS[0];

  // Try Firestore first
  try {
    const docRef = doc(db, 'products', productId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        ...data,
        priceDisplay: data.priceDisplay || `${Number(data.price || 0).toLocaleString('vi-VN')} ₫`,
        images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.image || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&q=80'],
      };
    }
  } catch (err) {
    console.log('[productApi] getProductById Firestore err, fallback to mock:', err.message);
  }

  const found = MOCK_PRODUCTS.find((p) => p.id === productId);
  return found || MOCK_PRODUCTS[0];
}

/**
 * Get suggested/related products
 */
export function getSuggestedProducts(currentId, category) {
  return MOCK_PRODUCTS.filter((p) => p.id !== currentId && (category ? p.category === category || p.category === 'books' : true)).slice(0, 4);
}

/**
 * Lấy danh sách tin đăng của 1 user theo uid
 * @param {string} uid - Firebase user UID
 * @returns {{ active: [], pending: [], sold: [] }}
 */
export async function getUserListings(uid) {
  if (!uid) return { active: [], pending: [], sold: [] };

  try {
    const q = query(
      collection(db, 'products'),
      where('seller.uid', '==', uid),
    );
    const snap = await getDocs(q);
    const all = snap.docs.map((docSnap) => {
      const d = docSnap.data();
      const createdAt = d.createdAt?.toDate ? d.createdAt.toDate() : null;
      let age = 'Vừa đăng';
      if (createdAt) {
        const diffMs = Date.now() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 60) age = `${diffMins} phút trước`;
        else if (diffHours < 24) age = `${diffHours} giờ trước`;
        else age = `${diffDays} ngày trước`;
      }
      return {
        id: docSnap.id,
        title: d.title || 'Sản phẩm không tên',
        price: d.price ? Number(d.price).toLocaleString('vi-VN') : '0',
        priceDisplay: d.priceDisplay || `${Number(d.price || 0).toLocaleString('vi-VN')} ₫`,
        image: (d.images && d.images[0]) || d.image || '',
        imageCount: Array.isArray(d.images) ? d.images.length : 1,
        age,
        location: d.location || 'FPT Hòa Lạc',
        views: d.views || 0,
        messages: d.messages || 0,
        saves: d.saves || 0,
        status: d.status || 'pending',
      };
    });

    return {
      active: all.filter((p) => p.status === 'active' || p.status === 'showing'),
      hidden: all.filter((p) => p.status === 'hidden'),
      pending: all.filter((p) => p.status === 'pending'),
      sold: all.filter((p) => p.status === 'sold'),
    };
  } catch (err) {
    console.error('[productApi] getUserListings failed:', err);
    throw err;
  }
}

/**
 * Cập nhật trạng thái tin đăng (active / hidden / sold)
 * @param {string} productId
 * @param {'active'|'hidden'|'sold'} status
 */
export async function updateListingStatus(productId, status) {
  const updates = { status, updatedAt: serverTimestamp() };
  if (status === 'sold') updates.soldAt = serverTimestamp();
  await updateDoc(doc(db, 'products', productId), updates);
}

/**
 * Xóa vĩnh viễn tin đăng
 * @param {string} productId
 */
export async function deleteListing(productId) {
  await deleteDoc(doc(db, 'products', productId));
}

/**
 * Thêm tin đăng mới lên Firestore
 * @param {Object} listingData
 * @returns {string} id của document mới
 */
export async function addListing(listingData) {
  const docRef = await addDoc(collection(db, 'products'), {
    ...listingData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    views: 0,
    saves: 0,
    messages: 0,
    status: 'pending',
  });
  return docRef.id;
}

async function uploadListingImage(uri, listingId) {
  if (/^https?:\/\//i.test(uri)) return uri;
  const isBase64Image = /^data:image\/[^;]+;base64,/i.test(uri);
  if (!isBase64Image) {
    throw new Error('Không đọc được dữ liệu ảnh. Vui lòng xóa ảnh này và chọn lại từ thư viện.');
  }

  let stage = 'uploading image through backend';
  try {
    const result = await apiClient.post(
      '/uploads/image',
      { listingId, imageData: uri },
      { timeout: 120000 },
    );
    if (!result?.secureUrl) throw new Error('Máy chủ không trả về đường dẫn ảnh.');
    return result.secureUrl;
  } catch (error) {
    console.error(`[productApi] Photo upload failed: ${JSON.stringify({
      stage,
      code: error?.code || error?.originalError?.code || 'unknown',
      statusCode: error?.statusCode || error?.response?.status || error?.originalError?.response?.status || null,
      message: error?.message || String(error),
      errorName: error?.name || error?.originalError?.name || 'unknown',
    })}`);
    throw error;
  }
}

async function uploadListingImages(images, listingId) {
  if (!Array.isArray(images) || images.length < 1 || images.length > 5) {
    throw new Error('Tin đăng cần có từ 1 đến 5 ảnh.');
  }
  const uploadedImages = [];
  for (const uri of images) {
    uploadedImages.push(await uploadListingImage(uri, listingId));
  }
  return uploadedImages;
}

// Uploads new photos through a backend-signed Cloudinary request, then creates the listing.
export async function createListing(listingData, userId, images) {
  if (!userId) throw new Error('Bạn cần đăng nhập để đăng tin.');
  const listingRef = doc(collection(db, 'products'));
  let stage = 'uploading images';
  try {
    const imageUrls = await uploadListingImages(images, listingRef.id);
    stage = 'writing Firestore document';
    await setDoc(listingRef, {
      ...listingData,
      images: imageUrls,
      image: imageUrls[0],
      seller: { ...listingData.seller, uid: userId },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      saves: 0,
      messages: 0,
      status: 'pending',
    });
    return listingRef.id;
  } catch (error) {
    console.error(`[productApi] Listing create failed: ${JSON.stringify({
      stage,
      code: error?.code || error?.originalError?.code || 'unknown',
      message: error?.message || String(error),
      projectId: app.options.projectId || 'unknown',
      database: '(default)',
    })}`);
    throw error;
  }
}

// Confirms Firestore ownership before uploading or changing an existing listing.
export async function updateListing(listingId, listingData, userId, images) {
  if (!listingId || !userId) throw new Error('Thiếu thông tin tin đăng hoặc tài khoản.');
  const listingRef = doc(db, 'products', listingId);
  const listingSnapshot = await getDoc(listingRef);
  if (!listingSnapshot.exists()) throw new Error('Tin đăng không còn tồn tại.');
  const currentListing = listingSnapshot.data();
  if (currentListing.seller?.uid !== userId) {
    throw new Error('Bạn không có quyền chỉnh sửa tin đăng này.');
  }

  const imageUrls = await uploadListingImages(images, listingId);
  await updateDoc(listingRef, {
    ...listingData,
    images: imageUrls,
    image: imageUrls[0],
    seller: { ...currentListing.seller, ...listingData.seller, uid: userId },
    ...(currentListing.status === 'rejected'
      ? { status: 'pending', rejectionReason: '', rejectedAt: null, rejectedBy: null }
      : {}),
    updatedAt: serverTimestamp(),
  });
}
