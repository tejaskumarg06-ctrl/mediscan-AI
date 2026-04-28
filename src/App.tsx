/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TerminalChrome } from './components/TerminalChrome';
import { Header } from './components/Header';
import { MediScanTab } from './components/MediScanTab';
import { AIAnalystTab } from './components/AIAnalystTab';
import { PlaceholderTab } from './components/PlaceholderTab';
import { TabType } from './types';
import { motion, AnimatePresence } from 'motion/react';

const TABS: { id: TabType; label: string }[] = [
  { id: 'SCANNER', label: 'SCANNER' },
  { id: 'DIAGNOSIS', label: 'DIAGNOSIS' },
  { id: 'VITALS', label: 'VITALS' },
  { id: 'HISTORY', label: 'HISTORY' },
  { id: 'AI_ANALYST', label: 'AI ANALYST' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('SCANNER');

  const renderContent = () => {
    switch (activeTab) {
      case 'SCANNER':
        return <MediScanTab key="scanner" />;
      case 'AI_ANALYST':
        return <AIAnalystTab key="ai-analyst" />;
      default:
        return <PlaceholderTab key={activeTab} title={activeTab} />;
    }
  };

  return (
    <TerminalChrome>
      <Header />
      
      {/* Navigation Tabs */}
      <div className="flex bg-[#0a0a0a] border-b border-white/10 px-0 overflow-x-auto no-scrollbar z-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 text-[11px] font-bold tracking-[0.2em] transition-all relative whitespace-nowrap border-r border-white/5 last:border-r-0 ${
              activeTab === tab.id 
                ? 'text-blue-400 bg-blue-500/10 [text-shadow:0_0_8px_rgba(59,130,246,0.5)]' 
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="flex-1 border-b border-transparent" />
        <div className="px-4 py-2.5 text-[10px] text-white/20 flex items-center gap-2 italic font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          MEDISCAN_OS{activeTab === 'SCANNER' ? '>' : '$'}
          <span className="cursor-blink" />
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 relative overflow-hidden bg-[#050505]">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </TerminalChrome>
  );
}
