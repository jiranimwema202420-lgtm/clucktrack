import type { SensorData, Kpi, ReportData } from './types';

export const mockSensorData: SensorData = {
  temperature: 24,
  humidity: 60,
  ammoniaLevel: 15,
};

export const mockKpis: Kpi = {
  feedConversionRatio: 1.5,
  mortalityRate: 3.2,
  averageWeight: 2.1,
  eggsPerDay: 450,
};

export const mockReportData: ReportData[] = [
    { date: 'Jan', mortality: 4.0, fcr: 1.7, avgWeight: 1.8 },
    { date: 'Feb', mortality: 3.5, fcr: 1.65, avgWeight: 1.9 },
    { date: 'Mar', mortality: 3.2, fcr: 1.6, avgWeight: 2.0 },
    { date: 'Apr', mortality: 3.0, fcr: 1.55, avgWeight: 2.1 },
    { date: 'May', mortality: 2.8, fcr: 1.5, avgWeight: 2.2 },
    { date: 'Jun', mortality: 2.5, fcr: 1.48, avgWeight: 2.3 },
];
