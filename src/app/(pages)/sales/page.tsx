'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import type { Sale, Flock } from '@/lib/types';
import { saleSchema } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, Timestamp, doc } from 'firebase/firestore';
import { z } from 'zod';

export default function SalesPage() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const salesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'sales');
  }, [firestore, user]);
  const { data: sales, isLoading: isLoadingSales } = useCollection<Sale>(salesRef);

  const flocksRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'flocks');
  }, [firestore, user]);
  const { data: flocks, isLoading: isLoadingFlocks } = useCollection<Flock>(flocksRef);


  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      flockId: '',
      quantity: 10,
      pricePerUnit: 10,
      customer: '',
      saleDate: new Date(),
    },
  });

  function onSubmit(values: z.infer<typeof saleSchema>) {
    if (!salesRef || !user || !flocks) return;
    
    // Find the selected flock
    const flockToUpdate = flocks.find(f => f.id === values.flockId);

    if (!flockToUpdate) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not find the selected flock.",
        });
        return;
    }
    
    if (values.quantity > flockToUpdate.count) {
        toast({
            variant: "destructive",
            title: "Not enough birds",
            description: `You only have ${flockToUpdate.count} birds in flock ${flockToUpdate.id.substring(0,6)}, but are trying to sell ${values.quantity}.`,
        });
        return;
    }

    // Deduct sold birds from flock
    const newCount = flockToUpdate.count - values.quantity;
    const flockDocRef = doc(firestore, 'users', user.uid, 'flocks', values.flockId);
    updateDocumentNonBlocking(flockDocRef, { count: newCount });

    // Record the sale
    const total = values.quantity * values.pricePerUnit;
    const newSale = {
      ...values,
      saleDate: Timestamp.fromDate(values.saleDate),
      total,
    };

    addDocumentNonBlocking(salesRef, newSale);

    toast({
      title: 'Sale Recorded',
      description: `Recorded sale of ${values.quantity} birds to ${values.customer} for $${total.toFixed(2)}.`,
    });
    form.reset();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Record a Sale</CardTitle>
            <CardDescription>Enter the details of the sale below.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="flockId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flock</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={isLoadingFlocks}>
                            <SelectValue placeholder="Select a flock" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {flocks?.map((flock) => (
                            <SelectItem key={flock.id} value={flock.id}>
                              {flock.breed} ({flock.count} birds)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Sold</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pricePerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Bird ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 12.50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="saleDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Sale Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Record Sale
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>A log of the most recent sales transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Flock</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingSales && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                )}
                {!isLoadingSales && sales?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No sales recorded yet.
                    </TableCell>
                  </TableRow>
                )}
                {sales?.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{format(sale.saleDate.toDate(), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{flocks?.find(f => f.id === sale.flockId)?.breed || sale.flockId.substring(0,6)}</TableCell>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell className="text-right">{sale.quantity}</TableCell>
                    <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
