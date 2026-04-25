import React from 'react';
import { motion } from 'motion/react';
import { Line, Bar } from 'react-chartjs-2';
import { SnapshotBar } from './SnapshotBar';
import { LABOR_SNAPSHOT, NFP_HISTORY, LABOR_HEATMAP, CPI_SURPRISES } from '../constants'; // Reusing surprise structure if needed

export const LaborTab: React.FC = () => {
  const unemploymentData = {
    labels: Array.from({ length: 24 }, (_, i) => `M${i + 1}`),
    datasets: [{
      label: 'Unemployment Rate (%)',
      data: [3.6, 3.6, 3.5, 3.7, 3.8, 3.7, 3.6, 3.5, 3.8, 3.7, 3.6, 3.7, 3.8, 3.9, 3.8, 3.7, 3.8, 3.9, 3.9, 3.8, 3.7, 3.8, 3.7, 3.8],
      borderColor: '#00ff41',
      backgroundColor: 'rgba(0, 255, 65, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }]
  };

  const nfpData = {
    labels: NFP_HISTORY.map(d => d.month),
    datasets: [
      {
        label: 'Actual',
        data: NFP_HISTORY.map(d => d.actual),
        backgroundColor: NFP_HISTORY.map(d => d.actual > 150 ? 'rgba(0, 255, 65, 0.6)' : d.actual > 50 ? 'rgba(255, 170, 0, 0.6)' : 'rgba(255, 68, 68, 0.6)'),
        borderColor: '#00ff41',
        borderWidth: 1,
      },
      {
        label: 'Estimate',
        data: NFP_HISTORY.map(d => d.estimate),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false,
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
      <div className="p-4 border border-[#00ff41] bg-[#00ff41]/5 mb-6 mx-3 text-[11px] font-bold text-[#00ff41] tracking-widest uppercase">
        LABOR MARKET: <span className="blink">LOOSENING BUT RESILIENT</span>
        <div className="mt-2 text-[#00ff41]/60 font-normal normal-case grid grid-cols-2 gap-4 tracking-normal">
          <div>• Job openings (JOLTS) trending lower toward pre-pandemic levels.</div>
          <div>• Wage growth moderating but remains above levels consistent with 2% inflation.</div>
        </div>
      </div>

      <SnapshotBar items={LABOR_SNAPSHOT} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6 px-3">
        <div className="h-[280px] p-4 bg-[#0a0a0a] border border-[#00ff41] terminal-border relative">
          <h3 className="text-[10px] font-bold text-[#00ff41]/60 uppercase mb-4 tracking-widest">Unemployment Rate (2Y HISTORY)</h3>
          <div className="absolute top-[55%] w-full h-8 px-8 pointer-events-none">
            <div className="bg-[#333]/10 border-y border-dashed border-[#00ff41]/20 h-full flex justify-end items-start px-2">
               <span className="text-[8px] text-[#00ff41]/30 font-bold uppercase mt-1 tracking-tighter">Fed Target Zone (4.0-4.5%)</span>
            </div>
          </div>
          <div className="relative h-[200px]">
             <Line data={unemploymentData} options={chartOptions} />
          </div>
        </div>
        <div className="h-[280px] p-4 bg-[#0a0a0a] border border-[#00ff41] terminal-border">
          <h3 className="text-[10px] font-bold text-[#00ff41]/60 uppercase mb-4 tracking-widest">Monthly NFP: Actual vs Estimate</h3>
          <div className="relative h-[200px]">
             <Bar data={nfpData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#00ff41] bg-[#0a0a0a] mt-auto">
        <div className="border-r border-[#00ff41] p-4">
          <div className="text-[11px] font-bold text-[#00ff41] tracking-[0.2em] mb-4 uppercase text-center md:text-left">WAGES & EARNINGS</div>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Avg Hourly Earnings YoY', val: '4.1%', trend: 'down' },
              { label: 'Atlanta Fed Wage Tracker', val: '4.7%', trend: 'neutral' },
              { label: 'Real Wage Growth', val: '+0.6%', trend: 'up' }
            ].map((w, i) => (
              <div key={i} className="flex flex-col gap-1 border-l border-[#00ff41]/20 pl-3">
                <div className="text-[9px] text-[#00ff41]/50 uppercase font-bold tracking-tighter leading-none mb-1">{w.label}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#00ff41]">{w.val}</span>
                  <div className="w-12 h-4 border-b border-[#00ff41]/10 flex items-end">
                    <div className="w-full h-1/2 bg-[#00ff41]/10 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-r border-[#00ff41] p-4">
          <div className="text-[11px] font-bold text-[#00ff41] tracking-[0.2em] mb-4 uppercase text-center md:text-left">LABOR MARKET HEATMAP</div>
          <div className="grid grid-cols-3 gap-1">
            {LABOR_HEATMAP.map((cell, i) => (
              <div key={i} className={`p-2 border border-[#00ff41]/10 flex flex-col items-center justify-center text-center ${
                cell.status === 'green' ? 'bg-[#00ff41]/10' : cell.status === 'red' ? 'bg-[#ff4444]/10' : cell.status === 'amber' ? 'bg-[#ffaa00]/10' : 'bg-[#111]'
              }`}>
                <div className="text-[8px] text-[#888] font-bold uppercase tracking-tighter leading-none mb-1">{cell.name}</div>
                <div className={`text-[10px] font-bold ${
                   cell.status === 'green' ? 'text-[#00ff41]' : cell.status === 'red' ? 'text-[#ff4444]' : cell.status === 'amber' ? 'text-[#ffaa00]' : 'text-white'
                }`}>{cell.val}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="text-[11px] font-bold text-[#00ff41] tracking-[0.2em] mb-4 uppercase text-center md:text-left">NFP SURPRISE HISTORY</div>
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
              {CPI_SURPRISES.map((s, i) => ( // Reusing month/data structure for mock
                <tr key={i} className="border-b border-[#00ff41]/5">
                  <td className="py-1 uppercase font-bold tracking-tighter">{s.month}</td>
                  <td className="text-right py-1">{Math.floor(s.estimate * 50)}k</td>
                  <td className="text-right py-1 text-white">{Math.floor(s.actual * 65)}k</td>
                  <td className={`text-right py-1 font-bold text-[#00ff41]`}>
                    +{Math.floor(s.surprise * 40)}k
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
