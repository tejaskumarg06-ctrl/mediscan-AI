import React from 'react';
import { motion } from 'motion/react';
import { Line, Bar } from 'react-chartjs-2';
import { SnapshotBar } from './SnapshotBar';
import { RATES_SNAPSHOT, FED_FUNDS_HISTORY, YIELD_SPREAD_DATA, FOMC_ODDS } from '../constants';

export const RatesTab: React.FC = () => {
  const fedFundsData = {
    labels: FED_FUNDS_HISTORY.map(d => d.year),
    datasets: [{
      label: 'Effective Fed Funds Rate',
      data: FED_FUNDS_HISTORY.map(d => d.value),
      borderColor: '#ffaa00',
      backgroundColor: 'rgba(255, 170, 0, 0.1)',
      borderWidth: 2,
      stepped: true,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#ffaa00',
    }]
  };

  const spreadData = {
    labels: YIELD_SPREAD_DATA.map(d => d.date),
    datasets: [{
      label: '2Y-10Y Spread',
      data: YIELD_SPREAD_DATA.map(d => d.value),
      backgroundColor: YIELD_SPREAD_DATA.map(d => d.value < 0 ? 'rgba(255, 68, 68, 0.6)' : 'rgba(0, 255, 65, 0.6)'),
      borderColor: YIELD_SPREAD_DATA.map(d => d.value < 0 ? '#ff4444' : '#00ff41'),
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
      <div className="p-4 border border-[#ffaa00] bg-[#ffaa00]/5 mb-6 mx-3 text-[11px] font-bold text-[#ffaa00] tracking-widest uppercase">
        MONETARY POLICY REGIME: <span className="blink">RESTRICTIVE / HAWKISH</span>
        <div className="mt-2 text-[#ffaa00]/60 font-normal normal-case grid grid-cols-2 gap-4 tracking-normal">
          <div>• Fed maintaining policy at 23-year highs to combat service inflation.</div>
          <div>• Market pricing in first normalization cut for Late Q3 / Early Q4.</div>
        </div>
      </div>

      <SnapshotBar items={RATES_SNAPSHOT} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6 px-3">
        <div className="h-[280px] p-4 bg-[#0a0a0a] border border-[#00ff41] terminal-border">
          <h3 className="text-[10px] font-bold text-[#00ff41]/60 uppercase mb-4 tracking-widest">Fed Funds Rate History (Step)</h3>
          <div className="relative h-[200px]">
             <Line data={fedFundsData} options={chartOptions} />
          </div>
        </div>
        <div className="h-[280px] p-4 bg-[#0a0a0a] border border-[#00ff41] terminal-border relative">
          <h3 className="text-[10px] font-bold text-[#00ff41]/60 uppercase mb-4 tracking-widest">2Y vs 10Y Yield Spread</h3>
          <div className="absolute top-4 right-4 text-[9px] text-[#ff4444] font-bold uppercase tracking-tighter">Inverted Zone</div>
          <div className="relative h-[200px]">
             <Bar data={spreadData} options={{...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, min: -1.5, max: 0.5 }}}} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-[#00ff41] bg-[#0a0a0a] mt-auto">
        <div className="border-r border-[#00ff41] p-4">
          <div className="text-[11px] font-bold text-[#00ff41] tracking-[0.2em] mb-4 uppercase">FOMC PROBABILITY MATRIX</div>
          <table className="w-full text-[10px] text-[#00ff41]/80">
            <thead>
              <tr className="border-b border-[#00ff41]/20">
                <th className="text-left py-1 uppercase tracking-tighter">Meeting</th>
                <th className="text-right py-1 uppercase tracking-tighter">Hold %</th>
                <th className="text-right py-1 uppercase tracking-tighter">Cut %</th>
                <th className="text-right py-1 uppercase tracking-tighter">Hike %</th>
              </tr>
            </thead>
            <tbody>
              {FOMC_ODDS.map((m, i) => (
                <tr key={i} className="border-b border-[#00ff41]/5 hover:bg-[#00ff41]/5 transition-colors">
                  <td className="py-2 font-bold">{m.date}</td>
                  <td className={`text-right py-2 ${m.hold > 50 ? 'text-[#00ff41] font-bold underline' : ''}`}>{m.hold}%</td>
                  <td className={`text-right py-2 ${m.cut > 50 ? 'text-[#00ff41] font-bold underline' : ''}`}>{m.cut}%</td>
                  <td className="text-right py-2">{m.hike}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4">
          <div className="text-[11px] font-bold text-[#00ff41] tracking-[0.2em] mb-4 uppercase">GLOBAL CENTRAL BANK POLICY</div>
          <div className="flex flex-col gap-3">
             {[
               { bank: 'FED', rate: 5.33, color: '#00ff41' },
               { bank: 'ECB', rate: 4.50, color: '#00ff41' },
               { bank: 'BOE', rate: 5.25, color: '#00ff41' },
               { bank: 'BOJ', rate: 0.10, color: '#ffaa00' },
               { bank: 'PBOC', rate: 3.45, color: '#ff4444' }
             ].map((b, i) => (
               <div key={i} className="flex flex-col gap-1">
                 <div className="flex justify-between text-[9px] font-bold">
                   <span className="tracking-widest">{b.bank}</span>
                   <span>{b.rate.toFixed(2)}%</span>
                 </div>
                 <div className="h-2 bg-[#00ff41]/10 border border-[#00ff41]/20">
                   <div className="h-full bg-[#00ff41]/40" style={{ width: `${(b.rate / 6) * 100}%` }} />
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
