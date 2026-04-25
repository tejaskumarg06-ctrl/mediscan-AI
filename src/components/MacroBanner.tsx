import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

export const MacroBanner: React.FC = () => {
  const points = [
    "Inflation expectations remain unanchored despite restrictive policy.",
    "Yield curve inversion persists as recession probabilities climb to 45%.",
    "Energy supply-side risks introducing non-linear upside to CPI.",
    "Fixed income markets pricing in a 'higher for longer' fiscal path.",
    "Equity risk premium at decadal lows relative to risk-free treasury yields."
  ];

  return (
    <div className="p-4 border border-[#ffaa00] bg-[#ffaa00]/5 rounded-none mb-6 relative overflow-hidden group mx-3">
      <div className="absolute top-0 right-0 p-2 opacity-5">
        <AlertTriangle size={48} className="text-[#ffaa00]" />
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="text-[12px] font-bold text-[#ffaa00] tracking-[0.2em] uppercase flex items-center gap-2">
          CURRENT MACRO REGIME: <span className="blink text-white shadow-[0_0_10px_#ffaa00]">STAGFLATION RISK</span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1.5">
            {points.map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                className="text-[11px] text-[#ffaa00]/70 flex items-start gap-2 font-medium"
              >
                <span className="text-[#ffaa00] shrink-0 font-bold tracking-tighter">{"> "}</span>
                {p}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
