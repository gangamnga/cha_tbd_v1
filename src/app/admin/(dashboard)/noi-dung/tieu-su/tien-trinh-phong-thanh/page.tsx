import { createClient } from '@/utils/supabase/server'
import { BeatificationEditor } from '../_components/BeatificationEditor'
import { AdminCard } from '@/components/admin/AdminCard'
import { Crown } from 'lucide-react'

export default async function TienTrinhPhongThanhPage() {
  const supabase = await createClient()
  const { data: steps } = await supabase.from('canonization_steps').select('*').order('sort_order')

  return (
    <div className="w-full max-w-[1400px] mx-auto px-5 py-8">
      <AdminCard title="Tiến Trình Phong Thánh" icon={<Crown size={16} strokeWidth={2.5} />}>
        <div className="p-[20px] flex flex-col gap-5">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              Sau khi được tuyên phong <strong className="text-vatican-dark">Chân Phước</strong>, bước tiếp theo để được tôn phong{' '}
              <strong className="text-vatican-dark">Hiển Thánh</strong> đòi hỏi Giáo hội xác nhận thêm{' '}
              <strong className="text-vatican-dark">một phép lạ mới</strong> — xảy ra sau ngày lễ phong Chân Phước —
              nhờ lời chuyển cầu của Ngài. Phép lạ này phải vượt qua hai vòng thẩm định chặt chẽ:{' '}
              hội đồng y khoa quốc tế và hội đồng thần học, trước khi Đức Giáo Hoàng ký sắc lệnh phong Thánh.
              Hành trình này không có thời hạn định sẵn — có thể vài năm, cũng có thể lâu hơn.
            </p>
            <p className="text-sm md:text-base text-vatican-blue font-semibold leading-relaxed mt-3">
              Xin mọi tín hữu hãy kiên trì cầu nguyện và tin tưởng vào sự chuyển cầu của{' '}
              Cha Phanxicô Trương Bửu Diệp, để Thiên Chúa sớm tỏ bày dấu chỉ kỳ diệu,
              và Ngài sớm được tôn vinh trên toàn thể Giáo hội hoàn vũ.
            </p>
          </div>

          <BeatificationEditor steps={steps ?? []} tableName="canonization_steps" />
        </div>
      </AdminCard>
    </div>
  )
}
