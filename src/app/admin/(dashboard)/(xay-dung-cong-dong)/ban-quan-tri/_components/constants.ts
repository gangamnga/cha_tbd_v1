'use client'


// ── Shared Types ──────────────────────────────────────────────────────────────

export type BqtMember = {
  id: string
  name: string // Stores [Tên thánh] | [Họ tên] dynamically or [Tên thánh] [Họ tên]
  department: string
  role: string
  photo_url: string | null
  phone: string | null
  email: string | null
  facebook_url: string | null
  term_year: number | null
  is_active: boolean
  notes: string | null
  sort_order: number
  created_at: string
}

/**
 * Phân tách Tên thánh và Họ tên một cách thông minh:
 * 1. Ưu tiên dấu phân tách đứng ` | ` trong database và file seed.
 * 2. Hỗ trợ dấu phân tách tàng hình \u200B (Zero-width space) cho các bản ghi cũ.
 * 3. Tự động đối chiếu với danh sách tên thánh phổ biến cho dữ liệu thô.
 */
export function splitMemberName(fullName: string): { holyName: string; name: string } {
  if (!fullName) return { holyName: '', name: '' }

  // 1. Ưu tiên kiểm tra dấu phân tách gạch đứng |
  if (fullName.includes('|')) {
    const parts = fullName.split('|')
    return {
      holyName: parts[0].trim(),
      name: parts[1]?.trim() || ''
    }
  }

  // 2. Hỗ trợ dấu phân tách tàng hình \u200B (Zero Width Space) của phiên bản trước
  if (fullName.includes('\u200B')) {
    const parts = fullName.split('\u200B')
    return {
      holyName: parts[0].trim(),
      name: parts[1]?.trim() || ''
    }
  }

  const words = fullName.trim().split(/\s+/)
  if (words.length <= 1) {
    return { holyName: '', name: fullName }
  }

  // Danh sách Tên thánh phổ biến (không viết dấu hoặc có dấu tiếng Việt)
  const commonHolyNames = [
    'maria', 'giuse', 'têrêsa', 'têrêxa', 'phêrô', 'marta', 'gioan', 'phaolô', 'anna', 'antôn', 'rosa', 'tôma', 
    'phanxicô', 'đaminh', 'micaêl', 'vincent', 'giacôbê', 'anrê', 'bartôlômêô', 'philípphê', 'matthêu', 
    'simon', 'giuđa', 'matthia', 'têphanô', 'laurentiô', 'lôrensô', 'laurensô', 'bênađô', 'mônica', 'monica', 
    'cêcilia', 'cecilia', 'lucia', 'clara', 'agnê', 'agnes', 'agata', 'agatha', 'hiêrônimô', 'inhaxiô', 'ignatiô', 
    'saviô', 'savio', 'bosco', 'luc', 'luca', 'mác-cô', 'maccro', 'mác cô', 'philipphê', 'philipe', 'philip', 
    'phê-rô', 'phao-lô', 'an-tôn', 'an-rê', 'đô-mi-ni-cô', 'dominico', 'daminh', 'albert', 'alberto', 'anastasia', 
    'augustino', 'augustine', 'baotixita', 'benedito', 'benedicto', 'bernardo', 'bruno', 'catherine', 'chính', 
    'cônelio', 'đamian', 'david', 'êlisabét', 'elizabeth', 'ê-li-sa-bét', 'emmanuel', 'immanuel', 'phêrô tự', 
    'tự', 'gregorio', 'giêrônimô', 'hilariô', 'y-nha-nho', 'inhaxio', 'isave', 'isabel', 'ê-đê', 'gioan kim khẩu', 
    'kim khẩu', 'giuse túc', 'túc', 'lêo', 'leo', 'lucas', 'lu-ca', 'luis', 'lu-y', 'luy', 'martin', 'martino', 
    'mát-thêu', 'maximiliano', 'nicolas', 'nicola', 'ni-cô-la', 'pascal', 'patricia', 'patrick', 'piô', 'pio', 
    'pô-ly-cáp', 'polycarp', 'raphael', 'robert', 'roberto', 'sebastian', 'sebastiano', 'stêphanô', 'stephan', 
    'stephen', 'têrêsa hài đồng', 'hài đồng', 'tô-ma', 'valerio', 'vinh sơn', 'vinhsơn', 'vincentê', 'vincente', 
    'ê-mi-li-a', 'emilia'
  ]

  // Kiểm tra 2 từ đầu (Gioan Baotixita, Đaminh Savio, Phanxicô Xaviê, v.v.)
  if (words.length > 2) {
    const firstTwo = (words[0] + ' ' + words[1]).toLowerCase()
    const firstTwoClean = firstTwo.replace(/\./g, '').trim()
    const doubleWordSaints = [
      'gioan baotixita', 'gioan b', 'đaminh savio', 'gioan bosco', 'phanxicô xaviê', 'phanxicô xavie'
    ]
    if (doubleWordSaints.includes(firstTwoClean) || firstTwoClean === 'g b') {
      return {
        holyName: words.slice(0, 2).join(' '),
        name: words.slice(2).join(' ')
      }
    }
  }

  // Kiểm tra 1 từ đầu
  const firstWord = words[0].toLowerCase()
  const cleanFirstWord = firstWord.replace(/[^a-zàáâãèéêìíòóôõùúăđĩũơưăâđêôơư]/g, '')
  if (commonHolyNames.includes(cleanFirstWord) || commonHolyNames.includes(firstWord)) {
    return {
      holyName: words[0],
      name: words.slice(1).join(' ')
    }
  }

  // Mặc định không có tên thánh
  return {
    holyName: '',
    name: fullName
  }
}


