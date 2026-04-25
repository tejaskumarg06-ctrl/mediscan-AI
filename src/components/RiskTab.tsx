import React from 'react';
import { motion } from 'motion/react';
import { Line, Bar } from 'react-chartjs-2';
import { SnapshotBar } from './SnapshotBar';
import { 
  RISK_SNAPSHOT, 
  VIX_HISTORY, 
  SPREAD_MONITOR_DATA, 
  RISK_HEATMAP, 
  TAIL_RISK_SCENARIOS, 
  RISK_CALENDAR,
  CONTAGION_DATA
} from '../constants';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Zap, ShieldAlert, Calendar } from 'lucide-react';

export const RiskTab: React.FC = () => {
  const vixData = {
    labels: VIX_HISTORY.map(d => d.date),
    datasets: [
      {
        label: 'VIX Index',
        data: VIX_HISTORY.map(d => d.value),
        borderColor: '#ffaa00',
        backgroundColor: 'rgba(255, 170, 0, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        z: 10,
      },
      // Threshold lines as datasets
      { label: 'PANIC', data: VIX_HISTORY.map(() => 40), borderColor: '#ff0000', borderWidth: 1, borderDash: [5, 5], fill: false, pointRadius: 0, z: 0 },
      { label: 'FEAR', data: VIX_HISTORY.map(() => 30), borderColor: '#ff4444', borderWidth: 1, borderDash: [5, 5], fill: false, pointRadius: 0, z: 0 },
      { label: 'CAUTION', data: VIX_HISTORY.map(() => 20), borderColor: '#ffaa00', borderWidth: 1, borderDash: [5, 5], fill: false, pointRadius: 0, z: 0 },
      { label: 'CALM', data: VIX_HISTORY.map(() => 15), borderColor: '#00ff41', borderWidth: 1, borderDash: [5, 5], fill: false, pointRadius: 0, z: 0 },
    ]
  };

  const spreadData = {
    labels: SPREAD_MONITOR_DATA.map(d => d.month),
    datasets: [
      {
        label: 'HY Spread (BPS)',
        data: SPREAD_MONITOR_DATA.map(d => d.hy),
        borderColor: '#ff4444',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3,
      },
      {
        label: 'IG Spread (BPS)',
        data: SPREAD_MONITOR_DATA.map(d => d.ig),
        borderColor: '#ffaa00',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top' as const,
        labels: { 
          color: '#00ff41', 
          font: { family: 'JetBrains Mono', size: 9 }, 
          boxWidth: 10,
          filter: (item: any) => !['PANIC', 'FEAR', 'CAUTION', 'CALM'].includes(item.text)
        }
      },
      tooltip: {
        backgroundColor: '#0d0d0d',
        borderColor: '#00ff41',
        borderWidth: 1,
        titleFont: { family: 'JetBrains Mono' },
        bodyFont: { family: 'JetBrains Mono' },
        enabled: true,
      }
    },
    scales: {
      x: { grid: { color: 'rgba(0, 255, 65, 0.05)' }, ticks: { color: '#00ff41', font: { size: 9, family: 'JetBrains Mono' } } },
      y: { grid: { color: 'rgba(0, 255, 65, 0.05)' }, ticks: { color: '#00ff41', font: { size: 9, family: 'JetBrains Mono' } } }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full overflow-y-auto no-scrollbar pt-6 pb-20">
      {/* Section 1: Risk Regime Banner */}
      <div className="mx-3 mb-6 p-4 border terminal-border-glow-red flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#ff4444] animate-pulse" />
        <div className="flex flex-col gap-1 z-10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-[#ff4444] animate-pulse" size={24} />
            <h2 className="text-xl font-bold text-[#ff4444] tracking-[0.2em] uppercase">RISK REGIME: ELEVATED</h2>
          </div>
          <div className="mt-2 flex flex-col gap-1 text-[10px] text-[#00ff41]/70 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#ffaa00]">&gt;</span> Credit spreads widening — HY spreads +45bps in 30 days
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#ffaa00]">&gt;</span> VIX elevated above 20 — options market pricing tail risk
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#ffaa00]">&gt;</span> Dollar strength creating EM stress — DXY above 104
            </div>
          </div>
        </div>
        <div className="text-right z-10">
          <div className="text-4xl font-bold text-[#ff4444] [text-shadow:0_0_15px_rgba(255,68,68,0.4)]">72 <span className="text-sm text-[#ff4444]/40">/ 100</span></div>
          <div className="text-[10px] text-[#ff4444]/60 font-bold uppercase mt-1 tracking-widest">OVERALL RISK SCORE</div>
        </div>
        
        {/* Animated probability display */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#111]">
          <div className="h-full bg-[#ff4444] animate-pulse" style={{ width: '72%' }} />
        </div>
      </div>

      {/* Section 2: Risk Snapshot Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6 mx-3">
        {RISK_SNAPSHOT.map((item, i) => {
          // Logic: UP in risk metrics is usually BAD (red), DOWN is GOOD (green)
          const isRiskIncr = item.trend === 'up';
          const isRiskDecr = item.trend === 'down';
          const themeColor = isRiskIncr ? 'border-[#ff4444] text-[#ff4444] bg-[#ff4444]/5' : isRiskDecr ? 'border-[#00ff41] text-[#00ff41] bg-[#00ff41]/5' : 'border-[#ffaa00] text-[#ffaa00] bg-[#ffaa00]/5';
          const indicatorColor = isRiskIncr ? 'text-[#ff4444]' : isRiskDecr ? 'text-[#00ff41]' : 'text-[#ffaa00]';

          return (
            <div key={i} className={`p-3 bg-[#0a0a0a] border ${themeColor} transition-all duration-300 hover:brightness-125 cursor-pointer group`}>
              <div className="flex justify-between items-start mb-1 h-8">
                <span className={`text-[9px] font-bold opacity-60 uppercase tracking-widest leading-none`}>{item.symbol}</span>
                <span className={`text-[10px] font-bold ${indicatorColor} flex items-center gap-0.5`}>
                  {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '▬'}
                  {item.change}
                </span>
              </div>
              <div className={`text-base font-bold leading-tight tracking-tight tabular-nums mt-1 [text-shadow:0_0_8px_rgba(inherit,0.4)]`}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6 px-3">
        <div className="h-[300px] p-4 bg-[#0a0a0a] border border-[#ffaa00] terminal-border relative overflow-hidden">
          <h3 className="text-[10px] font-bold text-[#ffaa00]/60 uppercase mb-4 tracking-widest">VIX VOLATILITY HISTORY (2Y)</h3>
          
          {/* Threshold lines labels */}
          <div className="absolute top-14 left-10 flex flex-col gap-0 items-start pointer-events-none z-10">
             <span className="text-[7px] text-[#ff0000] font-bold bg-[#0a0a0a] px-1 translate-y-[12px]">PANIC (40)</span>
             <span className="text-[7px] text-[#ff4444] font-bold bg-[#0a0a0a] px-1 translate-y-[38px]">FEAR (30)</span>
             <span className="text-[7px] text-[#ffaa00] font-bold bg-[#0a0a0a] px-1 translate-y-[64px]">CAUTION (20)</span>
             <span className="text-[7px] text-[#00ff41] font-bold bg-[#0a0a0a] px-1 translate-y-[82px]">CALM (15)</span>
          </div>

          <div className="absolute inset-0 px-10 py-14 pointer-events-none opacity-20">
            <div className="border-t border-dashed border-[#ff0000] w-full absolute top-[25%]" />
            <div className="border-t border-dashed border-[#ff4444] w-full absolute top-[44%]" />
            <div className="border-t border-dashed border-[#ffaa00] w-full absolute top-[62%]" />
            <div className="border-t border-dashed border-[#00ff41] w-full absolute top-[72%]" />
          </div>

          {/* VIX Spikes Annotations */}
          <div className="absolute inset-0 pointer-events-none px-4 pt-10">
              <div className="absolute left-[25%] top-[30%] border-l border-t border-[#ff4444] p-1">
                 <span className="text-[8px] text-[#ff4444] font-bold whitespace-nowrap">SVB COLLAPSE</span>
              </div>
              <div className="absolute left-[55%] top-[40%] border-l border-t border-[#ff4444] p-1">
                 <span className="text-[8px] text-[#ff4444] font-bold whitespace-nowrap">CPI SHOCK</span>
              </div>
              <div className="absolute left-[80%] top-[45%] border-l border-t border-[#ffaa00] p-1">
                 <span className="text-[8px] text-[#ffaa00] font-bold whitespace-nowrap">FOMC PIVOT</span>
              </div>
          </div>

          <div className="relative h-[220px]">
             <Line data={vixData} options={chartOptions} />
          </div>
        </div>
        <div className="h-[300px] p-4 bg-[#0a0a0a] border border-[#00ff41] terminal-border relative overflow-hidden">
          <h3 className="text-[10px] font-bold text-[#00ff41]/60 uppercase mb-4 tracking-widest">CREDIT SPREAD MONITOR (HY vs IG)</h3>
          
          {/* Stress Zone Shading */}
          <div className="absolute top-[35%] w-full h-[20%] bg-[#ff4444]/5 border-y border-dashed border-[#ff4444]/20 flex items-center justify-end pr-4 pointer-events-none">
             <span className="text-[8px] text-[#ff4444]/40 font-bold uppercase tracking-wider">STRESS ZONE (&gt;500BPS)</span>
          </div>

          <div className="relative h-[220px]">
             <Line data={spreadData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Section 4: Risk Heatmap */}
      <div className="px-3 mb-6">
        <div className="text-[11px] font-bold text-[#00ff41]/40 tracking-[0.4em] mb-4 uppercase">SYSTEMIC RISK LANDSCAPE // 4x4 MATRIX</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {RISK_HEATMAP.map((cell, i) => {
            const getColor = (score: number) => {
              if (score > 7) return 'bg-[#ff4444]/20 border-[#ff4444] text-[#ff4444]';
              if (score > 4) return 'bg-[#ffaa00]/20 border-[#ffaa00] text-[#ffaa00]';
              return 'bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41]';
            };
            return (
              <div key={i} className={`p-3 border ${getColor(cell.score)} relative group cursor-help transition-all duration-300 hover:scale-[1.02] hover:z-20`}>
                <div className="flex justify-between items-start mb-1 h-8">
                  <span className="text-[10px] font-bold uppercase leading-tight tracking-tighter">{cell.name}</span>
                  <span className="text-[10px] font-mono opacity-60">{cell.score.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[8px] font-bold uppercase opacity-60 tracking-widest">{cell.level}</span>
                  {cell.trend === 'worsening' ? <TrendingUp size={10} /> : cell.trend === 'improving' ? <TrendingDown size={10} /> : <Minus size={10} />}
                </div>
                {/* Expand on hover */}
                <div className="absolute top-full left-0 w-full p-2 bg-[#0d0d0d] border border-inherit invisible group-hover:visible z-30 shadow-2xl pointer-events-none">
                  <p className="text-[9px] text-white opacity-80 leading-relaxed font-mono">{cell.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 5: Bottom Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#00ff41] bg-[#0a0a0a] mt-6">
        {/* Tail Risk Scenarios */}
        <div className="border-r border-[#00ff41] p-4">
          <div className="text-[11px] font-bold text-[#ff4444] tracking-[0.2em] mb-4 uppercase flex items-center gap-2">
            <Zap size={12} /> TAIL RISK SCENARIOS
          </div>
          <div className="flex flex-col gap-4">
            {TAIL_RISK_SCENARIOS.map((s, i) => (
              <div key={i} className="flex flex-col border-b border-[#00ff41]/5 pb-2 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-white/80 uppercase">{s.scenario}</span>
                  <span className={`text-[10px] font-bold ${s.probability > 30 ? 'text-[#ff4444]' : 'text-[#ffaa00]'}`}>{s.probability}%</span>
                </div>
                <div className="w-full h-1 bg-[#111] mb-2 rounded-full overflow-hidden">
                  <div className={`h-full ${s.probability > 30 ? 'bg-[#ff4444]' : 'bg-[#ffaa00]'}`} style={{ width: `${s.probability}%` }} />
                </div>
                <div className="flex justify-between text-[8px] text-[#00ff41]/40 font-mono uppercase tracking-tighter">
                  <span>IMPACT: {s.impact}</span>
                  <span>TRIGGER: {s.trigger}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fear & Greed Indicators */}
        <div className="border-r border-[#00ff41] p-4">
          <div className="text-[11px] font-bold text-[#ffaa00] tracking-[0.2em] mb-4 uppercase flex items-center gap-2">
            <ShieldAlert size={12} /> SENTIMENT GAUGES
          </div>
          <div className="flex flex-col gap-5">
            {[
              { name: 'Put/Call Ratio', val: 0.85, label: 'FEAR', pos: 35 },
              { name: 'CNN Fear & Greed', val: 42, label: 'NEUTRAL', pos: 42 },
              { name: 'AAII Bull/Bear', val: -12, label: 'BEARISH', pos: 25 },
              { name: 'SPY Short Int.', val: 4.2, label: 'LOW', pos: 15 },
              { name: 'Fund Flows', val: -2.1, label: 'OUTFLOW', pos: 30 }
            ].map((g, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[9px] font-bold text-[#00ff41]/60 uppercase tracking-tighter">
                  <span>{g.name}</span>
                  <span>{g.label}</span>
                </div>
                <div className="h-1.5 w-full bg-[#111] rounded-full relative overflow-hidden border border-[#00ff41]/10">
                   <div className="absolute inset-0 bg-gradient-to-r from-[#ff4444] via-[#ffaa00] to-[#00ff41]" />
                   <div className="absolute top-0 h-full w-1 bg-white shadow-[0_0_8px_white] z-10" style={{ left: `${g.pos}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Calendar */}
        <div className="p-4">
          <div className="text-[11px] font-bold text-[#00ff41]/60 tracking-[0.2em] mb-4 uppercase flex items-center gap-2">
            <Calendar size={12} /> VOLATILITY CATALYSTS
          </div>
          <div className="flex flex-col gap-2">
            {RISK_CALENDAR.map((evt, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr_40px] items-center py-1 border-b border-[#00ff41]/5 last:border-0 group">
                <span className="text-[9px] text-[#00ff41]/40 font-mono tracking-tighter">{evt.date}</span>
                <span className="text-[10px] text-white/80 group-hover:text-[#00ff41] transition-colors truncate px-2">{evt.event}</span>
                <span className={`text-[8px] font-bold text-right ${evt.level === 'HIGH' ? 'text-[#ff4444]' : evt.level === 'MEDIUM' ? 'text-[#ffaa00]' : 'text-[#00ff41]'}`}>
                  {evt.level === 'HIGH' ? '⚡HI' : evt.level === 'MEDIUM' ? '⚠ MED' : '● LO'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 6: Contagion Tracker */}
      <div className="mt-8 border-y border-[#00ff41]/20 bg-[#0d0d0d] py-3 overflow-hidden">
        <div className="px-3 mb-2 flex justify-between items-center">
          <span className="text-[9px] font-bold text-[#00ff41]/30 tracking-[0.4em] uppercase">GLOBAL SPILLOVER MONITOR</span>
          <span className="text-[8px] text-[#00ff41]/20 font-mono">SCROLL_H &gt;&gt;</span>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-2 px-3 pb-2">
          {CONTAGION_DATA.map((c, i) => (
            <div key={i} className={`min-w-[140px] p-2 border border-l-4 rounded-sm bg-[#0a0a0a] transition-colors ${
              c.score > 6 ? 'border-[#ff4444]/40 border-l-[#ff4444]' : 
              c.score > 4 ? 'border-[#ffaa00]/40 border-l-[#ffaa00]' : 
              'border-[#00ff41]/40 border-l-[#00ff41]'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-white/90">{c.flag} {c.name}</span>
                <span className="text-[10px] font-mono text-[#00ff41]">{c.score}</span>
              </div>
              <div className="flex flex-col gap-1 text-[8px] font-mono">
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase">Equity</span>
                  <span className={c.equityChange < 0 ? 'text-[#ff4444]' : 'text-[#00ff41]'}>{c.equityChange}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase">CURR/USD</span>
                  <span className="text-[#ffaa00]">{c.currencyVsUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase">CDS BPS</span>
                  <span className="text-white/80">{c.cdsSpread}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer watermark */}
      <div className="text-[9px] text-[#00ff41]/10 font-mono py-8 text-center tracking-[0.4em] uppercase pointer-events-none">
        Risk surveillance active // Contingency plan BRAVO-9 enabled
      </div>
    </motion.div>
  );
};
