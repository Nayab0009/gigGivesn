"use client";
import CalculatorSidebar from "../../components/calculators/CalculatorSidebar";
import { Calculator } from "./types";
import { useState, useEffect } from "react";

export default function Page() {
  const [calculators, setCalculators] = useState<Calculator[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/calculators")
      .then((res) => res.json())
      .then((data) => {
        setCalculators(data);
        if (data.length > 0) setSelectedId(data[0].id);
      });
  }, []);

  return (
    <div className="flex h-full min-h-screen">
      <CalculatorSidebar
        calculators={calculators}
        onSelect={setSelectedId}
        selectedId={selectedId}
      />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Calculators</h1>
        {selectedId && (
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {calculators.find((c) => c.id === selectedId)?.name}
            </h2>
            <p>{calculators.find((c) => c.id === selectedId)?.description}</p>
          </div>
        )}
      </main>
    </div>
  );
}
