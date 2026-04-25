import { 
  MarketIndex, 
  EconomicEvent, 
  YieldCurvePoint, 
  FOMCMeeting, 
  SurpriseData,
  RiskHeatmapCell,
  TailRiskScenario,
  RiskEvent,
  ContagionCountry
} from './types';

// ... existing code ...

// --- RISK TAB DATA ---
export const RISK_SNAPSHOT = [
  { symbol: 'VIX', value: '20.45', change: '+2.12', trend: 'up' },
  { symbol: 'MOVE INDEX', value: '112.4', change: '+5.6', trend: 'up' },
  { symbol: 'HY SPREAD (BPS)', value: '425', change: '+15', trend: 'up' },
  { symbol: 'IG SPREAD (BPS)', value: '135', change: '+5', trend: 'up' },
  { symbol: 'DXY', value: '104.2', change: '+0.4%', trend: 'up' },
  { symbol: 'GOLD/USD', value: '$2,184', change: '+1.2%', trend: 'up' },
];

export const VIX_HISTORY = Array.from({ length: 24 }, (_, i) => ({
  date: `Month ${i + 1}`,
  value: 12 + Math.random() * 25
}));

export const SPREAD_MONITOR_DATA = Array.from({ length: 18 }, (_, i) => ({
  month: `M${i + 1}`,
  hy: 350 + Math.random() * 200,
  ig: 110 + Math.random() * 50
}));

export const RISK_HEATMAP: RiskHeatmapCell[] = [
  { name: 'Equity Volatility', level: 'Elevated', score: 7.2, trend: 'worsening', description: 'VIX rising above 20. Call-put skew widening.' },
  { name: 'Liquidity Risk', level: 'Low', score: 2.5, trend: 'stable', description: 'OIS-Libor spreads remain tight. Treasury liquidity ok.' },
  { name: 'Correlation Risk', level: 'Moderate', score: 5.4, trend: 'worsening', description: 'Stock-bond correlation positive. 60/40 underperforming.' },
  { name: 'Tail Risk', level: 'Moderate', score: 6.1, trend: 'worsening', description: 'Demand for out-of-the-money puts increasing.' },
  
  { name: 'Recession Risk', level: 'Moderate', score: 6.5, trend: 'stable', description: 'Inverted yield curve signals stress for next 12m.' },
  { name: 'Inflation Risk', level: 'High', score: 8.4, trend: 'worsening', description: 'Core services CPI showing structural resistance.' },
  { name: 'Currency Risk', level: 'Moderate', score: 5.8, trend: 'worsening', description: 'DXY strength creating stress for EM importers.' },
  { name: 'Commodity Risk', level: 'High', score: 8.1, trend: 'worsening', description: 'Oil supply shocks widening energy risk premiums.' },
  
  { name: 'Credit Risk', level: 'Moderate', score: 5.2, trend: 'worsening', description: 'Default rates rising in lower-tier HY segments.' },
  { name: 'Banking Stress', level: 'Low', score: 3.1, trend: 'stable', description: 'Capital ratios healthy across G-SIBs.' },
  { name: 'Sovereign Debt Risk', level: 'Moderate', score: 5.9, trend: 'stable', description: 'Fiscal deficit paths attracting market scrutiny.' },
  { name: 'Contagion Risk', level: 'Low', score: 2.8, trend: 'stable', description: 'Direct spillover from property sector limited so far.' },
  
  { name: 'Geopolitical Tension', level: 'High', score: 9.1, trend: 'worsening', description: 'Middle East conflict risk premium at multi-year highs.' },
  { name: 'Energy Supply Risk', level: 'High', score: 8.5, trend: 'worsening', description: 'Threat to key shipping lanes and supply chains.' },
  { name: 'Trade War Risk', level: 'Moderate', score: 6.2, trend: 'worsening', description: 'Tariff rhetoric increasing ahead of elections.' },
  { name: 'EM Stress', level: 'Moderate', score: 6.4, trend: 'worsening', description: 'High USD rates attracting capital out of EM.' }
];

export const TAIL_RISK_SCENARIOS: TailRiskScenario[] = [
  { scenario: 'Hard Landing Recession', probability: 35, impact: 'SPX -25%', trigger: 'Unemployment > 5%' },
  { scenario: 'Credit Market Seizure', probability: 15, impact: 'HY spreads +300bps', trigger: 'Bank failures' },
  { scenario: 'Inflation Re-acceleration', probability: 25, impact: 'Fed hikes again', trigger: 'CPI > 4%' },
  { scenario: 'Geopolitical Shock', probability: 20, impact: 'Oil +40%, Gold +20%', trigger: 'Escalation' }
];

