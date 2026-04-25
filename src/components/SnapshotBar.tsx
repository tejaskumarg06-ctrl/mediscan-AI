import React from 'react';

interface SnapshotItem {
  symbol: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

interface SnapshotBarProps {
  items: SnapshotItem[];
}

export const SnapshotBar: React.FC<SnapshotBarProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6 mx-3">
      {items.map((item, i) => (
        <div key={i} className="p-3 bg-[#0a0a0a] border border-[#00ff41] hover:bg-[#00ff41]/5 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold text-[#00ff41]/60 uppercase tracking-widest leading-none">{item.symbol}</span>
            <span className={`text-[10px] font-bold ${item.trend === 'up' ? 'text-[#ff4444]' : item.trend === 'down' ? 'text-[#00ff41]' : 'text-[#ffaa00]'} flex items-center gap-0.5`}>
              {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '▬'}
              {item.change !== '0.00' && item.change}
            </span>
          </div>
          <div className="text-base font-bold text-[#00ff41] leading-tight tracking-tight tabular-nums mt-1 [text-shadow:0_0_5px_rgba(0,255,65,0.2)]">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};
