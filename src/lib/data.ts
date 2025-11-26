import type { SensorData, Kpi, Flock, ReportData, Sale, Expenditure } from './types';
import { Timestamp } from 'firebase/firestore';

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

// This mock data is no longer the source of truth, but can be kept for reference or testing.
export const mockFlocks: Flock[] = [
  {
    id: 'FLK-001',
    breed: 'Cobb 500',
    count: 1936,
    initialCount: 2000,
    age: 5,
    averageWeight: 1.8,
    hatchDate: Timestamp.fromDate(new Date('2024-05-20')),
    totalFeedConsumed: 5200,
    totalCost: 2340,
  },
];

export const mockReportData: ReportData[] = [
    { date: 'Jan', mortality: 4.0, fcr: 1.7, avgWeight: 1.8 },
    { date: 'Feb', mortality: 3.5, fcr: 1.65, avgWeight: 1.9 },
    { date: 'Mar', mortality: 3.2, fcr: 1.6, avgWeight: 2.0 },
    { date: 'Apr', mortality: 3.0, fcr: 1.55, avgWeight: 2.1 },
    { date: 'May', mortality: 2.8, fcr: 1.5, avgWeight: 2.2 },
    { date: 'Jun', mortality: 2.5, fcr: 1.48, avgWeight: 2.3 },
];

export const mockSales: Sale[] = [
    { id: 'SALE-001', flockId: 'FLK-003', quantity: 50, pricePerUnit: 10, customer: 'Local Restaurant', saleDate: Timestamp.fromDate(new Date('2024-06-28')), total: 500 },
];

export const mockExpenditures: Expenditure[] = [
    { id: 'EXP-001', category: 'Feed', amount: 1200, description: 'Starter feed for FLK-002', expenditureDate: Timestamp.fromDate(new Date('2024-06-29')) },
];
