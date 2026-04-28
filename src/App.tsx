/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TerminalChrome } from './components/TerminalChrome';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { RatesTab } from './components/RatesTab';
import { InflationTab } from './components/InflationTab';
import { GrowthTab } from './components/GrowthTab';
import { LaborTab } from './components/LaborTab';
import { RiskTab } from './components/RiskTab';
import { AIAnalystTab } from './components/AIAnalystTab';
import { PlaceholderTab } from './components/PlaceholderTab';
import { TabType } from './types';
import { motion, AnimatePresence } from 'motion/react';

const TABS: { id: TabType; label: string }[] = [
  { id: 'OVERVIEW', label: 'OVERVIEW' },
  { id: 'RATES', label: 'RATES' },
  { id: 'INFLATION', label: 'INFLATION' },
  { id: 'GROWTH', label: 'GROWTH' },
  { id: 'LABOR', label: 'LABOR' },
  { id: 'RISK', label: 'RISK' },
  { id: 'AI_ANALYST', label: 'AI ANALYST' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');

  const renderContent = () => {
    switch (activeTab) {
      case 'OVERVIEW':
        return <OverviewTab key="overview" />;
      case 'RATES':
        return <RatesTab key="rates" />;
      case 'INFLATION':
        return <InflationTab key="inflation" />;
      case 'GROWTH':
        return <GrowthTab key="growth" />;
      case 'LABOR':
        return <LaborTab key="labor" />;
      case 'RISK':
        return <RiskTab key="risk" />;
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
      <div className="flex bg-[#0a0a0a] border-b border-[#00ff41] px-0 overflow-x-auto no-scrollbar z-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 text-[12px] font-bold tracking-widest transition-all relative whitespace-nowrap border-r border-[#00ff41] last:border-r-0 ${
              activeTab === tab.id 
                ? 'text-[#00ff41] bg-[rgba(0,255,65,0.15)] [text-shadow:0_0_8px_rgba(0,255,65,0.8)]' 
                : 'text-[#00ff41]/40 hover:text-[#00ff41]/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="flex-1 border-b border-transparent" />
        <div className="px-4 py-2.5 text-[10px] text-[#00ff41]/30 flex items-center gap-2 italic">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
          CMD_PROMPT{activeTab === 'OVERVIEW' ? '>' : '$'}
          <span className="cursor-blink" />
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0a0a]">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </TerminalChrome>
  );
}
