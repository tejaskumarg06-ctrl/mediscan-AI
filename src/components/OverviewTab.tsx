import React from 'react';
import { motion } from 'motion/react';
import { MarketSnapshot } from './MarketSnapshot';
import { MacroBanner } from './MacroBanner';
import { SP500Chart, YieldCurveChart } from './Charts';
import { InfoPanels } from './InfoPanels';

export const OverviewTab: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full overflow-y-auto custom-scrollbar pt-6"
    >
      <MacroBanner />
      <MarketSnapshot />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6 px-3">
        <SP500Chart />
        <YieldCurveChart />
      </div>

      <div className="flex-grow" />

      <InfoPanels />
      
      <div className="text-[9px] text-[#00ff41]/20 font-mono py-2 text-center tracking-[0.4em] uppercase">
        Terminal encrypted core // Layer 4 access established
      </div>
    </motion.div>
  );
};
