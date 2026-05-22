import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/utils/supabase/server'
import { slugify } from '@/utils/slugify'

// Initialize RSS Parser
const parser = new Parser()

export async function GET(request: Request) {
  // 1. Bảo mật Cron Job (Chỉ cho phép Vercel Cron hoặc request có kèm mã bí mật chạy)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || !authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // 2. Lấy Cấu hình Bot từ Database
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (!settings || !settings.gemini_api_key) {
      return NextResponse.json({ success: false, error: 'Chưa cài đặt Gemini API Key trong hệ thống Admin.' }, { status: 400 })
    }

    const feedUrl = settings.rss_feed_url || 'https://www.vaticannews.va/vi.rss.xml'
    
    // Khởi tạo Gemini bằng Key từ Database
    const ai = new GoogleGenAI({
      apiKey: settings.gemini_api_key
    })

    // 3. Cào tin từ RSS
    const feed = await parser.parseURL(feedUrl)

    // Lấy 3 tin mới nhất để kiểm tra và xử lý
    const recentItems = feed.items.slice(0, 3)
    let processedCount = 0

    for (const item of recentItems) {
      if (!item.title || !item.link) continue;

      // Kiểm tra xem bài này đã cào chưa (dựa vào title)
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('title', item.title)
        .single()

      if (existing) {
        continue; // Bỏ qua nếu đã có
      }

      // 4. Nếu là bài mới -> Đưa cho AI viết lại
      const originalTitle = item.title
      const originalContent = item.contentSnippet || item.content || "Không có nội dung."
      
      const prompt = `
        Tôi có một bản tin Công Giáo như sau:
        Tiêu đề: ${originalTitle}
        Nội dung: ${originalContent}

        Hãy thực hiện 3 việc:
        1. Viết lại một "Tiêu đề" mới, hấp dẫn hơn nhưng giữ nguyên ý nghĩa cốt lõi.
        2. Viết một "Tóm tắt" khoảng 2-3 câu.
        3. Viết lại "Nội dung bài viết" dưới dạng HTML (dùng thẻ <p>, <strong>, <h2>) để có thể hiển thị trực tiếp lên web. Nội dung cần đầy đủ, mạch lạc và mang văn phong chuyên nghiệp của báo Công Giáo.

        Chỉ trả về duy nhất chuỗi JSON với định dạng sau (không markdown, không thêm chữ gì khác):
        {
          "title": "Tiêu đề mới",
          "summary": "Tóm tắt mới",
          "content": "Nội dung HTML"
        }
      `

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      })

      const aiText = response.text || ""
      
      let aiResult;
      try {
        const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim()
        aiResult = JSON.parse(cleanJson)
      } catch (e) {
        continue;
      }

      const slug = slugify(aiResult.title) + '-' + Math.floor(Math.random() * 1000)

      // 5. Lưu vào Supabase với trạng thái 'draft' (Bản nháp)
      await supabase.from('articles').insert([{
        title: aiResult.title,
        slug: slug,
        summary: aiResult.summary,
        content: aiResult.content,
        status: 'draft',
        thumbnail_url: '', 
        created_at: new Date().toISOString(),
      }])

      processedCount++
    }

    return NextResponse.json({ 
      success: true, 
      message: `Đã cào và dùng AI viết lại ${processedCount} bài viết mới thành công. Các bài đều nằm ở dạng Bản Nháp chờ duyệt.`
    })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
