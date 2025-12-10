
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Boxes, DollarSign, BrainCircuit, LayoutDashboard, Settings } from 'lucide-react';

const gettingStartedSteps = [
  {
    step: 1,
    title: 'Set Up Your Farm',
    description: "Go to the Settings page to enter your farm's name and location, and select your preferred currency. This helps personalize your experience.",
    icon: <Settings className="h-8 w-8 text-primary" />,
  },
  {
    step: 2,
    title: 'Add Your First Flock',
    description: 'Navigate to the Inventory page and click "Add Chicks". Enter the details of your new flock, such as breed, quantity, and hatch date. This is the starting point for all tracking.',
    icon: <Boxes className="h-8 w-8 text-primary" />,
  },
  {
    step: 3,
    title: 'Record an Expenditure',
    description: 'Go to the Expenditure page to log your first expense. You can manually enter details or try the "Scan Receipt" feature for a faster experience. Assign costs to specific flocks where applicable.',
    icon: <DollarSign className="h-8 w-8 text-primary" />,
  },
  {
    step: 4,
    title: 'Explore Your Dashboard',
    description: 'Return to the Dashboard to see your farm\'s key metrics update in real-time. This is your central hub for monitoring your farm\'s performance at a glance.',
    icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to CluckHub!</h1>
        <p className="text-lg text-muted-foreground">
          Here’s a quick guide to help you get started and make the most of the app.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started in 4 Easy Steps</CardTitle>
          <CardDescription>
            Follow these steps to get your farm operational in CluckHub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {gettingStartedSteps.map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center p-4 rounded-lg border">
                <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 relative">
                  {item.icon}
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Understanding Key Features</CardTitle>
          <CardDescription>
            A quick look at the core pages of the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
                <Boxes className="h-6 w-6 text-primary mt-1" />
                <div>
                    <h4 className="font-semibold">Inventory</h4>
                    <p className="text-muted-foreground text-sm">This is the heart of your operation. Add new flocks (both broilers and layers), record losses, and track the age and quantity of your birds. All flock-related activities start here.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <DollarSign className="h-6 w-6 text-primary mt-1" />
                <div>
                    <h4 className="font-semibold">Sales & Expenditures</h4>
                    <p className="text-muted-foreground text-sm">Log all your income and expenses. When you sell birds or eggs, the inventory is automatically updated. Use the receipt scanner to make logging expenses even easier.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <BrainCircuit className="h-6 w-6 text-primary mt-1" />
                <div>
                    <h4 className="font-semibold">AI Tools</h4>
                    <p className="text-muted-foreground text-sm">Leverage the power of AI to optimize your feed mix for cost and growth, predict potential health issues before they become serious, and get answers to your poultry management questions.</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
