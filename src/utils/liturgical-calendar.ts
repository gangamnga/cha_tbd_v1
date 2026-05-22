// Liturgical Calendar Generator for the Roman Catholic Church (Vietnam)
// Automatically computes moveable feasts from Easter for any year.
// Fixed feasts are hardcoded (same date every year).
// Vietnam adaptations: Ascension moved Thu→Sun, Corpus Christi moved Thu→Sun.

export type FeastLevel = "solemnity" | "feast" | "memorial" | "optional" | "special";

export interface FeastDay {
  day: number;
  name: string;
  level: FeastLevel;
  note?: string;
}

export interface MonthData {
  number: number;
  name: string;
  feasts: FeastDay[];
}

export const feastLevelLabel: Record<FeastLevel, string> = {
  solemnity: "Lễ Trọng",
  feast: "Lễ Kính",
  memorial: "Lễ Nhớ",
  optional: "Tùy Ý",
  special: "Đặc Biệt",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Anonymous Gregorian algorithm (Meeus/Jones/Butcher) — verified correct.
function computeEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// First Sunday of Advent = Sunday within Nov 27–Dec 3.
function computeAdvent1(year: number): Date {
  const nov27 = new Date(year, 10, 27);
  const dow = nov27.getDay(); // 0 = Sunday
  return addDays(nov27, dow === 0 ? 0 : 7 - dow);
}

// ─── Fixed feasts (same date every year) ─────────────────────────────────────

interface FixedFeast {
  month: number;
  day: number;
  name: string;
  level: FeastLevel;
  note?: string;
}

const FIXED_FEASTS: FixedFeast[] = [
  // January
  { month: 1, day: 1,  name: "Đức Maria Mẹ Thiên Chúa (Tết Dương Lịch)", level: "solemnity" },
  { month: 1, day: 2,  name: "Thánh Basiliô Cả và Grêgôriô Nazianzênô, Giám Mục Tiến Sĩ", level: "memorial" },
  { month: 1, day: 17, name: "Thánh Antôn, Viện Phụ", level: "memorial" },
  { month: 1, day: 21, name: "Thánh Anêt, Trinh Nữ Tử Đạo", level: "memorial" },
  { month: 1, day: 24, name: "Thánh Phanxicô Salê, Giám Mục Tiến Sĩ", level: "memorial" },
  { month: 1, day: 25, name: "Lễ Thánh Phaolô Tông Đồ Trở Lại", level: "feast" },
  { month: 1, day: 26, name: "Thánh Timôthê và Titô, Giám Mục", level: "memorial" },
  { month: 1, day: 28, name: "Thánh Tôma Aquinô, Linh Mục Tiến Sĩ", level: "memorial" },
  { month: 1, day: 31, name: "Thánh Gioan Boscô, Linh Mục", level: "memorial" },
  // February
  { month: 2, day: 2,  name: "Lễ Dâng Chúa Giêsu Vào Đền Thánh (Ngày Đời Sống Thánh Hiến)", level: "feast" },
  { month: 2, day: 5,  name: "Thánh Agatha, Trinh Nữ Tử Đạo", level: "memorial" },
  { month: 2, day: 6,  name: "Thánh Phaolô Miki và Các Bạn Tử Đạo", level: "memorial" },
  { month: 2, day: 10, name: "Thánh Scôlastica, Trinh Nữ", level: "memorial" },
  { month: 2, day: 11, name: "Đức Maria Lộ Đức (Ngày Bệnh Nhân Thế Giới)", level: "optional" },
  { month: 2, day: 14, name: "Thánh Cyrillô, Tu Sĩ và Mêtôđiô, Giám Mục", level: "memorial" },
  { month: 2, day: 22, name: "Lễ Ngai Tòa Thánh Phêrô Tông Đồ", level: "feast" },
  { month: 2, day: 23, name: "Thánh Pôlicarphô, Giám Mục Tử Đạo", level: "memorial" },
  // March
  { month: 3, day: 7,  name: "Thánh Pêrpêtua và Phelicita, Tử Đạo", level: "memorial" },
  { month: 3, day: 17, name: "Thánh Patrikio, Giám Mục", level: "optional" },
  { month: 3, day: 19, name: "Thánh Giuse, Bạn Trăm Năm Đức Maria", level: "solemnity" },
  { month: 3, day: 25, name: "Lễ Truyền Tin", level: "solemnity" },
  // April
  { month: 4, day: 11, name: "Thánh Stanislao, Giám Mục Tử Đạo", level: "memorial" },
  { month: 4, day: 25, name: "Thánh Marcô, Thánh Sử", level: "feast" },
  { month: 4, day: 29, name: "Thánh Catarina Siena, Trinh Nữ Tiến Sĩ", level: "memorial" },
  // May
  { month: 5, day: 1,  name: "Thánh Giuse Thợ (Ngày Lao Động Quốc Tế)", level: "optional" },
  { month: 5, day: 2,  name: "Thánh Athanasiô, Giám Mục Tiến Sĩ", level: "memorial" },
  { month: 5, day: 3,  name: "Thánh Philipphê và Giacôbê, Tông Đồ", level: "feast" },
  { month: 5, day: 13, name: "Đức Mẹ Fatima", level: "optional" },
  { month: 5, day: 14, name: "Thánh Matthia, Tông Đồ", level: "feast" },
  { month: 5, day: 26, name: "Thánh Philip Nêri, Linh Mục", level: "memorial" },
  // June
  { month: 6, day: 1,  name: "Thánh Justin, Tử Đạo", level: "memorial" },
  { month: 6, day: 3,  name: "Thánh Carôlô Lwanga và Các Bạn Tử Đạo Uganda", level: "memorial" },
  { month: 6, day: 5,  name: "Thánh Bônifaciô, Giám Mục Tử Đạo", level: "memorial" },
  { month: 6, day: 11, name: "Thánh Barnabê, Tông Đồ", level: "memorial" },
  { month: 6, day: 13, name: "Thánh Antôn Pađôva, Linh Mục Tiến Sĩ", level: "memorial" },
  { month: 6, day: 21, name: "Thánh Aloysiô Gonzaga, Tu Sĩ", level: "memorial" },
  { month: 6, day: 24, name: "Lễ Sinh Nhật Thánh Gioan Tẩy Giả", level: "solemnity" },
  { month: 6, day: 28, name: "Thánh Irênê, Giám Mục Tử Đạo", level: "memorial" },
  { month: 6, day: 29, name: "Thánh Phêrô và Thánh Phaolô, Tông Đồ", level: "solemnity" },
  // July
  { month: 7, day: 3,  name: "Thánh Tôma, Tông Đồ", level: "feast" },
  { month: 7, day: 11, name: "Thánh Bênêđictô, Viện Phụ (Bổn mạng Châu Âu)", level: "memorial" },
  { month: 7, day: 15, name: "Thánh Bônaventura, Giám Mục Tiến Sĩ", level: "memorial" },
  { month: 7, day: 16, name: "Đức Mẹ Núi Carmêlô", level: "optional" },
  { month: 7, day: 22, name: "Thánh Maria Mađalêna", level: "feast" },
  { month: 7, day: 25, name: "Thánh Giacôbê, Tông Đồ", level: "feast" },
  { month: 7, day: 26, name: "Thánh Gioakim và Anna, Song Thân Đức Trinh Nữ Maria", level: "memorial" },
  { month: 7, day: 29, name: "Thánh Marta, Maria và Lazarô", level: "memorial" },
  { month: 7, day: 31, name: "Thánh Ignatiô Loyola, Linh Mục", level: "memorial" },
  // August
  { month: 8, day: 1,  name: "Thánh Alphonsô Maria de' Liguori, Giám Mục Tiến Sĩ", level: "memorial" },
  { month: 8, day: 4,  name: "Thánh Gioan Maria Vianney, Linh Mục (Bổn Mạng Linh Mục)", level: "memorial" },
  { month: 8, day: 6,  name: "Lễ Chúa Hiển Dung", level: "feast" },
  { month: 8, day: 8,  name: "Thánh Đôminicô, Linh Mục", level: "memorial" },
  { month: 8, day: 10, name: "Thánh Laurensô, Phó Tế Tử Đạo", level: "feast" },
  { month: 8, day: 11, name: "Thánh Clara, Trinh Nữ", level: "memorial" },
  { month: 8, day: 14, name: "Thánh Maximilianô Maria Kolbe, Linh Mục Tử Đạo", level: "memorial" },
  { month: 8, day: 15, name: "Lễ Đức Mẹ Hồn Xác Lên Trời", level: "solemnity", note: "Tháng 8: kính Trái Tim Vô Nhiễm Đức Mẹ" },
  { month: 8, day: 20, name: "Thánh Bênađô, Viện Phụ Tiến Sĩ", level: "memorial" },
  { month: 8, day: 21, name: "Thánh Piô X, Giáo Hoàng", level: "memorial" },
  { month: 8, day: 22, name: "Đức Trinh Nữ Maria Nữ Vương", level: "memorial" },
  { month: 8, day: 24, name: "Thánh Bartôlômêô, Tông Đồ", level: "feast" },
  { month: 8, day: 27, name: "Thánh Monica", level: "memorial" },
  { month: 8, day: 28, name: "Thánh Augustinô, Giám Mục Tiến Sĩ", level: "memorial" },
  { month: 8, day: 29, name: "Lễ Thánh Gioan Tẩy Giả Bị Trảm Quyết", level: "memorial" },
  // September
  { month: 9, day: 3,  name: "Thánh Grêgôriô Cả, Giáo Hoàng Tiến Sĩ", level: "memorial" },
  { month: 9, day: 5,  name: "Thánh Teresa Calcutta, Trinh Nữ", level: "optional" },
  { month: 9, day: 8,  name: "Lễ Sinh Nhật Đức Trinh Nữ Maria", level: "feast" },
  { month: 9, day: 13, name: "Thánh Gioan Chrysostomô, Giám Mục Tiến Sĩ", level: "memorial" },
  { month: 9, day: 14, name: "Lễ Suy Tôn Thánh Giá", level: "feast" },
  { month: 9, day: 15, name: "Đức Mẹ Sầu Bi", level: "memorial" },
  { month: 9, day: 16, name: "Thánh Corneliô, Giáo Hoàng Tử Đạo và Cyprianô, Giám Mục Tử Đạo", level: "memorial" },
  { month: 9, day: 20, name: "Thánh Andrêa Kim Taegon và Các Bạn Tử Đạo Triều Tiên", level: "memorial" },
  { month: 9, day: 21, name: "Thánh Matthêô, Tông Đồ Thánh Sử", level: "feast" },
  { month: 9, day: 23, name: "Thánh Piô thành Pietrelcina (Padre Pio), Linh Mục", level: "memorial" },
  { month: 9, day: 27, name: "Thánh Vinh Sơn Phaolô, Linh Mục", level: "memorial" },
  { month: 9, day: 29, name: "Thánh Micae, Gabrien và Raphael, Tổng Lãnh Thiên Thần", level: "feast" },
  { month: 9, day: 30, name: "Thánh Giêrônimô, Linh Mục Tiến Sĩ", level: "memorial" },
  // October
  { month: 10, day: 1,  name: "Thánh Têrêxa Hài Đồng Giêsu, Trinh Nữ Tiến Sĩ", level: "memorial" },
  { month: 10, day: 2,  name: "Các Thiên Thần Bản Mệnh", level: "memorial" },
  { month: 10, day: 4,  name: "Thánh Phanxicô Assisi (Bổn mạng Môi Sinh)", level: "memorial" },
  { month: 10, day: 7,  name: "Đức Mẹ Mân Côi (Tháng 10: Tháng Mân Côi)", level: "memorial" },
  { month: 10, day: 15, name: "Thánh Têrêxa Avila, Trinh Nữ Tiến Sĩ", level: "memorial" },
  { month: 10, day: 17, name: "Thánh Ignatiô Antiôkia, Giám Mục Tử Đạo", level: "memorial" },
  { month: 10, day: 18, name: "Thánh Luca, Thánh Sử", level: "feast" },
  { month: 10, day: 28, name: "Thánh Simôn và Giuđa, Tông Đồ", level: "feast" },
  // November
  { month: 11, day: 1,  name: "Lễ Các Thánh Nam Nữ", level: "solemnity" },
  { month: 11, day: 2,  name: "Lễ Cầu Hồn – Các Đẳng Linh Hồn", level: "solemnity" },
  { month: 11, day: 4,  name: "Thánh Carôlô Borrômeo, Giám Mục", level: "memorial" },
  { month: 11, day: 9,  name: "Lễ Cung Hiến Thánh Đường Latêranô", level: "feast" },
  { month: 11, day: 10, name: "Thánh Lêô Cả, Giáo Hoàng Tiến Sĩ", level: "memorial" },
  { month: 11, day: 11, name: "Thánh Martin Tours, Giám Mục", level: "memorial" },
  { month: 11, day: 12, name: "Thánh Josafat, Giám Mục Tử Đạo", level: "memorial" },
  { month: 11, day: 17, name: "Thánh Êlisabét Hungaria, Nữ Tu", level: "memorial" },
  { month: 11, day: 21, name: "Đức Maria Dâng Mình Vào Đền Thánh", level: "memorial" },
  { month: 11, day: 24, name: "Thánh Anrê Dũng Lạc, Linh Mục và Các Bạn Tử Đạo Việt Nam", level: "feast", note: "Bổn Mạng Giáo Hội Việt Nam" },
  { month: 11, day: 30, name: "Thánh Anrê, Tông Đồ", level: "feast" },
  // December
  { month: 12, day: 3,  name: "Thánh Phanxicô Xaviê, Linh Mục (Bổn Mạng Truyền Giáo Á Đông)", level: "memorial" },
  { month: 12, day: 7,  name: "Thánh Ambrôsiô, Giám Mục Tiến Sĩ", level: "memorial" },
  { month: 12, day: 8,  name: "Lễ Đức Mẹ Vô Nhiễm Nguyên Tội", level: "solemnity", note: "Lễ Trọng Buộc" },
  { month: 12, day: 12, name: "Đức Mẹ Guadalupe", level: "optional" },
  { month: 12, day: 13, name: "Thánh Lucia, Trinh Nữ Tử Đạo", level: "memorial" },
  { month: 12, day: 14, name: "Thánh Gioan Thánh Giá, Linh Mục Tiến Sĩ", level: "memorial" },
  { month: 12, day: 25, name: "Lễ Giáng Sinh – Chúa Giêsu Giáng Trần", level: "solemnity", note: "Lễ Trọng Buộc. 3 Thánh Lễ: Đêm, Rạng Đông, Ban Ngày" },
  { month: 12, day: 26, name: "Thánh Têphanô, Phó Tế Tử Đạo (Tử Đạo Đầu Tiên)", level: "feast" },
  { month: 12, day: 27, name: "Thánh Gioan, Tông Đồ Thánh Sử", level: "feast" },
  { month: 12, day: 28, name: "Các Thánh Anh Hài Tử Đạo", level: "feast" },
  { month: 12, day: 31, name: "Thánh Sylvestro I, Giáo Hoàng", level: "optional" },
];

// ─── Moveable feasts (offset in days from Easter Sunday) ─────────────────────
// Vietnam: Ascension moved Thu(+39) → Sun(+42), Corpus Christi Thu(+60) → Sun(+63)

interface MoveableFeast {
  offset: number;
  name: string;
  level: FeastLevel;
  note?: string;
}

const EASTER_RELATIVE_FEASTS: MoveableFeast[] = [
  { offset: -46, name: "Thứ Tư Lễ Tro – Bắt Đầu Mùa Chay", level: "solemnity", note: "Ăn chay kiêng thịt bắt buộc" },
  { offset: -7,  name: "Chúa Nhật Lễ Lá – Tuần Thánh", level: "solemnity", note: "Tưởng niệm Chúa vào thành Giêrusalem" },
  { offset: -3,  name: "Thứ Năm Tuần Thánh – Thánh Lễ Tiệc Ly", level: "solemnity" },
  { offset: -2,  name: "Thứ Sáu Tuần Thánh – Chúa Chịu Nạn", level: "solemnity", note: "Ăn chay kiêng thịt bắt buộc. Không cử hành Thánh Lễ" },
  { offset: -1,  name: "Thứ Bảy Tuần Thánh – Vọng Phục Sinh", level: "solemnity", note: "Lễ Vọng Phục Sinh tối" },
  { offset: 0,   name: "Chúa Nhật Phục Sinh – Lễ Trọng Nhất Năm Phụng Vụ", level: "solemnity" },
  { offset: 1,   name: "Thứ Hai Bát Nhật Phục Sinh", level: "solemnity" },
  { offset: 2,   name: "Thứ Ba Bát Nhật Phục Sinh", level: "solemnity" },
  { offset: 7,   name: "Chúa Nhật II Phục Sinh – Lễ Kính Lòng Thương Xót Chúa", level: "solemnity" },
  { offset: 42,  name: "Lễ Thăng Thiên – Chúa Giêsu Lên Trời", level: "solemnity", note: "Chúa Nhật VII Phục Sinh (VN chuyển từ Thứ Năm +39 sang Chúa Nhật)" },
  { offset: 49,  name: "Lễ Hiện Xuống – Chúa Thánh Thần Hiện Xuống (Pentecost)", level: "solemnity", note: "Kết thúc Mùa Phục Sinh" },
  { offset: 56,  name: "Lễ Chúa Ba Ngôi Cực Thánh", level: "solemnity" },
  { offset: 63,  name: "Lễ Mình Máu Thánh Chúa (Corpus Christi)", level: "solemnity", note: "Chúa Nhật sau Lễ Ba Ngôi (VN chuyển từ Thứ Năm +60)" },
  { offset: 68,  name: "Lễ Thánh Tâm Chúa Giêsu", level: "solemnity", note: "Tháng 6: Tháng kính Thánh Tâm" },
  { offset: 69,  name: "Lễ Trái Tim Vô Nhiễm Đức Maria", level: "optional" },
];

// ─── Calendar Generator ───────────────────────────────────────────────────────

export function generateCalendar(year: number): MonthData[] {
  const easter = computeEaster(year);
  const advent1 = computeAdvent1(year);

  // Start with fixed feasts (shallow copy to avoid mutation)
  const entries: Array<FixedFeast> = FIXED_FEASTS.map((f) => ({ ...f }));

  // Add Easter-relative moveable feasts
  for (const feast of EASTER_RELATIVE_FEASTS) {
    const d = addDays(easter, feast.offset);
    if (d.getFullYear() === year) {
      entries.push({ month: d.getMonth() + 1, day: d.getDate(), name: feast.name, level: feast.level, note: feast.note });
    }
  }

  // Christ the King = Sunday before Advent 1
  const ctk = addDays(advent1, -7);
  entries.push({ month: ctk.getMonth() + 1, day: ctk.getDate(), name: "Lễ Chúa Kitô Vua Vũ Trụ", level: "solemnity", note: "Chúa Nhật cuối Năm Phụng Vụ. Kết thúc Năm Phụng Vụ" });

  // Advent Sundays
  const adventOrdinals = ["I", "II", "III", "IV"];
  for (let i = 0; i < 4; i++) {
    const d = addDays(advent1, i * 7);
    if (d.getFullYear() === year) {
      const note = i === 0 ? `Bắt đầu Năm Phụng Vụ mới ${year}–${year + 1}` : undefined;
      entries.push({ month: d.getMonth() + 1, day: d.getDate(), name: `Chúa Nhật ${adventOrdinals[i]} Mùa Vọng`, level: "special", note });
    }
  }

  // Holy Family = Sunday after Dec 25; if Dec 25 is Sunday → Dec 30
  const dec25 = new Date(year, 11, 25);
  const dec25dow = dec25.getDay();
  const holyFamily = dec25dow === 0 ? new Date(year, 11, 30) : addDays(dec25, 7 - dec25dow);
  if (holyFamily.getFullYear() === year) {
    entries.push({ month: holyFamily.getMonth() + 1, day: holyFamily.getDate(), name: "Lễ Thánh Gia Thất – Chúa Giêsu, Maria, Giuse", level: "feast" });
  }

  // Group by month, sort by day
  const months: MonthData[] = [];
  for (let m = 1; m <= 12; m++) {
    const feasts = entries
      .filter((f) => f.month === m)
      .sort((a, b) => a.day - b.day)
      .map(({ day, name, level, note }) => ({ day, name, level, ...(note ? { note } : {}) }));
    months.push({ number: m, name: `Tháng ${m}`, feasts });
  }
  return months;
}

// Convenience: pre-generated for current and adjacent years.
// Components should call generateCalendar(year) directly for dynamic use.
export function getEasterInfo(year: number): { month: number; day: number; date: string } {
  const d = computeEaster(year);
  return { month: d.getMonth() + 1, day: d.getDate(), date: `${d.getDate()}/${d.getMonth() + 1}/${year}` };
}
