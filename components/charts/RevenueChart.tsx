'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useApp } from '@/context/AppContext'

export default function RevenueChart() {
  const { revenueData } = useApp()
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={revenueData} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8F9A8E' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => `K${v/1000}k`} tick={{ fontSize: 10, fill: '#8F9A8E' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v: number) => [`K ${v.toLocaleString()}`, 'Revenue']}
          contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 12 }}
          cursor={{ fill: 'rgba(45,106,79,0.06)' }}
        />
        <Bar dataKey="total" fill="#2D6A4F" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  )
}
