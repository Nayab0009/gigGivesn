"use client"
import React from "react";
import { Calculator } from "../../app/calculators/types";

interface CalculatorSidebarProps {
  calculators: Calculator[];
  onSelect: (id: number) => void;
  selectedId: number | null;
}

const CATEGORIES = [
  "Construction converters",
  "Construction materials calculators",
  "Cement and concrete calculators",
  "Home and garden calculators",
  "Roofing calculators",
  "Driveway calculators",
  "Water tank and vessels calculators",
  "Materials specifications calculators",
  "Other calculators"
];

const CalculatorSidebar: React.FC<CalculatorSidebarProps> = ({ calculators, onSelect, selectedId }) => {
  // Group calculators by category
  const grouped = calculators.reduce<Record<string, Calculator[]>>((acc, calc) => {
    if (!acc[calc.category]) acc[calc.category] = [];
    acc[calc.category].push(calc);
    return acc;
  }, {});

  return (
    <aside className="w-64 bg-gray-100 p-4 border-r h-full overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Calculator Categories</h2>
      <div>
        {CATEGORIES.map((category) => (
          <div key={category} className="mb-4">
            <div className="font-semibold text-blue-700 mb-2">{category}</div>
            <ul>
              {(grouped[category] || []).map((calc) => (
                <li
                  key={calc.id}
                  className={`mb-2 p-2 rounded cursor-pointer ${selectedId === calc.id ? "bg-blue-200 font-semibold" : "hover:bg-blue-50"}`}
                  onClick={() => onSelect(calc.id)}
                >
                  {calc.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default CalculatorSidebar;
