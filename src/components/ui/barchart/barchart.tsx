import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// This is the main App component that renders the donut chart.
const App = () => {
  // Define the data for the chart based on the image provided.
  const data = [
    { name: 'Completed', value: 100, color: '#68B6E3' },
    { name: 'Open', value: 20, color: '#F8B57D' },
    { name: 'Bugs', value: 1, color: '#F38C6D' },
  ];

  const chartTitle = 'Project Breakdown';

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: { name: string; value: number } }>;
  }
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className=" rounded-md shadow-lg">
          <p className="font-semibold text-gray-200">{`${data.name}: ${data.value}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom label component to draw lines and text for each slice
  interface CustomizedLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    name: string;
    index: number;
  }
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, index }: CustomizedLabelProps) => {
    const radius = outerRadius + 30; // Position the label further out
    const RADIAN = Math.PI / 180;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? 'start' : 'end';
    const breakPoint = x > cx ? x - 20 : x + 20;

    return (
      <g>
        <polyline
          points={`${x - (x > cx ? 10 : -10)},${y} ${breakPoint},${y} ${cx + Math.cos(-midAngle * RADIAN) * outerRadius},${cy + Math.sin(-midAngle * RADIAN) * outerRadius}`}
          stroke="#FFFFFF"
          fill="none"
        />
        <text
          x={x}
          y={y}
          fill="#FFFFFF"
          textAnchor={textAnchor}
          dominantBaseline="central"
          className="text-sm font-semibold"
        >
          {name}
        </text>
      </g>
    );
  };
  

  return (
    <div className="">
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <div>
          </div>
        </div>
        
        <div className="flex flex-row mt-4">
          <div className="w-1/2 h-[200px]">
            <ResponsiveContainer width="120%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="60%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  cornerRadius={5}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-1/2 flex flex-col justify-center items-start pl-18">
            {data.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center mb-3">
                <div
                  className="w-7 h-4 rounded-sm mr-4"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-white text-sm font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
