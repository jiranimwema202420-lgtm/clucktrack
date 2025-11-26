import type { SensorData, Kpi, Flock, ReportData } from './types';

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

export const mockFlocks: Flock[] = [
  {
    id: 'FLK-001',
    breed: 'Cobb 500',
    count: 1936,
    age: 5,
    averageWeight: 1.8,
    hatchDate: '2024-05-20',
  },
  {
    id: 'FLK-002',
    breed: 'Ross 308',
    count: 2450,
    age: 3,
    averageWeight: 0.9,
    hatchDate: '2024-06-10',
  },
  {
    id: 'FLK-003',
    breed: 'Hubbard',
    count: 2100,
    age: 8,
    averageWeight: 2.5,
    hatchDate: '2024-04-29',
  },
    {
    id: 'FLK-004',
    breed: 'Leghorn',
    count: 500,
    age: 22,
    averageWeight: 1.5,
    hatchDate: '2024-01-15',
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
