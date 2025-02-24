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
      <div className="min-h-screen relative">
        {/* Background Image */}
        <div className="fixed inset-0">
          <div 
            className="absolute inset-0 bg-[url('/gavetools.png')] bg-cover bg-center"
            style={{ opacity: theme === 'light' ? 0.3 : 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        </div>
        
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full glass-effect text-white/70 hover:text-white transition-all duration-200 text-xl"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center mt-20">
            <h1 className="text-[120px] leading-none font-bold mb-6 text-white/90 font-mono relative tracking-tighter">
              GABE
              <br />
              TOOLS
            </h1>
            <p className="text-xl text-white/60 mb-24 font-mono tracking-wider">
              STRUCTURAL ANALYSIS & DESIGN
            </p>

            {/* Tools Grid */}
            <div className="mt-16">
              <button
                onClick={() => router.push('/shapes')}
                className="group glass-effect px-12 py-8 hover:bg-white/5 transition-all duration-300"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white/90 mb-4 font-mono tracking-widest">
                    W BEAMS DATABASE
                  </h3>
                  <p className="text-white/50 font-mono text-sm tracking-wider">
                    STRUCTURAL STEEL W-SHAPE PROPERTIES
                  </p>
                  <div className="mt-6 text-blue-400/70 opacity-0 group-hover:opacity-100 transition-all duration-300 tracking-widest">
                    EXPLORE →
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-32 text-center text-white/30 font-mono">
            <p>© 2024 GABE TOOLS</p>
          </footer>
        </div>
      </div>
    </>
  );
} 