export type MeetingTask = { text: string; assignee: string; done: boolean }

export type BqtMeeting = {
  id: string
  title: string | null
  meeting_date: string
  attendees: string | null
  content: string | null
  tasks: MeetingTask[]
  created_at: string
  updated_at: string
}


export type BqtFinance = {
  id: string
  type: 'thu' | 'chi'
  entry_date: string
  amount: number
  category: string
  description: string | null
  partner_name: string | null
  created_at: string
}

export type BqtLegalDoc = {
  id: string
  title: string
  doc_type: string
  doc_number: string | null
  issued_by: string | null
  issued_date: string | null
  valid_until: string | null
  status: string
  file_url: string | null
  notes: string | null
  created_at: string
}

// ── Departments & Roles ───────────────────────────────────────────────────────

export type RoleDefinition = { role: string; duty: string }

export const DEPARTMENTS = [
  { key: 'thuong-truc',  label: 'Ban Thường trực',   badgeCls: 'bg-vatican-blue/10 text-vatican-blue', dotCls: 'bg-vatican-blue' },
  { key: 'kinh-nguyen',  label: 'Ban Kinh nguyện',   badgeCls: 'bg-purple-100 text-purple-700',        dotCls: 'bg-purple-500' },
  { key: 'hanh-huong',   label: 'Ban Hành hương',    badgeCls: 'bg-amber-100 text-amber-700',          dotCls: 'bg-amber-500' },
  { key: 'truyen-thong', label: 'Ban Truyền thông',  badgeCls: 'bg-emerald-100 text-emerald-700',      dotCls: 'bg-emerald-500' },
] as const

