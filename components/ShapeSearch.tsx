"use client";

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';

// Define interfaces for type safety
interface ShapeData {
  Shape: string;
  [key: string]: string | number | null | undefined;
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