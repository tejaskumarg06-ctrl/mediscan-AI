import React from 'react';
import { motion } from 'motion/react';
import { Line, Bar } from 'react-chartjs-2';
import { SnapshotBar } from './SnapshotBar';
import { INFLATION_SNAPSHOT, CPI_SERIES, INFLATION_WEIGHTS, CPI_SURPRISES } from '../constants';

export const InflationTab: React.FC = () => {
  const cpiData = {
    labels: CPI_SERIES.map(d => d.date),
    datasets: [
      {
        label: 'CPI YoY',
        data: CPI_SERIES.map(d => d.cpi),
        borderColor: '#ffaa00',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
      },
      {
        label: 'CORE CPI YoY',
        data: CPI_SERIES.map(d => d.core),
        borderColor: '#00ff41',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
      }
    ]
  };

  const weightsData = {
    labels: INFLATION_WEIGHTS.map(d => d.category),
    datasets: [{
      label: 'Contribution',
      data: INFLATION_WEIGHTS.map(d => d.value),
      backgroundColor: INFLATION_WEIGHTS.map(d => d.value > d.historical ? 'rgba(255, 68, 68, 0.6)' : 'rgba(0, 255, 65, 0.6)'),
      borderColor: INFLATION_WEIGHTS.map(d => d.value > d.historical ? '#ff4444' : '#00ff41'),
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'bottom' as const,
        labels: { color: '#00ff41', font: { family: 'JetBrains Mono', size: 9 }, boxWidth: 10 }
      },
      tooltip: {
        backgroundColor: '#0d0d0d',
        borderColor: '#00ff41',
        borderWidth: 1,
        titleFont: { family: 'JetBrains Mono' },
        bodyFont: { family: 'JetBrains Mono' },
      }
    },
    scales: {
      x: { grid: { color: 'rgba(0, 255, 65, 0.05)' }, ticks: { color: '#00ff41', font: { size: 9, family: 'JetBrains Mono' } } },
      y: { grid: { color: 'rgba(0, 255, 65, 0.05)' }, ticks: { color: '#00ff41', font: { size: 9, family: 'JetBrains Mono' } } }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full overflow-y-auto pt-6">
      <div className="p-4 border border-[#ff4444] bg-[#ff4444]/5 mb-6 mx-3 text-[11px] font-bold text-[#ff4444] tracking-widest uppercase">
        INFLATION REGIME: <span className="blink">STRUCTURAL RESISTANCE</span>
        <div className="mt-2 text-[#ff4444]/60 font-normal normal-case grid grid-cols-2 gap-4 tracking-normal">
          <div>• Shelter and services data proving stickier than goods deflation.</div>
          <div>• Base effects turning into headwinds for the remainder of current fiscal year.</div>
        </div>
      </div>

      <SnapshotBar items={INFLATION_SNAPSHOT} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6 px-3">
        <div className="h-[280px] p-4 bg-[#0a0a0a] border border-[#00ff41] terminal-border relative">
          <h3 className="text-[10px] font-bold text-[#00ff41]/60 uppercase mb-4 tracking-widest">CPI vs CORE CPI (2Y HISTORY)</h3>
          <div className="absolute top-10 w-full px-8 pointer-events-none">
            <div className="border-t border-dashed border-[#ff4444]/40 relative">
              <span className="absolute right-0 -top-2.5 text-[8px] text-[#ff4444] font-bold">FED 2% TARGET</span>
            </div>
          </div>
          <div className="relative h-[200px]">
             <Line data={cpiData} options={chartOptions} />
          </div>
        </div>
        <div className="h-[280px] p-4 bg-[#0a0a0a] border border-[#00ff41] terminal-border">
          <h3 className="text-[10px] font-bold text-[#00ff41]/60 uppercase mb-4 tracking-widest">Inflation Category Contribution</h3>
          <div className="relative h-[200px]">
             <Bar data={weightsData} options={{...chartOptions, indexAxis: 'y', plugins: { ...chartOptions.plugins, legend: { display: false }}}} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#00ff41] bg-[#0a0a0a] mt-auto">
        <div className="border-r border-[#00ff41] p-4">
          <div className="text-[11px] font-bold text-[#00ff41]/60 tracking-[0.2em] mb-4 uppercase">Narrative Analysis</div>
          <div className="text-[10px] text-[#00ff41]/80 font-mono leading-relaxed">
            - Services-led stickiness.<br />
            - Commodity price rebound.<br />
            - Wage pressures normalizing.
          </div>
        </div>
        <div className="border-r border-[#00ff41] p-4">
          <div className="text-[11px] font-bold text-[#00ff41] tracking-[0.2em] mb-4 uppercase">CPI SURPRISE HISTORY</div>
          <table className="w-full text-[10px] text-[#00ff41]/80">
            <thead>
              <tr className="border-b border-[#00ff41]/20">
                <th className="text-left py-1 font-bold">MONTH</th>
                <th className="text-right py-1 font-bold">EST</th>
                <th className="text-right py-1 font-bold">ACTUAL</th>
                <th className="text-right py-1 font-bold">DIFF</th>
              </tr>
            </thead>
            <tbody>
              {CPI_SURPRISES.map((s, i) => (
                <tr key={i} className="border-b border-[#00ff41]/5">
                  <td className="py-1 tracking-tighter">{s.month}</td>
                  <td className="text-right py-1">{s.estimate}%</td>
                  <td className="text-right py-1 text-white">{s.actual}%</td>
                  <td className={`text-right py-1 font-bold ${s.surprise > 0 ? 'text-[#ff4444]' : 'text-[#00ff41]'}`}>
                    {s.surprise > 0 ? `+${s.surprise}` : s.surprise}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4">
          <div className="text-[11px] font-bold text-[#00ff41] tracking-[0.2em] mb-4 uppercase">US REAL YIELDS</div>
          <div className="grid grid-cols-2 gap-2">
             {[
               { label: '2Y REAL', val: 1.42, nominal: 4.92, inf: 3.5 },
               { label: '5Y REAL', val: 2.15, nominal: 4.65, inf: 2.5 },
               { label: '10Y REAL', val: 2.08, nominal: 4.58, inf: 2.5 },
               { label: '30Y REAL', val: 2.18, nominal: 4.68, inf: 2.5 }
             ].map((r, i) => (
               <div key={i} className={`p-2 border border-[#00ff41]/20 ${r.val < 0 ? 'bg-[#ff4444]/10' : 'bg-[#00ff41]/5'}`}>
                 <div className="text-[8px] text-[#00ff41]/50 uppercase font-bold">{r.label}</div>
                 <div className={`text-base font-bold ${r.val < 0 ? 'text-[#ff4444]' : 'text-[#00ff41]'}`}>{r.val.toFixed(2)}%</div>
                 <div className="text-[8px] text-[#444] mt-1 tracking-tighter">({r.nominal}% - {r.inf}%)</div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
