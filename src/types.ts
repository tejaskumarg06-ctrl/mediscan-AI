export type TabType = 'OVERVIEW' | 'RATES' | 'INFLATION' | 'GROWTH' | 'LABOR' | 'RISK';

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high52: number;
  low52: number;
}

export interface EconomicEvent {
  date: string;
  event: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  impact?: string;
}

export interface FOMCMeeting {
  date: string;
  hold: number;
  cut: number;
  hike: number;
}

export interface SurpriseData {
  month: string;
  estimate: number;
  actual: number;
  surprise: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface YieldCurvePoint {
  maturity: string;
  current: number;
  oneMonthAgo: number;
  oneYearAgo: number;
}

export interface RiskHeatmapCell {
  name: string;
  level: string;
  score: number;
  trend: 'worsening' | 'improving' | 'stable';
  description: string;
}

export interface TailRiskScenario {
  scenario: string;
  probability: number;
  impact: string;
  trigger: string;
}

export interface RiskEvent {
  date: string;
  event: string;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
}

export interface ContagionCountry {
  name: string;
  flag: string;
  score: number;
  equityChange: number;
  currencyVsUsd: number;
  cdsSpread: number;
}
