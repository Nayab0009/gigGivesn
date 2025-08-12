import { Calculator } from "./types";

// Sample data for calculators route
export const calculatorsData: Calculator[] = [
  {
    id: 1,
    name: "Cement Converter",
    description: "Convert between different units of cement.",
    fields: ["amount", "fromUnit", "toUnit"],
    category: "Construction converters"
  },
  {
    id: 2,
    name: "Brick Calculator",
    description: "Calculate the number of bricks required for a wall.",
    fields: ["length", "height", "brickSize"],
    category: "Construction materials calculators"
  },
  {
    id: 3,
    name: "Concrete Mix Calculator",
    description: "Calculate the amount of cement, sand, and aggregate needed for concrete.",
    fields: ["cement", "sand", "aggregate", "water"],
    category: "Cement and concrete calculators"
  },
  {
    id: 4,
    name: "Garden Soil Calculator",
    description: "Calculate the amount of soil needed for your garden.",
    fields: ["area", "depth"],
    category: "Home and garden calculators"
  },
  {
    id: 5,
    name: "Roof Area Calculator",
    description: "Calculate the area of your roof for material estimation.",
    fields: ["length", "width", "slope"],
    category: "Roofing calculators"
  },
  {
    id: 6,
    name: "Driveway Gravel Calculator",
    description: "Estimate the amount of gravel needed for a driveway.",
    fields: ["length", "width", "depth"],
    category: "Driveway calculators"
  },
  {
    id: 7,
    name: "Water Tank Volume Calculator",
    description: "Calculate the volume of a water tank or vessel.",
    fields: ["diameter", "height"],
    category: "Water tank and vessels calculators"
  },
  {
    id: 8,
    name: "Steel Grade Specification Calculator",
    description: "Find material specifications for different steel grades.",
    fields: ["grade"],
    category: "Materials specifications calculators"
  },
  {
    id: 9,
    name: "Miscellaneous Calculator",
    description: "Other construction-related calculations.",
    fields: ["input1", "input2"],
    category: "Other calculators"
  }
];
