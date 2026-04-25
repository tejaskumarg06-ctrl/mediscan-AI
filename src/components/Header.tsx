import React, { useState, useEffect } from 'react';

export const Header: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPart = (part: number) => part.toString().padStart(2, '0');

  const symbols = ['FRED', 'BLS', 'BEA', 'ISM', 'TREASURY', 'FOMC', 'ECB', 'BOJ'];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-6 py-3 border-b border-[#00ff41] gap-4 z-10 bg-[#0a0a0a]">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#00ff41]/50 leading-tight uppercase font-bold tracking-tighter">Terminal Time</span>
          <span className="text-xl font-bold tracking-tight text-[#00ff41] [text-shadow:0_0_5px_rgba(0,255,65,0.4)]">
            {formatPart(time.getHours())}:{formatPart(time.getMinutes())}:{formatPart(time.getSeconds())}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-[#00ff41]/50 leading-tight uppercase font-bold tracking-tighter">Business Day</span>
          <span className="text-xs font-medium text-[#00ff41]">
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden mask-fade-edges h-10 items-center justify-center">
        <div className="flex gap-8 animate-marquee whitespace-nowrap px-4">
          {[...symbols, ...symbols].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-[#00ff41] font-bold tracking-widest">{s}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] opacity-50" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-[#00ff41]/50 uppercase font-bold tracking-tighter">Connection</span>
          <span className="text-[10px] text-[#00ff41] flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
            LIVE_DATA
          </span>
        </div>
      </div>
    </div>
  );
};
