"use client";

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

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
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 className="text-2xl font-bold mb-4">Shape Database Search</h2>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for a shape..."
            className="w-full p-2 border rounded-lg mb-2 focus:outline-none focus:border-blue-500"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg">
              {suggestions.map((shape, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
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
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{selectedShape.Shape} Properties</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(selectedShape).map(([key, value]) => (
              key !== 'Shape' && (
                <div key={key} className="border-b pb-2">
                  <div className="text-sm text-gray-600">{key}</div>
                  <div className="font-medium">{formatValue(value)}</div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapeSearch;