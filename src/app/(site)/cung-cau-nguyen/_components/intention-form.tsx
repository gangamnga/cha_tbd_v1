"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CATEGORIES } from "@/data/testimonies";

export function IntentionForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleReset = () => {
    setName(""); setPhone(""); setLocation(""); setSelectedCategories([]);
    setContent(""); setError(null); setSubmitted(false);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.from("prayer_intentions").insert([{
      name: name.trim() || null,
      phone: phone.trim() || null,
      location: location.trim() || null,
      categories: selectedCategories,
      content: content.trim(),
      status: "pending",
    }]);
    setSubmitting(false);
    if (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white flex flex-col items-center justify-center gap-4 py-12 px-6 text-center rounded-lg min-h-[260px]">
        <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
        <h3 className="font-bold text-[18px] text-vatican-dark">Cảm ơn bạn đã gửi ý chỉ!</h3>
        <p className="text-[18px] text-gray-600 leading-relaxed max-w-md">
          Ý chỉ của bạn sẽ được dâng lên trong buổi cầu nguyện tối thứ Năm hàng tuần.
        </p>
        <button type="button" onClick={handleReset}
          className="mt-2 text-[16px] font-bold text-vatican-blue hover:underline transition-colors">
          Gửi thêm ý chỉ khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-white flex flex-col gap-0 divide-y divide-gray-100 rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        <div className="flex-1 flex flex-col px-4 py-2.5 gap-1 focus-within:bg-blue-50/30 transition-colors">
          <label htmlFor="ccn-name" className="text-[16px] font-bold uppercase tracking-wide text-gray-500">Họ và tên</label>
          <input id="ccn-name" type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Tên của bạn (hoặc ẩn danh)"
            className="text-[18px] text-vatican-dark placeholder:text-gray-300 outline-none bg-transparent" />
        </div>
        <div className="flex-1 flex flex-col px-4 py-2.5 gap-1 focus-within:bg-blue-50/30 transition-colors">
          <label htmlFor="ccn-phone" className="text-[16px] font-bold uppercase tracking-wide text-gray-500">Số điện thoại</label>
          <input id="ccn-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="0901 234 567"
            className="text-[18px] text-vatican-dark placeholder:text-gray-300 outline-none bg-transparent" />
        </div>
        <div className="flex-1 flex flex-col px-4 py-2.5 gap-1 focus-within:bg-blue-50/30 transition-colors">
          <label htmlFor="ccn-location" className="text-[16px] font-bold uppercase tracking-wide text-gray-500">Địa phương</label>
          <input id="ccn-location" type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="Tỉnh / Thành phố"
            className="text-[18px] text-vatican-dark placeholder:text-gray-300 outline-none bg-transparent" />
        </div>
      </div>

      <div className="flex flex-col px-4 py-2.5 gap-1.5">
        <label className="text-[16px] font-bold uppercase tracking-wide text-gray-500">
          Loại ý chỉ{" "}<span className="normal-case font-normal text-gray-400">(có thể chọn nhiều)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
          {CATEGORIES.filter((c) => c.value !== "tat-ca").map((cat) => (
            <label key={cat.value} className="flex items-center gap-2.5 cursor-pointer group py-1">
              <input type="checkbox" value={cat.label}
                checked={selectedCategories.includes(cat.label)}
                onChange={() => toggleCategory(cat.label)}
                className="w-5 h-5 accent-vatican-blue cursor-pointer shrink-0" />
              <span className="text-[16px] font-bold text-vatican-dark group-hover:text-vatican-blue transition-colors leading-snug">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col px-4 py-2.5 gap-1 focus-within:bg-blue-50/30 transition-colors">
        <label htmlFor="ccn-content" className="text-[16px] font-bold uppercase tracking-wide text-gray-500">
          Ý chỉ cầu nguyện <span className="text-red-500">*</span>
        </label>
        <textarea id="ccn-content" rows={3} required value={content} onChange={e => setContent(e.target.value)}
          placeholder="Mô tả điều bạn muốn cầu nguyện..."
          className="text-[18px] text-vatican-dark placeholder:text-gray-300 outline-none bg-transparent resize-none leading-relaxed" />
      </div>

      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex-1">
          {error ? (
            <p className="flex items-center gap-2 text-[16px] text-red-600 font-semibold">
              <AlertCircle size={15} /> {error}
            </p>
          ) : (
            <p className="text-[16px] text-gray-400 leading-snug">
              Ý chỉ sẽ được dâng lên vào buổi cầu nguyện tối thứ Năm hàng tuần.
            </p>
          )}
        </div>
        <button type="submit" disabled={submitting}
          className="shrink-0 flex items-center gap-2 bg-vatican-blue text-white font-semibold px-6 py-2 text-[16px] hover:bg-vatican-blue-dark transition-colors rounded-lg disabled:opacity-60">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2.5} />}
          {submitting ? "Đang gửi..." : "Gửi đi"}
        </button>
      </div>
    </form>
  );
}
