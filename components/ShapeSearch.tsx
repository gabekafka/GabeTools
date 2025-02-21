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
    <div className="min-h-screen bg-[#121212] sketch-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/50 to-[#121212] pointer-events-none" />
      
      <div className="w-full max-w-4xl mx-auto p-4 relative z-10">
        <button
          onClick={() => router.push('/')}
          className="mb-8 px-4 py-2 bg-[#1a1a1a] border border-gray-700 hover:border-gray-500 text-gray-300 font-mono transition-all duration-200"
        >
          ← BACK
        </button>
        
        <div className="sketch-border bg-[#1a1a1a]/80 p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 font-mono tracking-wider">W BEAMS DATABASE</h2>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for a shape..."
              className="w-full p-4 bg-[#121212] border border-gray-700 text-white font-mono focus:border-blue-500 focus:outline-none transition-all duration-200"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-[#1a1a1a] border border-gray-700 shadow-xl">
                {suggestions.map((shape, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-[#252525] cursor-pointer text-gray-300 font-mono border-b border-gray-700 last:border-b-0"
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
          <div className="sketch-border bg-[#1a1a1a]/80 p-8">
            <h2 className="text-3xl font-bold text-white mb-6 font-mono tracking-wider">
              {selectedShape.Shape}
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(selectedShape).map(([key, value]) => (
                key !== 'Shape' && (
                  <div key={key} className="border-b border-gray-700 pb-4">
                    <div className="text-sm text-gray-400 font-mono mb-1">{key}</div>
                    <div className="text-white font-mono">{formatValue(value)}</div>
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