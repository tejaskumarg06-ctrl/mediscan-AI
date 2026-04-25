import React from 'react';
import { motion } from 'motion/react';
import { RISKS, OPPORTUNITIES, UPCOMING_EVENTS } from '../constants';
import { Calendar, ShieldAlert, Zap } from 'lucide-react';

export const InfoPanels: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#00ff41] bg-[#0a0a0a] mt-auto">
      {/* Risks Panel */}
      <div className="border-r border-[#00ff41] p-4">
        <div className="text-[11px] font-bold text-[#ff4444] tracking-[0.2em] mb-4 uppercase">
          KEY RISKS
        </div>
        <div className="flex flex-col gap-2">
          {RISKS.map((risk, i) => (
            <div key={i} className="text-[11px] text-[#ff4444]/70 flex items-start gap-2">
              <span className="text-[#ff4444]">{">"}</span>
              {risk}
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities Panel */}
      <div className="border-r border-[#00ff41] p-4">
        <div className="text-[11px] font-bold text-[#00ff41] tracking-[0.2em] mb-4 uppercase">
          ALPHA OPPORTUNITIES
        </div>
        <div className="flex flex-col gap-2">
          {OPPORTUNITIES.map((opp, i) => (
            <div key={i} className="text-[11px] text-[#00ff41]/70 flex items-start gap-2">
              <span className="text-[#00ff41]">{">"}</span>
              {opp}
            </div>
          ))}
        </div>
      </div>

      {/* Events Panel */}
      <div className="p-4">
        <div className="text-[11px] font-bold text-[#00ff41]/60 tracking-[0.2em] mb-4 uppercase">
          UPCOMING EVENTS
        </div>
        <div className="flex flex-col gap-2 tracking-tighter">
          {UPCOMING_EVENTS.map((evt, i) => (
            <div key={i} className="text-[10px] flex justify-between items-center group">
              <div className="flex items-center gap-2">
                <span className="text-[#00ff41]/30">{evt.date}</span>
                <span className="text-white/80 group-hover:text-[#00ff41] transition-colors">{evt.event}</span>
              </div>
              {evt.importance === 'HIGH' && (
                <span className="text-[8px] text-[#ff4444] font-bold">[CRITICAL]</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