export const DEPARTMENT_ROLES: Record<string, RoleDefinition[]> = {
  'thuong-truc': [
    {
      role: 'Trưởng ban',
      duty: 'Đại diện toàn bộ cộng đồng Cha Trương Bửu Diệp, chủ trì các buổi họp BQT, phê duyệt kế hoạch hành hương và sự kiện lớn, ký kết hợp đồng với đối tác tour và nhà tài trợ, đưa ra quyết định cuối cùng khi có bất đồng nội bộ.',
    },
    {
      role: 'Phó ban Nội vụ',
      duty: 'Điều phối hoạt động nội bộ BQT, lên lịch và dẫn dắt các buổi họp tháng, theo dõi tiến độ công việc của từng ban, quản lý hồ sơ nhân sự BQT, thay quyền Trưởng ban khi vắng mặt trong các công việc nội bộ.',
    },
    {
      role: 'Phó ban Ngoại vụ',
      duty: 'Phụ trách toàn bộ mối quan hệ bên ngoài — đối tác công ty du lịch, các cộng đồng khác, nhà tài trợ, CTV affiliate. Tiếp nhận và phản hồi đề xuất hợp tác, đại diện cộng đồng trong các sự kiện liên cộng đồng.',
    },
    {
      role: 'Thủ quỹ',
      duty: 'Quản lý toàn bộ thu chi của cộng đồng — tiếp nhận tiền đóng góp, hành hương, tài trợ; chi trả các khoản theo phê duyệt của Ban Thường trực; lập báo cáo tài chính tháng minh bạch; bảo quản chứng từ; phân chia lợi nhuận cuối kỳ theo quy định đã thống nhất.',
    },
    {
      role: 'Thư ký',
      duty: 'Ghi chép và lưu trữ toàn bộ biên bản họp BQT; soạn thảo thông báo, quyết định và văn bản nội bộ; quản lý hồ sơ giấy tờ pháp lý của cộng đồng; theo dõi và nhắc nhở các đầu việc được giao trong từng phiên họp; là đầu mối tiếp nhận phản hồi từ thành viên cộng đồng gửi về BQT.',
    },
  ],
  'kinh-nguyen': [
    {
      role: 'Điều phối cầu nguyện',
      duty: 'Lập lịch và điều phối các buổi cầu nguyện trong cộng đồng, phân công người đọc kinh, chuẩn bị ý chỉ cầu nguyện theo mùa phụng vụ, thông báo lịch kinh lên app và mạng xã hội, phối hợp với ban Truyền thông để livestream và ghi hình.',
    },
    {
      role: 'Hỗ trợ phụng vụ',
      duty: 'Chuẩn bị vật dụng phụng vụ (nến, hoa, ảnh Cha) trước các buổi kinh và sự kiện của cộng đồng, liên hệ cha xứ hoặc linh mục đồng hành khi cần chủ lễ, chuẩn bị và sắp xếp không gian cầu nguyện cho mọi hoạt động tâm linh.',
    },
  ],
  'hanh-huong': [
    {
      role: 'Trưởng ban Hành hương',
      duty: 'Lập kế hoạch tổng thể cho các chuyến hành hương: lịch trình, điểm đến, ngân sách dự toán; điều phối toàn bộ thành viên trong ban từ giai đoạn chuẩn bị đến khi kết thúc chuyến đi; báo cáo kết quả từng đợt lên Ban Thường trực.',
    },
    {
      role: 'Điều phối đối tác',
      duty: 'Liên hệ và đàm phán hợp đồng với các đơn vị cung cấp dịch vụ vận chuyển, lưu trú; quản lý danh sách CTV affiliate giới thiệu người tham gia; theo dõi và đối soát hoa hồng với từng đối tác; tìm kiếm và mở rộng mạng lưới đối tác mới.',
    },
    {
      role: 'Hậu cần & Logistics',
      duty: 'Đảm bảo toàn bộ hậu cần cho đoàn — phân phòng nghỉ, bố trí ăn uống, chuẩn bị vật phẩm hành hương, phối hợp với đơn vị vận chuyển; bố trí thuốc men cơ bản; xử lý các tình huống phát sinh trong chuyến đi.',
    },
    {
      role: 'Quản lý đăng ký & Thu chi',
      duty: 'Tiếp nhận và xác nhận đăng ký tham gia qua app và mạng xã hội, thu phí hành hương, theo dõi danh sách đã đóng và chưa đóng tiền, xử lý hoàn tiền khi hủy, lập bảng công nợ sau mỗi chuyến và bàn giao đầy đủ chứng từ cho Ban Thường trực.',
    },
  ],
  'truyen-thong': [
    {
      role: 'Trưởng ban Truyền thông',
      duty: 'Xây dựng chiến lược nội dung tổng thể cho app và mạng xã hội; lên lịch đăng bài hàng tuần; duyệt nội dung trước khi đăng; theo dõi chỉ số tương tác và đề xuất cải thiện; phối hợp với các ban để truyền thông cho sự kiện, hành hương và các hoạt động cộng đồng.',
    },
    {
      role: 'MC',
      duty: 'Dẫn dắt các buổi kinh, lễ tưởng niệm, sự kiện hành hương và chương trình cộng đồng; chuẩn bị kịch bản dẫn chương trình; phụ trách dẫn livestream trực tiếp; làm cầu nối giữa cộng đoàn và các hoạt động trên sân khấu.',
    },
    {
      role: 'Kỹ thuật âm thanh & Livestream',
      duty: 'Vận hành toàn bộ hệ thống âm thanh, ánh sáng trong các buổi kinh và sự kiện; thiết lập và duy trì livestream lên app và mạng xã hội; xử lý sự cố kỹ thuật phát sinh; bảo quản và kiểm tra thiết bị định kỳ.',
    },
    {
      role: 'Hình ảnh & Video',
      duty: 'Quay phim và chụp ảnh các buổi kinh, chuyến hành hương và sự kiện cộng đồng; biên tập video recap, reels, shorts đăng lên app và mạng xã hội; lưu trữ và quản lý kho ảnh/video của cộng đồng; thiết kế ảnh bìa, poster sự kiện khi cần.',
    },
  ],
}

export function getRoleDuty(department: string, roleName: string): string {
  return DEPARTMENT_ROLES[department]?.find(r => r.role === roleName)?.duty ?? ''
}