export const RISK_CALENDAR: RiskEvent[] = [
  { date: 'MAY 01', event: 'FOMC Decision', level: 'HIGH', impact: 'Rate trajectory' },
  { date: 'MAY 15', event: 'CPI Print', level: 'HIGH', impact: 'Inflation path' },
  { date: 'JUN 05', event: 'NFP Data', level: 'MEDIUM', impact: 'Labor tightness' },
  { date: 'JUN 20', event: 'Earnings Peak', level: 'MEDIUM', impact: 'Margin pressure' },
  { date: 'JUL 10', event: 'Debt Ceiling Sub', level: 'HIGH', impact: 'Fiscal risk' },
  { date: 'SEP 20', event: 'FOMC Update', level: 'HIGH', impact: 'Dots shift' }
];

export const CONTAGION_DATA: ContagionCountry[] = [
  { name: 'USA', flag: '🇺🇸', score: 4.2, equityChange: -1.2, currencyVsUsd: 100.0, cdsSpread: 35 },
  { name: 'EU', flag: '🇪🇺', score: 5.8, equityChange: -2.1, currencyVsUsd: 1.07, cdsSpread: 55 },
  { name: 'China', flag: '🇨🇳', score: 7.5, equityChange: -3.4, currencyVsUsd: 7.24, cdsSpread: 120 },
  { name: 'Japan', flag: '🇯🇵', score: 3.1, equityChange: 0.5, currencyVsUsd: 154.2, cdsSpread: 25 },
  { name: 'UK', flag: '🇬🇧', score: 5.2, equityChange: -1.5, currencyVsUsd: 1.24, cdsSpread: 45 },
  { name: 'India', flag: '🇮🇳', score: 4.5, equityChange: -0.8, currencyVsUsd: 83.5, cdsSpread: 85 },
  { name: 'EM', flag: '🏳️', score: 6.8, equityChange: -2.8, currencyVsUsd: 95.4, cdsSpread: 180 },
  { name: 'Brazil', flag: '🇧🇷', score: 6.1, equityChange: -1.9, currencyVsUsd: 5.15, cdsSpread: 160 }
];

export const MARKET_INDICES: MarketIndex[] = [
  { symbol: 'SPY', name: 'S&P 500 ETF', price: 512.34, change: 2.45, changePercent: 0.48, high52: 525.12, low52: 410.56 },
  { symbol: 'QQQ', name: 'Nasdaq 100', price: 445.67, change: -1.23, changePercent: -0.28, high52: 460.34, low52: 320.12 },
  { symbol: 'GLD', name: 'Gold Shares', price: 218.45, change: 3.12, changePercent: 1.45, high52: 220.56, low52: 175.45 },
  { symbol: 'SLV', name: 'Silver Trust', price: 26.78, change: 0.45, changePercent: 1.71, high52: 28.12, low52: 20.34 },
  { symbol: 'NYE', name: 'NYSE Composite', price: 17890.12, change: 45.67, changePercent: 0.26, high52: 18234.56, low52: 15456.78 },
  { symbol: 'TLT', name: '20+ Yr Treasury', price: 92.34, change: -0.89, changePercent: -0.95, high52: 105.45, low52: 82.34 },
];

export const YIELD_CURVE_DATA: YieldCurvePoint[] = [
  { maturity: '1M', current: 5.38, oneMonthAgo: 5.42, oneYearAgo: 4.85 },
  { maturity: '3M', current: 5.42, oneMonthAgo: 5.45, oneYearAgo: 5.12 },
  { maturity: '6M', current: 5.34, oneMonthAgo: 5.38, oneYearAgo: 5.08 },
  { maturity: '1Y', current: 5.15, oneMonthAgo: 5.18, oneYearAgo: 4.75 },
  { maturity: '2Y', current: 4.92, oneMonthAgo: 4.78, oneYearAgo: 4.12 },
  { maturity: '5Y', current: 4.65, oneMonthAgo: 4.52, oneYearAgo: 3.85 },
  { maturity: '10Y', current: 4.58, oneMonthAgo: 4.45, oneYearAgo: 3.52 },
  { maturity: '30Y', current: 4.68, oneMonthAgo: 4.58, oneYearAgo: 3.68 },
];

export const UPCOMING_EVENTS: EconomicEvent[] = [
  { date: 'APR 24', event: 'Initial Jobless Claims', importance: 'MEDIUM' },
  { date: 'APR 25', event: 'PCE Price Index (CPI)', importance: 'HIGH', impact: '+0.3% expected' },
  { date: 'MAY 01', event: 'FOMC Rate Decision', importance: 'HIGH', impact: 'Hold expected' },
  { date: 'MAY 03', event: 'Non-Farm Payrolls', importance: 'HIGH', impact: '220k expected' },
  { date: 'MAY 15', event: 'CPI Inflation Data', importance: 'HIGH' },
];

