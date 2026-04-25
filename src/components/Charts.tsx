import React from 'react';
import { Line } from 'react-chartjs-2';
import { SP500_CHART_DATA, YIELD_CURVE_DATA } from '../constants';

const chartStyles = {
  backgroundColor: '#0a0a0a',
  borderColor: '#00ff41',
  color: '#00ff41',
  gridColor: 'rgba(0, 255, 65, 0.1)',
};

export const SP500Chart: React.FC = () => {
  const data = {
    labels: SP500_CHART_DATA.map(d => d.date),
    datasets: [{
      label: 'Price',
      data: SP500_CHART_DATA.map(d => d.price),
      borderColor: '#00ff41',
      backgroundColor: 'rgba(0, 255, 65, 0.05)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#00ff41',
      pointHoverBorderColor: '#fff',
      fill: true,
      tension: 0.2, // Smoother line
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0d0d0d',
        titleColor: '#00ff41',
        bodyColor: '#fff',
        borderColor: '#00ff41',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#444', font: { size: 9 }, maxRotation: 0 }
      },
      y: {
        grid: { color: chartStyles.gridColor },
        ticks: { color: '#444', font: { size: 9 } }
      }
    }
  };

  return (
    <div className="h-[250px] w-full p-4 bg-[#0a0a0a] border border-[#00ff41] rounded-none terminal-border group transition-all">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-[#00ff41]/60 tracking-widest uppercase">S&P 500 (1 YEAR)</h3>
          <p className="text-base font-bold text-[#00ff41]">5,245.12 <span className="text-[10px] text-[#00ff41]/40 font-normal ml-2">+12.4% YTD</span></p>
        </div>
      </div>
      <Line data={data} options={options} />
    </div>
  );
};

export const YieldCurveChart: React.FC = () => {
  const data = {
    labels: YIELD_CURVE_DATA.map(d => d.maturity),
    datasets: [
      {
        label: 'Current',
        data: YIELD_CURVE_DATA.map(d => d.current),
        borderColor: '#00ff41',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#00ff41',
        tension: 0.1,
      },
      {
        label: '1 Month Ago',
        data: YIELD_CURVE_DATA.map(d => d.oneMonthAgo),
        borderColor: '#0088ff',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 2,
        pointBackgroundColor: '#0088ff',
        tension: 0.1,
      },
      {
        label: '1 Year Ago',
        data: YIELD_CURVE_DATA.map(d => d.oneYearAgo),
        borderColor: '#ffaa00',
        borderWidth: 1.5,
        borderDash: [2, 2],
        pointRadius: 2,
        pointBackgroundColor: '#ffaa00',
        tension: 0.1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#666',
          boxWidth: 10,
          font: { size: 9, family: 'JetBrains Mono' },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: '#0d0d0d',
        titleColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
        padding: 8,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 51, 51, 0.2)' },
        ticks: { color: '#666', font: { size: 10 } }
      },
      y: {
        grid: { color: chartStyles.gridColor },
        ticks: { 
          color: '#666', 
          font: { size: 10 },
          callback: (value: any) => value.toFixed(2) + '%'
        }
      }
    }
  };

  return (
    <div className="h-[250px] w-full p-4 bg-[#0a0a0a] border border-[#00ff41] rounded-none terminal-border group transition-all">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-[#00ff41]/60 tracking-widest uppercase">US TREASURY YIELD CURVE</h3>
          <p className="text-[10px] text-[#00ff41]/40 uppercase font-bold mt-1 tracking-tighter">Status: <span className="text-[#ff4444]">Deeply Inverted</span></p>
        </div>
      </div>
      <Line data={data} options={options} />
    </div>
  );
};
