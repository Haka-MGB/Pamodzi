'use client'

import { useMemo } from 'react'
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
    [key: string]: number | string
  }>
  properties?: Array<{ id: string; name: string }>
}

export default function RevenueChart({ data, properties = [] }: RevenueChartProps) {
  // Extract dynamic property keys from data (excluding 'month' and 'total')
  const propertyKeys = useMemo(() => {
    if (!data || data.length === 0) return []
    const firstPoint = data[0]
    return Object.keys(firstPoint).filter(key => key !== 'month' && key !== 'total')
  }, [data])

  const colors = ['#2D6A4F', '#D9A13B', '#4A90D9', '#C35D3A', '#8F9A8E']

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
              return [`K ${value.toLocaleString()}`, '']
            }
            return [String(value ?? ''), '']
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
        {propertyKeys.length > 0 ? (
          propertyKeys.map((key, index) => {
            const property = properties.find(p => p.id === key)
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={property?.name || key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            )
          })
        ) : (
          <Line
            type="monotone"
            dataKey="total"
            name="Total Revenue"
            stroke="#2D6A4F"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}