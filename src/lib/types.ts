import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export type SensorData = {
  temperature: number;
  humidity: number;
  ammoniaLevel: number; // in ppm
};

export type Kpi = {
  feedConversionRatio: number;
  mortalityRate: number; // percentage
  averageWeight: number; // in kg
  eggsPerDay: number;
};

export interface Flock {
  id: string;
  breed: string;
  count: number;
  initialCount: number;
  averageWeight: number; // in kg
  hatchDate: Timestamp;
  totalFeedConsumed: number; // in kg
  totalCost: number; // in $
};

export const flockSchema = z.object({
  breed: z.string().min(1, 'Breed is required'),
  count: z.coerce.number().min(0, 'Quantity must be zero or more'),
  hatchDate: z.date(),
  initialCount: z.coerce.number().min(1, 'Initial count must be at least 1'),
  averageWeight: z.coerce.number().min(0, 'Average weight must be positive'),
  totalFeedConsumed: z.coerce.number().min(0, 'Feed consumed must be positive'),
  totalCost: z.coerce.number().min(0, 'Total cost must be positive'),
});


export const saleSchema = z.object({
  flockId: z.string().min(1, 'Please select a flock'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  pricePerUnit: z.coerce.number().min(0.01, 'Price must be positive'),
  customer: z.string().min(2, 'Customer name is required'),
  saleDate: z.date(),
});

export interface Sale extends z.infer<typeof saleSchema> {
  id: string, 
  total: number,
  saleDate: Timestamp,
};

export const expenditureSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  amount: z.coerce.number().min(0.01, 'Amount must be positive'),
  description: z.string().optional(),
  expenditureDate: z.date(),
});

export interface Expenditure extends z.infer<typeof expenditureSchema> { 
  id: string,
  expenditureDate: Timestamp,
};

export interface ReportData {
    date: string;
    mortality: number;
    fcr: number;
    avgWeight: number;
}
