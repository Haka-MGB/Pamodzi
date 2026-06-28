'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

interface RevenueChartProps {
  data: Array<{
    month: string
    parklands?: number
    ndola?: number
    cbd?: number
  }>
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#8F9A8E' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(value) => {
            const num = typeof value === 'number' ? value : 0
            return `K${num / 1000}k`
          }}
          tick={{ fontSize: 10, fill: '#8F9A8E' }}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) => {
            if (typeof value === 'number') {
              return [`K ${value.toLocaleString()}`, 'Revenue']
            }
            return [String(value ?? ''), 'Revenue']
          }}
          contentStyle={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          cursor={{ fill: 'rgba(45,106,79,0.06)' }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="parklands"
          name="Parklands Estate"
          stroke="#2D6A4F"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="ndola"
          name="Ndola East"
          stroke="#D9A13B"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="cbd"
          name="Lusaka CBD Apartments"
          stroke="#4A90D9"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}