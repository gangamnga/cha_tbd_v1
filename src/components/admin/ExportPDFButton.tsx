'use client'

import { Printer } from 'lucide-react'

export function ExportPDFButton({
  title,
  headers,
  rows,
  label = 'Xuất PDF',
}: {
  title: string
  headers: string[]
  rows: string[][]
  label?: string
}) {
  const exportPDF = () => {
    const date = new Date().toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

    const esc = (s: string) =>
      (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #1a1a1a; }

    .doc-header { margin-bottom: 10px; }
    .doc-header h1 { font-size: 15px; font-weight: bold; color: #1e3a5f; margin-bottom: 3px; }
    .doc-header .meta { font-size: 9px; color: #999; }
    .divider { border: none; border-top: 2px solid #1e3a5f; margin: 10px 0 14px; }

    table { width: 100%; border-collapse: collapse; }
    th {
      background-color: #1e3a5f; color: #fff;
      padding: 7px 8px; text-align: left;
      font-size: 9px; font-weight: bold;
      text-transform: uppercase; letter-spacing: 0.4px;
    }
    td {
      padding: 6px 8px; border-bottom: 1px solid #ebebeb;
      vertical-align: top; line-height: 1.55; word-break: break-word;
    }
    tr:nth-child(even) td { background-color: #f7f8fb; }

    .doc-footer {
      margin-top: 14px; padding-top: 8px; border-top: 1px solid #ddd;
      font-size: 8px; color: #bbb;
      display: flex; justify-content: space-between;
    }

    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <h1>${esc(title)}</h1>
    <p class="meta">Xuất ngày ${date}&nbsp;&nbsp;·&nbsp;&nbsp;${rows.length} mục</p>
  </div>
  <hr class="divider">
  <table>
    <thead>
      <tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows.map(row =>
        `<tr>${row.map(cell => `<td>${esc(cell ?? '')}</td>`).join('')}</tr>`
      ).join('')}
    </tbody>
  </table>
  <div class="doc-footer">
    <span>Cha Phanxicô Trương Bửu Diệp</span>
    <span>${date}</span>
  </div>
</body>
</html>`

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 600)
  }

  return (
    <button
      onClick={exportPDF}
      className="flex items-center gap-2 px-3.5 h-9 bg-white border border-gray-200 rounded-lg text-[16px] font-bold text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors shrink-0"
    >
      <Printer size={15} strokeWidth={2} />
      {label}
    </button>
  )
}