export const RISKS = [
  'Persistent Core Services Inflation',
  'Middle East Geopolitical Escalation',
  'Treasury Issuance Supply Absorption',
  'Commercial Real Estate Refinancing Wall',
  'US Presidential Election Volatility'
];

export const OPPORTUNITIES = [
  'Japanese Equity Structural Reforms',
  'Emerging Markets Bond Carry Trade',
  'AI-Driven Productivity Secular Trend',
  'Energy Infrastructure Capex cycle',
  'Short-Duration Fixed Income Yields'
];

export const SP500_CHART_DATA = Array.from({ length: 52 }, (_, i) => ({
  date: `Week ${i + 1}`,
  price: 4500 + Math.random() * 700 + (i * 10)
}));

// --- RATES TAB DATA ---
export const RATES_SNAPSHOT = [
  { symbol: 'FED FUNDS', value: '5.33%', change: '0.00', trend: 'neutral' },
  { symbol: '10Y TREASURY', value: '4.58%', change: '+0.12', trend: 'up' },
  { symbol: '2Y TREASURY', value: '4.92%', change: '-0.05', trend: 'down' },
  { symbol: '30Y MORTGAGE', value: '7.12%', change: '+0.15', trend: 'up' },
  { symbol: 'PRIME RATE', value: '8.50%', change: '0.00', trend: 'neutral' },
  { symbol: 'SOFR', value: '5.31%', change: '-0.01', trend: 'down' },
];

export const FED_FUNDS_HISTORY = [
  { year: '2015', value: 0.12 }, { year: '2016', value: 0.38 }, { year: '2017', value: 1.15 },
  { year: '2018', value: 2.18 }, { year: '2019', value: 1.85 }, { year: '2020', value: 0.08 },
  { year: '2021', value: 0.08 }, { year: '2022', value: 2.56 }, { year: '2023', value: 5.12 },
  { year: '2024', value: 5.33 }, { year: '2025', value: 5.33 }
];

export const YIELD_SPREAD_DATA = [
  { date: '2023-01', value: -0.65 }, { date: '2023-03', value: -0.85 }, { date: '2023-06', value: -1.05 },
  { date: '2023-09', value: -0.75 }, { date: '2023-12', value: -0.45 }, { date: '2024-03', value: -0.38 }
];

export const FOMC_ODDS: FOMCMeeting[] = [
  { date: 'MAY 01', hold: 98.2, cut: 1.8, hike: 0.0 },
  { date: 'JUN 12', hold: 85.4, cut: 14.6, hike: 0.0 },
  { date: 'JUL 31', hold: 45.2, cut: 54.8, hike: 0.0 },
  { date: 'SEP 18', hold: 12.1, cut: 82.5, hike: 5.4 },
  { date: 'NOV 07', hold: 5.2, cut: 90.8, hike: 4.0 },
];

// --- INFLATION TAB DATA ---
export const INFLATION_SNAPSHOT = [
  { symbol: 'CPI YoY', value: '3.5%', change: '+0.1', trend: 'up' },
  { symbol: 'CORE CPI', value: '3.8%', change: '0.0', trend: 'neutral' },
  { symbol: 'PPI YoY', value: '2.1%', change: '+0.3', trend: 'up' },
  { symbol: 'PCE', value: '2.5%', change: '-0.1', trend: 'down' },
  { symbol: 'CORE PCE', value: '2.8%', change: '0.0', trend: 'neutral' },
  { symbol: 'BREAKEVEN 5Y', value: '2.42%', change: '+0.05', trend: 'up' },
];

export const CPI_SERIES = [
  { date: '2022-04', cpi: 8.3, core: 6.2 }, { date: '2022-08', cpi: 8.3, core: 6.3 },
  { date: '2022-12', cpi: 6.5, core: 5.7 }, { date: '2023-04', cpi: 4.9, core: 5.5 },
  { date: '2023-08', cpi: 3.7, core: 4.3 }, { date: '2023-12', cpi: 3.4, core: 3.9 },
  { date: '2024-04', cpi: 3.5, core: 3.8 }
];

export const INFLATION_WEIGHTS = [
  { category: 'SHELTER', value: 3.2, historical: 2.5 },
  { category: 'FOOD', value: 2.1, historical: 2.2 },
  { category: 'ENERGY', value: -1.2, historical: 0.5 },
  { category: 'APPAREL', value: 0.8, historical: 1.0 },
  { category: 'MEDICAL', value: 1.5, historical: 2.8 },
  { category: 'TRANSPORT', value: 4.2, historical: 2.0 },
  { category: 'OTHER', value: 2.0, historical: 1.8 }
];

