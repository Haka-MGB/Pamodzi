'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Props { paid: number; pending: number; overdue: number }

export default function StatusDonut({ paid, pending, overdue }: Props) {
  const data = [
    { name: 'Paid',    value: paid,    color: '#2D6A4F' },
    { name: 'Pending', value: pending, color: '#D9A13B' },
    { name: 'Overdue', value: overdue, color: '#C35D3A' },
  ]
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={150} height={150}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={68} dataKey="value" strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-3">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
            <strong className="ml-auto pl-3" style={{ color: 'var(--text-primary)' }}>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
