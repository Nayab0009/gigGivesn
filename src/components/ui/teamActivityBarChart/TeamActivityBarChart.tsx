"use client"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

interface TeamActivityData {
  team: string
  value?: number
  tasks?: number
  completed?: number
  efficiency?: number
}

interface TeamActivityBarChartProps {
  data: TeamActivityData[]
}

export default function TeamActivityBarChart({ data }: TeamActivityBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart 
        data={data}
        barGap={0}
        barCategoryGap={15}
        margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
      >
        {/* Y-axis with numeric values */}
        <YAxis
          axisLine={false}
          tickLine={false}
          domain={[0, 400]}
          ticks={[0, 50, 100, 150, 200, 250, 300, 350, 400]}
          tick={{ fill: 'white', fontSize: 12 }}
          className="text-white"
          allowDecimals={false}
    width={30}
        />
        
        {/* X-axis with team names */}
        <XAxis 
          dataKey="team" 
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'white', fontSize: 12 }}
          height={5}
        />
        
        <Tooltip
          cursor={false}
          contentStyle={{
            backgroundColor: "rgba(0,0,0,0.8)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            color: "white"
          }}
          formatter={(value) => [`${value}`, 'Tasks']}
        />
        
        {/* Single bar series with orange fill like in screenshot */}
        <Bar 
          dataKey="value" 
          fill="#FFA726" 
          radius={[4, 4, 4, 4]} 
          barSize={50}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}