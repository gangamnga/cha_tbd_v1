import { Palette } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { ComingSoonBlock } from '@/components/admin/ComingSoonBlock'

export default function NhanDienPage() {
  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Bộ Nhận Diện" icon={<Palette size={18} strokeWidth={2.5} />}>
        <ComingSoonBlock
          icon={Palette}
          title="Bộ nhận diện cộng đồng"
          description="Quản lý nhận diện thương hiệu của cộng đồng Cha Trương Bửu Diệp: logo, màu sắc, font chữ và tài liệu brand guidelines."
          features={[
            { label: 'Logo chính thức & các biến thể', note: 'file SVG, PNG độ phân giải cao' },
            { label: 'Bảng màu thương hiệu', note: 'Vatican Blue, vàng và các màu phụ' },
            { label: 'Bộ font chữ', note: 'quy định font tiêu đề và nội dung' },
            { label: 'Brand guidelines', note: 'hướng dẫn sử dụng đúng nhận diện' },
            { label: 'Tài nguyên tải về', note: 'chia sẻ cho cộng tác viên và đối tác' },
          ]}
        />
      </AdminCard>
    </div>
  )
}
