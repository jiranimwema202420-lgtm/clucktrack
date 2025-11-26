import type { SensorData, Kpi, Flock, ReportData, Sale, Expenditure } from './types';

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

export const mockSales: Sale[] = [
    { id: 'SALE-001', flockId: 'FLK-003', quantity: 50, pricePerUnit: 10, customer: 'Local Restaurant', saleDate: new Date('2024-06-28'), total: 500 },
    { id: 'SALE-002', flockId: 'FLK-001', quantity: 100, pricePerUnit: 9.5, customer: 'Butcher Shop', saleDate: new Date('2024-06-25'), total: 950 },
    { id: 'SALE-003', flockId: 'FLK-001', quantity: 80, pricePerUnit: 9.75, customer: 'Grocer', saleDate: new Date('2024-05-15'), total: 780 },
    { id: 'SALE-004', flockId: 'FLK-004', quantity: 200, pricePerUnit: 0.5, customer: 'Market Vendor', saleDate: new Date('2024-05-10'), total: 100 },
];

export const mockExpenditures: Expenditure[] = [
    { id: 'EXP-001', category: 'Feed', amount: 1200, description: 'Starter feed for FLK-002', expenditureDate: new Date('2024-06-29') },
    { id: 'EXP-002', category: 'Medicine', amount: 150, description: 'Vaccines for new chicks', expenditureDate: new Date('2024-06-28') },
    { id: 'EXP-003', category: 'Utilities', amount: 350, description: 'Electricity bill', expenditureDate: new Date('2024-06-25') },
    { id: 'EXP-004', category: 'Feed', amount: 1100, description: 'Grower feed for FLK-001', expenditureDate: new Date('2024-05-22') },
    { id: 'EXP-005', category: 'Labor', amount: 800, description: 'May labor costs', expenditureDate: new Date('2024-05-31') },
];