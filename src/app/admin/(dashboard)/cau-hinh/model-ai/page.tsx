import { Bot } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { ComingSoonBlock } from '@/components/admin/ComingSoonBlock'

export default function ModelAIPage() {
  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Model AI" icon={<Bot size={18} strokeWidth={2.5} />}>
        <ComingSoonBlock
          icon={Bot}
          title="Cấu hình Mô hình AI"
          description="Tích hợp và cấu hình trí tuệ nhân tạo hỗ trợ chatbot trả lời tự động, phân loại nội dung và tư vấn hành hương."
          features={[
            { label: 'Kết nối API Anthropic / OpenAI', note: 'chọn model phù hợp với ngân sách' },
            { label: 'Quản lý Prompt templates', note: 'tuỳ chỉnh ngữ điệu và kiến thức nền' },
            { label: 'Chatbot hỗ trợ khách hành hương', note: 'trả lời câu hỏi thường gặp 24/7' },
            { label: 'Phân tích & phân loại lời chứng', note: 'gợi ý danh mục tự động' },
            { label: 'Lịch sử hội thoại & thống kê', note: 'theo dõi chất lượng phản hồi' },
          ]}
        />
      </AdminCard>
    </div>
  )
}
