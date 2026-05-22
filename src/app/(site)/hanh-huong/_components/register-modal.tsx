"use client";

import { useState } from "react";
import { UserPlus, X, CheckCircle, AlertCircle, Minus, Plus } from "lucide-react";
import type { PilgrimageTrip } from "@/data/pilgrimages";
import { createClient } from "@/utils/supabase/client";

export function RegisterModal({ trip, onClose }: { trip: PilgrimageTrip; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [numPeople, setNumPeople] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.from("pilgrimage_registrations").insert([{
      name: name.trim(),
      phone: phone.trim(),
      num_people: numPeople,
      notes: notes.trim(),
      trip_id: trip.id ?? null,
      trip_title: trip.title,
      trip_dates: trip.dates,
      status: "pending",
    }]);
    setSubmitting(false);
    if (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
            <h3 className="font-bold text-[18px] text-vatican-dark">Đăng ký thành công!</h3>
            <p className="text-[16px] text-gray-500 leading-relaxed">
              Chúng tôi sẽ liên hệ xác nhận sớm nhất.
            </p>
            <button onClick={onClose}
              className="mt-2 text-[16px] font-bold text-vatican-blue hover:underline transition-colors">
              Đóng
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2 mb-5">
              <div>
                <h3 className="font-bold text-[18px] text-vatican-dark leading-snug">{trip.title}</h3>
                <p className="text-[16px] text-gray-500 mt-0.5">{trip.dates}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[16px] font-bold uppercase tracking-wide text-gray-500">Họ và tên</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-[16px] text-vatican-dark placeholder:text-gray-300 outline-none focus:border-vatican-blue transition-colors" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[16px] font-bold uppercase tracking-wide text-gray-500">Số điện thoại</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-[16px] text-vatican-dark placeholder:text-gray-300 outline-none focus:border-vatican-blue transition-colors" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[16px] font-bold uppercase tracking-wide text-gray-500">Số người đi cùng</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setNumPeople(p => Math.max(1, p - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="text-[18px] font-bold text-vatican-dark w-8 text-center">{numPeople}</span>
                  <button type="button" onClick={() => setNumPeople(p => p + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[16px] font-bold uppercase tracking-wide text-gray-500">Ghi chú <span className="text-gray-300 normal-case font-normal">(tuỳ chọn)</span></label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Yêu cầu đặc biệt, có người cao tuổi..."
                  rows={2}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-[16px] text-vatican-dark placeholder:text-gray-300 outline-none focus:border-vatican-blue transition-colors resize-none" />
              </div>
              {error && (
                <p className="flex items-center gap-2 text-[16px] text-red-600 font-semibold">
                  <AlertCircle size={14} /> {error}
                </p>
              )}
              <button type="submit" disabled={submitting}
                className="mt-1 w-full flex items-center justify-center gap-2 bg-vatican-blue text-white font-bold py-2.5 rounded-lg text-[16px] hover:bg-vatican-blue-dark transition-colors disabled:opacity-60">
                <UserPlus size={16} strokeWidth={2.5} />
                {submitting ? "Đang gửi..." : "Xác nhận đăng ký"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
