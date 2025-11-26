import { z } from 'zod';

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

export type Flock = {
  id: string;
  breed: string;
  count: number;
  age: number; // in weeks
  averageWeight: number; // in kg
  hatchDate: string;
  totalFeedConsumed: number; // in kg
  totalCost: number; // in $
};

export type ReportData = {
  date: string;
  mortality: number;
  fcr: number; // Feed Conversion Ratio
  avgWeight: number;
};

const saleSchema = z.object({
  flockId: z.string().min(1, 'Please select a flock'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  pricePerUnit: z.coerce.number().min(0.01, 'Price must be positive'),
  customer: z.string().min(2, 'Customer name is required'),
  saleDate: z.date(),
});

export type Sale = z.infer<typeof saleSchema> & { id: string, total: number };

const expenditureSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  amount: z.coerce.number().min(0.01, 'Amount must be positive'),
  description: z.string().optional(),
  expenditureDate: z.date(),
});

export type Expenditure = z.infer<typeof expenditureSchema> & { id: string };
