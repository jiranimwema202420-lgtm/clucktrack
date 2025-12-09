
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { ArrowRight, BarChart, BrainCircuit, Feather, ShoppingCart, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirebase } from '@/firebase';
import { redirect } from 'next/navigation';

const features = [
  {
    icon: <Feather className="h-8 w-8 text-primary" />,
    title: 'Flock Management',
    description: 'Track bird count, age, weight, and health records for each flock.',
  },
  {
    icon: <DollarSign className="h-8 w-8 text-primary" />,
    title: 'Financial Tracking',
    description: 'Log sales and expenditures to get a clear view of your farm\'s profitability.',
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: 'Performance Analytics',
    description: 'Visualize key metrics like FCR and mortality rates with interactive charts.',
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: 'AI-Powered Insights',
    description: 'Optimize feed, predict health issues, and get expert answers from our AI.',
  },
];

const marketplaceItems = [
    {
        name: 'Fresh Farm Eggs',
        price: '$4.99 / dozen',
        image: 'https://picsum.photos/seed/101/600/400',
        hint: 'farm eggs',
        farm: 'Green Pastures Farm'
    },
    {
        name: 'Organic Broiler Chicken',
        price: '$12.50 / whole',
        image: 'https://picsum.photos/seed/102/600/400',
        hint: 'raw chicken',
        farm: 'Happy Hen Homestead'
    },
    {
        name: 'Composted Poultry Manure',
        price: '$10.00 / bag',
        image: 'https://picsum.photos/seed/103/600/400',
        hint: 'rich soil',
        farm: 'CluckHub Farms Co-op'
    }
]

export default function LandingPage() {
    const { user, isUserLoading } = useFirebase();

    if (isUserLoading) {
        return null; // Or a loading spinner
    }

    if (user) {
        redirect('/dashboard');
    }

  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="flex items-center gap-4">
            <Link href="#features" className="hidden text-sm font-medium transition-colors hover:text-primary md:block">
              Features
            </Link>
            <Link href="#marketplace" className="hidden text-sm font-medium transition-colors hover:text-primary md:block">
              Marketplace
            </Link>
            <Link href="/login">
                <Button>
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center justify-center space-y-6 px-4 py-20 text-center md:px-6 lg:py-32">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Modern Poultry Farm Management
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
            CluckHub provides the AI-powered tools you need to optimize your poultry operations, from flock tracking to financial analysis.
          </p>
          <div className="flex gap-4">
            <Link href="/login">
                <Button size="lg">Start for Free</Button>
            </Link>
            <Link href="#features">
                <Button size="lg" variant="outline">
                    Learn More
                </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Everything You Need to Succeed
                </h2>
                <p className="mt-4 text-muted-foreground md:text-lg">
                    CluckHub is packed with features designed for the modern farmer.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Marketplace Section */}
        <section id="marketplace" className="w-full py-16 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Farm-Fresh Marketplace
                    </h2>
                    <p className="mt-4 text-muted-foreground md:text-lg">
                        Discover fresh products directly from CluckHub farms.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {marketplaceItems.map((item) => (
                        <Card key={item.name} className="overflow-hidden transition-shadow hover:shadow-lg">
                            <CardHeader className="p-0">
                                <Image 
                                    src={item.image}
                                    alt={item.name}
                                    width={600}
                                    height={400}
                                    className="h-60 w-full object-cover"
                                    data-ai-hint={item.hint}
                                />
                            </CardHeader>
                            <CardContent className="p-4">
                                <h3 className="text-lg font-semibold">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">{item.farm}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xl font-bold text-primary">{item.price}</span>
                                    <Button variant="outline">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Add to Cart
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                 <div className="mt-12 text-center">
                    <Button size="lg" variant="secondary">
                        Explore Marketplace <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </section>

      </main>

      <footer className="border-t bg-secondary">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 text-center md:flex-row md:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CluckHub. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm font-medium hover:text-primary">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
