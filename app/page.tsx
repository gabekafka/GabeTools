"use client";

import { useTheme } from '../components/ThemeProvider';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-[#121212] sketch-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/50 to-[#121212] pointer-events-none" />
        
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-[#1a1a1a] border border-gray-700 hover:border-gray-500 transition-all duration-200 text-xl"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center mt-20">
            <h1 className="text-8xl font-bold mb-6 text-white font-mono relative">
              <span className="absolute -inset-1 blur-sm bg-blue-500/20"></span>
              GABE TOOLS
            </h1>
            <p className="text-xl text-gray-400 mb-16 font-mono">
              STRUCTURAL ANALYSIS & DESIGN TOOLKIT
            </p>

            {/* Tools Grid */}
            <div className="grid gap-8 mt-16">
              <button
                onClick={() => router.push('/shapes')}
                className="group relative overflow-hidden sketch-border bg-[#1a1a1a]/80 p-8 hover:bg-[#1a1a1a] transition-all duration-300"
              >
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold text-white mb-4 font-mono tracking-wider">
                    W BEAMS DATABASE
                  </h3>
                  <p className="text-gray-400 font-mono">
                    STRUCTURAL STEEL W-SHAPE PROPERTIES
                  </p>
                  <div className="mt-6 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    EXPLORE →
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-purple-900/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-32 text-center text-gray-600 font-mono">
            <p>© 2024 GABE TOOLS</p>
          </footer>
        </div>
      </div>
    </>
  );
} 