import { Images } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { ComingSoonBlock } from '@/components/admin/ComingSoonBlock'

export default function ThuVienPage() {
  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Thư Viện" icon={<Images size={18} strokeWidth={2.5} />}>
        <ComingSoonBlock
          icon={Images}
          title="Thư viện ảnh & Media"
          description="Quản lý tập trung toàn bộ hình ảnh, video và tài nguyên media được sử dụng trên website."
          features={[
            { label: 'Upload & tổ chức ảnh', note: 'theo album, sự kiện, năm' },
            { label: 'Tìm kiếm & lọc media', note: 'theo tag, ngày, dung lượng' },
            { label: 'Trình chỉnh sửa ảnh nhẹ', note: 'crop, resize, đổi tên' },
            { label: 'Quản lý dung lượng lưu trữ', note: 'theo dõi quota Supabase Storage' },
          ]}
        />
      </AdminCard>
    </div>
  )
}
