import { Shield } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { ComingSoonBlock } from '@/components/admin/ComingSoonBlock'

export default function PhanQuyenPage() {
  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Phân Quyền" icon={<Shield size={18} strokeWidth={2.5} />}>
        <ComingSoonBlock
          icon={Shield}
          title="Quản lý phân quyền Admin"
          description="Cấp phép và quản lý vai trò cho các thành viên Ban quản trị, giới hạn quyền truy cập theo từng chức năng."
          features={[
            { label: 'Danh sách tài khoản quản trị', note: 'thêm / khoá / xoá tài khoản' },
            { label: 'Phân vai trò linh hoạt', note: 'Super Admin, Editor, Viewer...' },
            { label: 'Giới hạn quyền theo trang', note: 'ví dụ: chỉ được chỉnh sửa lời chứng' },
            { label: 'Lịch sử đăng nhập & hoạt động', note: 'audit log cho mọi thay đổi quan trọng' },
          ]}
        />
      </AdminCard>
    </div>
  )
}
