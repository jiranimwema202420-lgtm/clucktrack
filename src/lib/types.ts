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
  averageWeight: z.coerce.number().positive('Average weight must be positive'),
  totalFeedConsumed: z.coerce.number().min(0, 'Feed consumed must be a positive number'),
  totalCost: z.coerce.number().min(0, 'Total cost must be a positive number'),
});


export const saleSchema = z.object({
  flockId: z.string().min(1, 'Please select a flock'),
  quantity: z.coerce.number().positive('Quantity must be greater than zero'),
  pricePerUnit: z.coerce.number().positive('Price must be greater than zero'),
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
  quantity: z.coerce.number().positive('Quantity must be a positive number.'),
  unitPrice: z.coerce.number().positive('Unit price must be a positive number.'),
  description: z.string().optional(),
  expenditureDate: z.date(),
});

export interface Expenditure extends z.infer<typeof expenditureSchema> { 
  id: string,
  amount: number,
  expenditureDate: Timestamp,
};

export interface ReportData {
    date: string;
    mortality: number;
    fcr: number;
    avgWeight: number;
}
