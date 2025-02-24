"use client";

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';

// Define interfaces for type safety
interface ShapeData {
  Shape: string;
  A?: number;    // Area
  d?: number;    // Depth
  tw?: number;   // Web thickness
  bf?: number;   // Flange width
  tf?: number;   // Flange thickness
  Ix?: number;   // Moment of inertia about x-axis
  Sx?: number;   // Section modulus about x-axis
  Iy?: number;   // Moment of inertia about y-axis
  [key: string]: string | number | null | undefined;
}

interface SteelGrade {
  name: string;
  Fy: number;  // Yield strength (ksi)
}

interface CalculationDetails {
  Ix: number;
  Iy: number;
  Sx: number;
  J: number;
  ho: number;
  rts: number;
  E: number;
  Fy: number;
  term1: number;
  term2: number;
  term3: number;
  term4: number;
  term5: number;
}

interface FileSystem {
  readFile(path: string, options: { encoding: string }): Promise<string>;
}

declare global {
  interface Window {
    fs: FileSystem;
  }
}

const ShapeSearch: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<ShapeData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedShape, setSelectedShape] = useState<ShapeData | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [steelGrades] = useState<SteelGrade[]>([
    { name: "A36", Fy: 36 },
    { name: "A572 Grade 50", Fy: 50 },
    { name: "A992", Fy: 50 },
    { name: "A913 Grade 65", Fy: 65 }
  ]);
  const [selectedGrade, setSelectedGrade] = useState<SteelGrade>(steelGrades[2]); // A992 default
  const [E] = useState<number>(29000); // Modulus of elasticity (ksi)
  const [customFy, setCustomFy] = useState<string>('');
  const [calculatedLr, setCalculatedLr] = useState<number | null>(null);
  const [calculationDetails, setCalculationDetails] = useState<CalculationDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/W Member Database .csv');
        const csvText = await response.text();
        const result = Papa.parse<ShapeData>(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        });
        setData(result.data);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.length > 0) {
      const filtered = data
        .map(item => item.Shape)
        .filter((shape): shape is string => 
          typeof shape === 'string' && shape.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (shape: string) => {
    setSearchTerm(shape);
    const found = data.find(item => item.Shape === shape) || null;
    setSelectedShape(found);
    setSuggestions([]);
  };

  const formatValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return String(value);
  };

  const calculateProperties = (shape: ShapeData) => {
    if (!shape.d || !shape.bf || !shape.tf || !shape.tw) {
      alert("Missing required section dimensions");
      return null;
    }

    const d = shape.d;
    const bf = shape.bf;
    const tf = shape.tf;
    const tw = shape.tw;
    const h = d - 2 * tf;

    // Calculate section properties
    const Ix = shape.Ix || (bf * Math.pow(d, 3) / 12) - ((bf - tw) * Math.pow(h, 3) / 12);
    const Sx = shape.Sx || Ix / (d / 2);
    const Iy = shape.Iy || (2 * tf * Math.pow(bf, 3) / 12) + (h * Math.pow(tw, 3) / 12);
    const J = (1/3) * (bf * Math.pow(tf, 3) * 2 + h * Math.pow(tw, 3));
    const ho = d - tf;
    const rts = Math.sqrt(Math.sqrt(Iy * J) / Sx);

    return { Ix, Iy, Sx, J, ho, rts };
  };

  const calculateLr = () => {
    if (!selectedShape) return;

    const props = calculateProperties(selectedShape);
    if (!props) return;

    const { Sx, J, ho, rts, Ix, Iy } = props;
    const Fy = customFy ? parseFloat(customFy) : selectedGrade.Fy;

    // Calculate Lr using the AISC equation
    const term1 = 1.95 * rts;
    const term2 = E / (0.7 * Fy);
    const term3 = Math.sqrt(J / (Sx * ho));
    const term4 = 6.76 * Math.pow((0.7 * Fy * Sx * ho) / (E * J), 2);
    const term5 = Math.sqrt(1 + Math.sqrt(1 + term4));
    
    const Lr = term1 * term2 * term3 * term5;

    setCalculatedLr(Lr);
    setCalculationDetails({ Ix, Iy, Sx, J, ho, rts, E, Fy, term1, term2, term3, term4, term5 });
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="w-full max-w-4xl mx-auto p-4 relative z-10">
        <button
          onClick={() => router.push('/')}
          className="mb-8 px-6 py-3 glass-effect text-white/70 hover:text-white font-mono tracking-wider transition-all duration-200"
        >
          ← BACK
        </button>
        
        <div className="glass-effect p-8 mb-8">
          <h2 className="text-3xl font-bold text-white/90 mb-8 font-mono tracking-widest">W BEAMS DATABASE</h2>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for a shape..."
              className="w-full p-4 bg-black/30 border border-white/10 text-white font-mono focus:border-white/30 focus:outline-none transition-all duration-200 tracking-wider"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full glass-effect border border-white/10">
                {suggestions.map((shape, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-white/5 cursor-pointer text-white/70 hover:text-white font-mono tracking-wider border-b border-white/10 last:border-b-0"
                    onClick={() => handleSelect(shape)}
                  >
                    {shape}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedShape && (
          <div className="glass-effect p-8 mb-8">
            <h2 className="text-3xl font-bold text-white/90 mb-8 font-mono tracking-widest">
              Lateral-Torsional Buckling Calculator
            </h2>

            {/* Steel Grade Selection */}
            <div className="mb-8">
              <h3 className="text-xl text-white/80 mb-4 font-mono">Steel Grade</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={selectedGrade.name}
                  onChange={(e) => {
                    const grade = steelGrades.find(g => g.name === e.target.value);
                    if (grade) setSelectedGrade(grade);
                  }}
                  className="p-4 bg-black/30 border border-white/10 text-white font-mono focus:border-white/30 focus:outline-none"
                  disabled={!!customFy}
                >
                  {steelGrades.map((grade) => (
                    <option key={grade.name} value={grade.name}>
                      {grade.name} (Fy = {grade.Fy} ksi)
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={customFy}
                  onChange={(e) => setCustomFy(e.target.value)}
                  placeholder="Custom Fy (ksi)"
                  className="p-4 bg-black/30 border border-white/10 text-white font-mono focus:border-white/30 focus:outline-none"
                />
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateLr}
              className="w-full p-4 bg-white/20 text-white hover:bg-white/30 font-mono tracking-wider transition-all duration-200"
            >
              CALCULATE Lr
            </button>

            {/* Results */}
            {calculatedLr !== null && calculationDetails && (
              <div className="mt-8">
                <div className="p-6 bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl text-white font-mono tracking-wider">
                    Lr = {calculatedLr.toFixed(2)} inches
                    <div className="text-sm text-white/50 mt-2">
                      ({(calculatedLr / 12).toFixed(2)} ft)
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full mt-4 p-3 bg-white/10 text-white/70 hover:text-white font-mono tracking-wider"
                >
                  {showDetails ? 'HIDE DETAILS' : 'SHOW DETAILS'}
                </button>

                {showDetails && (
                  <div className="mt-4 p-6 bg-black/30 border border-white/10 font-mono text-white/80 text-sm">
                    {/* Calculation details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>Ix = {calculationDetails.Ix.toFixed(2)} in⁴</div>
                      <div>Iy = {calculationDetails.Iy.toFixed(2)} in⁴</div>
                      <div>Sx = {calculationDetails.Sx.toFixed(2)} in³</div>
                      <div>J = {calculationDetails.J.toFixed(2)} in⁴</div>
                      <div>ho = {calculationDetails.ho.toFixed(2)} in</div>
                      <div>rts = {calculationDetails.rts.toFixed(3)} in</div>
                      <div>E = {calculationDetails.E} ksi</div>
                      <div>Fy = {calculationDetails.Fy} ksi</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedShape && (
          <div className="glass-effect p-8">
            <h2 className="text-3xl font-bold text-white/90 mb-8 font-mono tracking-widest">
              {selectedShape.Shape}
            </h2>
            <div className="grid grid-cols-2 gap-8">
              {Object.entries(selectedShape).map(([key, value]) => (
                key !== 'Shape' && (
                  <div key={key} className="border-b border-white/10 pb-4">
                    <div className="text-sm text-white/50 font-mono mb-2 tracking-wider">{key}</div>
                    <div className="text-white/90 font-mono tracking-wider">{formatValue(value)}</div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShapeSearch;