import React from 'react';
import { motion } from 'motion/react';

interface TerminalChromeProps {
  children: React.ReactNode;
  title?: string;
}

export const TerminalChrome: React.FC<TerminalChromeProps> = ({ children, title = 'MACRO TERMINAL v2.0.0' }) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0a0a] overflow-hidden relative p-3">
      <div className="crt-overlay" />
      <div className="scanline" />
      
      {/* Chrome Header */}
      <div className="flex items-center justify-between px-3 py-2 border border-[#00ff41] bg-[#0a0a0a] z-20 shadow-[0_0_15px_rgba(0,255,65,0.05)]">
        <div className="flex gap-2 items-center">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ff4444]" />
            <div className="w-2 h-2 rounded-full bg-[#ffaa00]" />
            <div className="w-2 h-2 rounded-full bg-[#00ff41]" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.2em] text-[#00ff41] uppercase ml-2 opacity-80">
            {title}
          </div>
        </div>
        <div className="text-[10px] text-[#00ff41]/50 hidden md:block tracking-widest">
          KEYS [↑↓] TO NAVIGATE | ESC TO EXIT
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden border-x border-[#00ff41] bg-[#0a0a0a]/95 relative">
        {children}
      </div>

      {/* Footer */}
      <div className="px-3 py-1 border border-[#00ff41] bg-[#0a0a0a] text-[9px] text-[#00ff41]/50 flex justify-between z-20">
        <div className="tracking-tighter">CREATED WITH MACRO_CORE ENGINE v2.0.0-PRO</div>
        <div className="tracking-tighter uppercase">SYS_STATUS: OPTIMAL | ALL RIGHTS RESERVED</div>
      </div>
    </div>
  );
};
