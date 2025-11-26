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
};

export type ReportData = {
  date: string;
  mortality: number;
  fcr: number; // Feed Conversion Ratio
  avgWeight: number;
};