export const CPI_SURPRISES: SurpriseData[] = [
  { month: 'MAR', estimate: 3.4, actual: 3.5, surprise: 0.1 },
  { month: 'FEB', estimate: 3.1, actual: 3.2, surprise: 0.1 },
  { month: 'JAN', estimate: 2.9, actual: 3.1, surprise: 0.2 },
  { month: 'DEC', estimate: 3.2, actual: 3.4, surprise: 0.2 },
  { month: 'NOV', estimate: 3.1, actual: 3.1, surprise: 0.0 },
  { month: 'OCT', estimate: 3.3, actual: 3.2, surprise: -0.1 },
];

// --- GROWTH TAB DATA ---
export const GROWTH_SNAPSHOT = [
  { symbol: 'GDP QoQ', value: '1.6%', change: '-0.3', trend: 'down' },
  { symbol: 'GDP YoY', value: '3.1%', change: '+0.2', trend: 'up' },
  { symbol: 'ISM MFG', value: '49.2', change: '-1.1', trend: 'down' },
  { symbol: 'ISM SRV', value: '51.4', change: '+0.4', trend: 'up' },
  { symbol: 'RETAIL SALES', value: '0.7%', change: '+0.1', trend: 'up' },
  { symbol: 'INDUSTR. PROD', value: '0.4%', change: '0.0', trend: 'neutral' },
];

export const GDP_QUARTERLY = [
  { q: '2021 Q1', val: 6.3 }, { q: '2021 Q2', val: 6.7 }, { q: '2021 Q3', val: 2.3 },
  { q: '2021 Q4', val: 7.0 }, { q: '2022 Q1', val: -1.6 }, { q: '2022 Q2', val: -0.6 },
  { q: '2022 Q3', val: 3.2 }, { q: '2022 Q4', val: 2.6 }, { q: '2023 Q1', val: 2.2 },
  { q: '2023 Q2', val: 2.1 }, { q: '2023 Q3', val: 4.9 }, { q: '2023 Q4', val: 3.4 },
  { q: '2024 Q1', val: 1.6 }
];

export const PMI_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  mfg: 47 + Math.random() * 5,
  srv: 50 + Math.random() * 5
}));

export const LEADING_INDICATORS = [
  { name: 'CONF. BOARD LEI', dir: 'down', text: 'Negative for 22 consecutive months' },
  { name: 'YIELD CURVE', dir: 'down', text: 'Deep inversion signals 12m recession risk' },
  { name: 'BUILDING PERMITS', dir: 'up', text: 'Small rebound despite high rates' },
  { name: 'NEW ORDERS', dir: 'neutral', text: 'Stagnant across durable goods' },
  { name: 'CONS. EXPECT.', dir: 'down', text: 'Inflation concerns weighing on sentiment' }
];

// --- LABOR TAB DATA ---
export const LABOR_SNAPSHOT = [
  { symbol: 'UNEMPL. RATE', value: '3.8%', change: '-0.1', trend: 'down' },
  { symbol: 'U-6 RATE', value: '7.3%', change: '0.0', trend: 'neutral' },
  { symbol: 'NFP PRINT', value: '303k', change: '+28k', trend: 'up' },
  { symbol: 'JOLTS', value: '8.75M', change: '-120k', trend: 'down' },
  { symbol: 'QUITS RATE', value: '2.2%', change: '0.0', trend: 'neutral' },
  { symbol: 'PARTICIPATION', value: '62.7%', change: '+0.2', trend: 'up' },
];

export const NFP_HISTORY = Array.from({ length: 12 }, (_, i) => ({
  month: `Month ${i + 1}`,
  actual: 100 + Math.random() * 250,
  estimate: 150 + Math.random() * 100
}));

export const LABOR_HEATMAP = [
  { name: 'HIRING', val: 'STABLE', status: 'neutral' },
  { name: 'FIRING', val: 'LOW', status: 'green' },
  { name: 'QUITS', val: 'MODERATE', status: 'neutral' },
  { name: 'OPENINGS', val: 'HIGH', status: 'green' },
  { name: 'HOURS', val: '34.4h', status: 'neutral' },
  { name: 'TEMP', val: 'DOWN', status: 'red' },
  { name: 'PART-TIME', val: 'UP', status: 'amber' },
  { name: 'PARTIC.', val: '62.7%', status: 'green' },
  { name: 'CLAIMS', val: '210k', status: 'green' }
];
