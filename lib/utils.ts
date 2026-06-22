import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtK(amount: number): string {
  return `K ${amount.toLocaleString('en-ZM')}`
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function formatDate(date: string): string {
  return date
}

export function downloadTextFile(filename: string, content: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function downloadExcelFile(filename: string, rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) {
    downloadTextFile(filename, '', 'application/vnd.ms-excel;charset=utf-8')
    return
  }

  const headers = Object.keys(rows[0])
  const escapeHtml = (value: string | number) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const table = `
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <table>
          <thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
          <tbody>
            ${rows.map(row => `<tr>${headers.map(header => `<td>${escapeHtml(row[header] ?? '')}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `

  downloadTextFile(filename, table, 'application/vnd.ms-excel;charset=utf-8')
}

export function downloadPdfFile(filename: string, title: string, lines: string[]) {
  const escapePdf = (value: string) =>
    value
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[^\x20-\x7E]/g, ' ')

  const pageWidth = 612
  const pageHeight = 792
  const margin = 48
  const lineHeight = 16
  const maxLines = Math.floor((pageHeight - margin * 2 - 28) / lineHeight)
  const visibleLines = lines.slice(0, maxLines)
  const textCommands = [
    'BT',
    '/F1 18 Tf',
    `${margin} ${pageHeight - margin} Td`,
    `(${escapePdf(title)}) Tj`,
    '/F1 10 Tf',
    `0 -28 Td`,
    ...visibleLines.flatMap((line, index) => [
      index === 0 ? '' : `0 -${lineHeight} Td`,
      `(${escapePdf(line)}) Tj`,
    ]).filter(Boolean),
    'ET',
  ].join('\n')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${textCommands.length} >>\nstream\n${textCommands}\nendstream`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  downloadTextFile(filename, pdf, 'application/pdf')
}

export function toCsv(rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
  return [headers.join(','), ...rows.map(row => headers.map(header => escape(row[header])).join(','))].join('\n')
}

export function statusColor(status: string) {
  switch (status) {
    case 'paid':        return 'text-status-paid   bg-green-50  border-green-200'
    case 'pending':     return 'text-status-pending bg-amber-50  border-amber-200'
    case 'overdue':     return 'text-status-overdue bg-red-50    border-red-200'
    case 'open':        return 'text-status-overdue bg-red-50    border-red-200'
    case 'in-progress': return 'text-status-progress bg-blue-50  border-blue-200'
    case 'resolved':    return 'text-status-paid   bg-green-50  border-green-200'
    case 'active':      return 'text-status-paid   bg-green-50  border-green-200'
    case 'urgent':      return 'text-status-overdue bg-red-50   border-red-200'
    case 'high':        return 'text-status-pending bg-amber-50 border-amber-200'
    case 'medium':      return 'text-status-progress bg-blue-50 border-blue-200'
    case 'low':         return 'text-text-muted bg-gray-50     border-gray-200'
    default:            return 'text-text-muted bg-gray-50      border-gray-200'
  }
}

export function priorityIcon(priority: string): string {
  switch (priority) {
    case 'urgent': return '🔴'
    case 'high':   return '🟠'
    case 'medium': return '🔵'
    case 'low':    return '🟢'
    default:       return '⚪'
  }
}
