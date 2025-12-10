
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export interface SensorData {
  id?: string;
  temperature: number;
  humidity: number;
  ammoniaLevel: number; // in ppm
  timestamp: Timestamp;
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
  type: 'Broiler' | 'Layer';
  count: number;
  initialCount: number;
  averageWeight: number; // in kg
  hatchDate: Timestamp;
  totalFeedConsumed: number; // in kg
  totalCost: number;
  eggProductionRate?: number; // percentage
  totalEggsCollected?: number;
};

const flockObjectSchema = z.object({
  breed: z.string().min(2, 'Breed name must be at least 2 characters.'),
  type: z.enum(['Broiler', 'Layer'], { required_error: 'Please select a flock type.'}),
  count: z.coerce.number().min(1, 'Current count must be at least 1.'),
  hatchDate: z.date({ required_error: 'Please select a hatch date.' }),
  initialCount: z.coerce.number().min(1, 'Initial count must be at least 1.'),
  averageWeight: z.coerce.number().min(0, 'Average weight must be a positive number.'),
  totalFeedConsumed: z.coerce.number().min(0, 'Total feed consumed must be a positive number.'),
  totalCost: z.coerce.number().min(0, 'Total cost must be a positive number.'),
  eggProductionRate: z.coerce.number().min(0).max(100).optional(),
  totalEggsCollected: z.coerce.number().min(0).optional(),
});

export const flockSchema = flockObjectSchema.refine(data => data.count <= data.initialCount, {
    message: "Current count cannot be greater than initial count.",
    path: ["count"],
}).refine(data => data.type === 'Broiler' || (data.eggProductionRate != null && data.totalEggsCollected != null), {
    message: "Egg production details are required for Layer flocks.",
    path: ["eggProductionRate"],
});

export const saleSchema = z.object({
  flockId: z.string().min(1, 'A flock must be selected for the sale.'),
  saleType: z.enum(['Birds', 'Eggs'], { required_error: 'Please select a sale type.'}),
  quantity: z.coerce.number().positive('Sale quantity must be greater than zero.'),
  pricePerUnit: z.coerce.number().positive('Price per unit must be greater than zero.'),
  customer: z.string().min(2, 'Customer name must be at least 2 characters.'),
  saleDate: z.date({ required_error: 'Please select a sale date.' }),
  total: z.coerce.number(),
});

export interface Sale {
  id: string, 
  flockId: string,
  saleType: 'Birds' | 'Eggs',
  quantity: number,
  pricePerUnit: number,
  customer: string,
  saleDate: Timestamp,
  total: number,
};

export const expenditureSchema = z.object({
  category: z.string().min(1, 'An expenditure category must be selected.'),
  quantity: z.coerce.number().positive('Quantity must be a positive number.'),
  unitPrice: z.coerce.number().positive('Unit price must be a positive number.'),
  amount: z.coerce.number(),
  description: z.string().optional(),
  expenditureDate: z.date({ required_error: 'Please select an expenditure date.' }),
  flockId: z.string().optional(),
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

export interface UserProfile {
  id: string;
  displayName?: string;
  email: string;
  farmName?: string;
  farmLocation?: string;
  farmContact?: string;
  currency?: string;
}

export const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    type: z.enum(['Supplier', 'Buyer'], { required_error: 'Please select a contact type.'}),
    contactPerson: z.string().optional(),
    email: z.string().email('Please enter a valid email address.'),
    phone: z.string().optional(),
    address: z.string().optional(),
    products: z.string().optional(),
  });
  
  export interface Contact extends z.infer<typeof contactSchema> {
    id: string;
  }
