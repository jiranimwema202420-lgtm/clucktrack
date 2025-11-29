import type { SensorData, Kpi } from './types';

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
