import React from 'react';
import { motion } from 'motion/react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { SnapshotBar } from './SnapshotBar';
import { GROWTH_SNAPSHOT, GDP_QUARTERLY, PMI_DATA, LEADING_INDICATORS } from '../constants';

export const GrowthTab: React.FC = () => {
  const gdpData = {
    labels: GDP_QUARTERLY.map(d => d.q),
    datasets: [{
      label: 'GDP QoQ Growth',
      data: GDP_QUARTERLY.map(d => d.val),
      backgroundColor: GDP_QUARTERLY.map(d => d.val < 0 ? 'rgba(255, 68, 68, 0.6)' : 'rgba(0, 255, 65, 0.6)'),
      borderColor: GDP_QUARTERLY.map(d => d.val < 0 ? '#ff4444' : '#00ff41'),
      borderWidth: 1,
    }]
  };

  const pmiData = {
    labels: PMI_DATA.map(d => d.month),
    datasets: [
      {
        label: 'ISM MFG',
        data: PMI_DATA.map(d => d.mfg),
        borderColor: '#ffaa00',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3,
      },
      {
        label: 'ISM SERVICES',
        data: PMI_DATA.map(d => d.srv),
        borderColor: '#0088ff',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3,
      }
    ]
  };

  const compositionData = {
    labels: ['Consumption', 'Investment', 'Govt', 'Net Exports'],
    datasets: [{
      data: [68, 18, 17, -3],
      backgroundColor: [
        'rgba(0, 255, 65, 0.8)',
        'rgba(0, 255, 65, 0.6)',
        'rgba(0, 255, 65, 0.4)',
        'rgba(255, 68, 68, 0.6)',
      ],
      borderColor: '#0a0a0a',
      borderWidth: 2,
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
      <div className="p-4 border border-[#00ff41] bg-[#00ff41]/5 mb-6 mx-3 text-[11px] font-bold text-[#00ff41] tracking-widest uppercase">
        GROWTH OUTLOOK: <span className="blink">MODERATING / NORMALIZING</span>
        <div className="mt-2 text-[#00ff41]/60 font-normal normal-case grid grid-cols-2 gap-4 tracking-normal">
          <div>• Consumer spending resilient but rotating from goods to services.</div>
          <div>• Manufacturing sector remains in contraction territory (PMI &lt; 50).</div>
        </div>
      </div>

      <SnapshotBar items={GROWTH_SNAPSHOT} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6 px-3">
        <div className="h-[280px] p-4 bg-[#0a0a0a] border border-[#00ff41] terminal-border relative">
          <h3 className="text-[10px] font-bold text-[#00ff41]/60 uppercase mb-4 tracking-widest">Quarterly GDP Growth Rate (%)</h3>
          <div className="absolute inset-0 px-8 py-12 pointer-events-none flex justify-around">
             {/* Simple recession shading simulation */}
             <div className="w-12 h-full bg-[#333]/10" />
          </div>
          <div className="relative h-[200px]">
             <Bar data={gdpData} options={chartOptions} />
          </div>
        </div>
        <div className="h-[280px] p-4 bg-[#0a0a0a] border border-[#00ff41] terminal-border relative">
          <h3 className="text-[10px] font-bold text-[#00ff41]/60 uppercase mb-4 tracking-widest">ISM PMI: MFG VS SERVICES</h3>
          <div className="absolute top-[48%] w-full pr-12 pointer-events-none">
            <div className="border-t border-dashed border-[#ff4444]/40 relative">
              <span className="absolute right-0 -top-2.5 text-[8px] text-[#ff4444] font-bold">50 = EXP/CON</span>
            </div>
          </div>
          <div className="relative h-[200px]">
             <Line data={pmiData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#00ff41] bg-[#0a0a0a] mt-auto">
        <div className="border-r border-[#00ff41] p-4">
          <div className="text-[11px] font-bold text-[#00ff41] tracking-[0.2em] mb-4 uppercase">LEADING INDICATORS</div>
          <div className="flex flex-col gap-3">
            {LEADING_INDICATORS.map((indicator, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-[#00ff41]/80">{indicator.name}</span>
                  <span className={indicator.dir === 'down' ? 'text-[#ff4444]' : indicator.dir === 'up' ? 'text-[#00ff41]' : 'text-[#ffaa00]'}>
                    {indicator.dir === 'down' ? '▼' : indicator.dir === 'up' ? '▲' : '▬'}
                  </span>
                </div>
                <div className="text-[8px] text-[#00ff41]/40 mt-1 uppercase tracking-tighter leading-tight">{indicator.text}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-r border-[#00ff41] p-4 flex flex-col items-center">
          <div className="text-[11px] font-bold text-[#00ff41] tracking-[0.2em] mb-4 w-full uppercase">GDP COMPOSITION</div>
          <div className="h-32 w-full relative">
            <Pie data={compositionData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#00ff41', font: { size: 9, family: 'JetBrains Mono' } } } } }} />
          </div>
        </div>
        <div className="p-4 flex flex-col items-center justify-center">
          <div className="text-[11px] font-bold text-[#00ff41]/60 tracking-[0.2em] mb-6 uppercase w-full">Recession probability</div>
          <div className="text-5xl font-bold [text-shadow:0_0_15px_rgba(0,255,65,0.4)] mb-2">34%</div>
          <div className="text-[9px] text-[#888] font-bold tracking-[0.2em] mb-4">12-MONTH PROBABILITY</div>
          <div className="w-full h-3 bg-[#111] border border-[#00ff41]/20 rounded-full overflow-hidden relative">
             <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00ff41] via-[#ffaa00] to-[#ff4444]" style={{ width: '100%' }} />
             <div className="absolute top-0 right-0 h-full bg-[#0a0a0a]" style={{ width: '66%' }} />
             <div className="absolute top-0 left-[34%] h-full w-0.5 bg-white shadow-[0_0_8px_white]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
