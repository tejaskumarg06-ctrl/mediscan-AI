import React from 'react';
import { MARKET_INDICES } from '../constants';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const MarketSnapshot: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6 mx-3">
      {MARKET_INDICES.map((item) => (
        <div key={item.symbol} className="p-3 bg-[#0a0a0a] border border-[#00ff41] hover:bg-[#00ff41]/5 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold text-[#00ff41]/60 uppercase tracking-widest">{item.symbol}</span>
            <span className={`text-[10px] font-bold ${item.changePercent >= 0 ? 'text-[#00ff41]' : 'text-[#ff4444]'} flex items-center gap-0.5`}>
              {item.changePercent >= 0 ? '▲' : '▼'}
              {Math.abs(item.changePercent)}%
            </span>
          </div>
          <div className="text-base font-bold text-[#00ff41] mb-2 leading-tight tracking-tight tabular-nums">
            {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[8px] text-[#00ff41]/30 uppercase font-bold tracking-tighter">
              <span>H: {item.high52}</span>
              <span>L: {item.low52}</span>
            </div>
            <div className="h-[2px] bg-[#00ff41]/10 relative overflow-hidden">
              <div 
                className={`absolute top-0 bottom-0 ${item.changePercent >= 0 ? 'bg-[#00ff41]' : 'bg-[#ff4444]'}`} 
                style={{ width: `${((item.price - item.low52) / (item.high52 - item.low52)) * 100}%` }} 
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
