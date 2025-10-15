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
  // Transform data to use only first name for x-axis
  const dataWithFirstNames = data.map(item => ({
    ...item,
    team: item.team.split(' ')[0]
  }));

  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart 
        data={dataWithFirstNames}
        barGap={0}
        barCategoryGap={15}
        margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
      >
        {/* Y-axis with numeric values */}
        <YAxis
          axisLine={false}
          tickLine={false}
          domain={[0, 'dataMax']}
          tick={{fontSize: 12 }}
          className="text-text-main"
          allowDecimals={false}
          width={30}
        />
        
        {/* X-axis with first names */}
        <XAxis 
          dataKey="team" 
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
           className="text-text-main"
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