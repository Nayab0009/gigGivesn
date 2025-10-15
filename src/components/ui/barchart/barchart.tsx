import React, { useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// import {getAllProjectsDashboard} from "../"
import { getAllProjects } from "../../../lib/ProjectService"

// This is the main App component that renders the donut chart.
const App = () => {
  // Define the data for the chart based on the image provided.

const [projects, setProjects] = React.useState<any[]>([]);


useEffect(() => {
  const fetchProjects = async () => {
    const allProjects = await getAllProjects();
    setProjects(allProjects);
  };

  fetchProjects();
}, []);


  // Calculate dynamic percentages for completed and in progress
  const [selected, setSelected] = React.useState<number|null>(null);
  const total = projects.length;
  const completed = projects.filter(p => p.status?.toLowerCase() === "completed").length;
  const inProgress = projects.filter(p => p.status?.toLowerCase() === "inprogress").length;
  // Ensure both segments are always visible, even if one is very small
  const minVisible = 0.15; // Minimum 15% for a visible segment
  let completedValue = completed;
  let inProgressValue = inProgress;
  if (completed > 0 && inProgress > 0) {
    // If both are nonzero, ensure neither is visually zero
    const completedPercent = completed / total;
    const inProgressPercent = inProgress / total;
    if (completedPercent < minVisible) {
      completedValue = Math.max(1, Math.round(total * minVisible));
      inProgressValue = total - completedValue;
    }
    if (inProgressPercent < minVisible) {
      inProgressValue = Math.max(1, Math.round(total * minVisible));
      completedValue = total - inProgressValue;
    }
  }
  const data = [
    { name: 'Completed', value: completedValue, count: completed, color: '#57b5e7', dim: 'rgba(87,181,231,0.3)' },
    { name: 'In Progress', value: inProgressValue, count: inProgress, color: '#fbbf72', dim: 'rgba(251,191,114,0.3)' },
  ];

  const chartTitle = 'Project Breakdown';

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: { name: string; value: number; count: number } }>;
  }
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      // Calculate percentage for tooltip
      const percent = total ? Math.round((d.value / total) * 100) : 0;
      return (
        <div className="rounded-md shadow-lg bg-black/80 px-3 py-2">
          <p className="font-semibold text-text-main">{`${d.name}: ${percent}%`}</p>
          <p className="text-text-main text-xs">Count: {d.count}</p>
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
          <div className="w-10/12 h-[165px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  cornerRadius={5}
                  startAngle={90}
                  endAngle={-270}
                  onClick={(_, idx) => setSelected(idx)}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={selected === null ? entry.color : (selected === index ? entry.color : entry.dim)}
                      strokeWidth={selected === index ? 3 : 0}
                      cursor="pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-1/2 flex flex-col justify-center items-start">
            {data.map((entry, index) => (
              <div
                key={`legend-${index}`}
                className="flex items-center mb-3 cursor-pointer"
                onClick={() => setSelected(index)}
              >
                <div
                  className="w-7 h-4 rounded-sm mr-4"
                  style={{ backgroundColor: selected === null ? entry.color : (selected === index ? entry.color : entry.dim) }}
                ></div>
                <span className={`text-white text-sm font-medium ${selected === index ? '' : 'opacity-60'}`}>
                  {entry.name}
                  {selected === index && (
                    <span className="ml-2 text-xs text-text-main">({entry.count})</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
