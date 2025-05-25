"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const data = [
  {
    name: "Jan",
    total: 1800,
  },
  {
    name: "Feb",
    total: 2200,
  },
  {
    name: "Mar",
    total: 2800,
  },
  {
    name: "Apr",
    total: 2400,
  },
  {
    name: "May",
    total: 2700,
  },
  {
    name: "Jun",
    total: 3200,
  },
  {
    name: "Jul",
    total: 3500,
  },
  {
    name: "Aug",
    total: 3800,
  },
  {
    name: "Sep",
    total: 3300,
  },
  {
    name: "Oct",
    total: 3900,
  },
  {
    name: "Nov",
    total: 3500,
  },
  {
    name: "Dec",
    total: 4200,
  },
]

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={false} 
          className="stroke-muted" 
        />
        <Tooltip 
          formatter={(value) => [`$${value}`, "Revenue"]}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
          itemStyle={{
            color: "hsl(var(--foreground))"
          }}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
        />
        <Bar
          dataKey="total"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}