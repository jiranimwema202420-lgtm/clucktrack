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
  breed: z.string().min(2, 'Breed name must be at least 2 characters.'),
  count: z.coerce.number().min(1, 'Current count must be at least 1.'),
  hatchDate: z.date({ required_error: 'Please select a hatch date.' }),
  initialCount: z.coerce.number().min(1, 'Initial count must be at least 1.'),
  averageWeight: z.coerce.number().min(0, 'Average weight must be a positive number.'),
  totalFeedConsumed: z.coerce.number().min(0, 'Total feed consumed must be a positive number.'),
  totalCost: z.coerce.number().min(0, 'Total cost must be a positive number.'),
}).refine(data => data.count <= data.initialCount, {
    message: "Current count cannot be greater than initial count.",
    path: ["count"],
});

export const updateFlockSchema = flockSchema.omit({ totalCost: true });

export const saleSchema = z.object({
  flockId: z.string().min(1, 'A flock must be selected for the sale.'),
  quantity: z.coerce.number().positive('Sale quantity must be greater than zero.'),
  pricePerUnit: z.coerce.number().positive('Price per bird must be greater than zero.'),
  customer: z.string().min(2, 'Customer name must be at least 2 characters.'),
  saleDate: z.date({ required_error: 'Please select a sale date.' }),
});

export interface Sale extends z.infer<typeof saleSchema> {
  id: string, 
  total: number,
  saleDate: Timestamp,
};

export const expenditureSchema = z.object({
  category: z.string().min(1, 'An expenditure category must be selected.'),
  quantity: z.coerce.number().positive('Quantity must be a positive number.'),
  unitPrice: z.coerce.number().positive('Unit price must be a positive number.'),
  description: z.string().optional(),
  expenditureDate: z.date({ required_error: 'Please select an expenditure date.' }),
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

export interface UserProfile {
  id: string;
  displayName?: string;
  email: string;
  farmName?: string;
  farmLocation?: string;
  farmContact?: string;
}
