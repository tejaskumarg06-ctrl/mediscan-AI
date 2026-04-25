import React from 'react';
import { motion } from 'motion/react';
import { Terminal } from 'lucide-react';

interface PlaceholderTabProps {
  title: string;
}

export const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ title }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col items-center justify-center p-12 opacity-50"
    >
      <Terminal size={48} className="mb-4 text-[#00ff41]" />
      <h2 className="text-2xl font-bold tracking-widest mb-2">{title}</h2>
      <p className="text-xs text-[#666] font-mono mb-4 text-center max-w-md">
        ACCESSING SECURE DATA LAYER... 
        <br />
        ENCRYPTED_QUERY(MACRO_DATABASE, "{title}")
        <br />
        [====================] 100%
      </p>
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse delay-75" />
        <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse delay-150" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-2xl">
         {[1,2,3,4].map(i => (
           <div key={i} className="h-20 bg-[#0a0a0a] border border-[#00ff41]/30 rounded-none animate-pulse" />
         ))}
      </div>
    </motion.div>
  );
};
