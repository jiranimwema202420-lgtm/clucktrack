

'use client';

import { useState, useEffect, useMemo } from 'react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
  } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Calendar as CalendarIcon, Loader2, Trash2, Pencil } from 'lucide-react';
import type { Sale, Flock } from '@/lib/types';
import { saleSchema } from '@/lib/types';
import { useFirebase, useCollection } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { z } from 'zod';
import { useCurrency } from '@/hooks/use-currency';
import { addSale, updateSale, deleteSale } from '@/services/sale.services';
import { updateFlockInventory } from '@/services/flock.services';

export const dynamic = 'force-dynamic';

export default function SalesPage() {
  const [isAddSaleOpen, setAddSaleOpen] = useState(false);
  const [isEditSaleOpen, setEditSaleOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [originalSaleData, setOriginalSaleData] = useState<{ quantity: number, flockId: string, saleType: string } | null>(null);

  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { formatCurrency, currencySymbol } = useCurrency();

  const salesRef = useMemo(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'sales');
  }, [firestore, user]);
  const { data: sales, isLoading: isLoadingSales } = useCollection<Sale>(salesRef);

  const flocksRef = useMemo(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'flocks');
  }, [firestore, user]);
  const { data: flocks, isLoading: isLoadingFlocks } = useCollection<Flock>(flocksRef);


  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      flockId: '',
      saleType: 'Birds',
      quantity: 10,
      pricePerUnit: 10.0,
      customer: '',
      saleDate: new Date(),
    },
  });

  const watchQuantity = form.watch('quantity');
  const watchPricePerUnit = form.watch('pricePerUnit');
  const watchFlockId = form.watch('flockId');
  const watchSaleType = form.watch('saleType');
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const selectedFlockForForm = flocks?.find(f => f.id === watchFlockId);
  
  useEffect(() => {
      if (selectedFlockForForm && selectedFlockForForm.type === 'Broiler') {
          form.setValue('saleType', 'Birds');
      }
  }, [watchFlockId, form, selectedFlockForForm]);

  useEffect(() => {
    const quantity = form.getValues('quantity');
    const pricePerUnit = form.getValues('pricePerUnit');
    const total = (typeof quantity === 'number' ? quantity : 0) * (typeof pricePerUnit === 'number' ? pricePerUnit : 0);
    setCalculatedTotal(total);
    form.setValue('total', total, { shouldValidate: true });
  }, [watchQuantity, watchPricePerUnit, form]);


  function onSubmit(values: z.infer<typeof saleSchema>) {
    if (!user || !flocks) return;
    
    const flockToUpdate = flocks.find(f => f.id === values.flockId);
    if (!flockToUpdate) {
        toast({ variant: "destructive", title: "Error", description: "Could not find the selected flock." });
        return;
    }
    
    if (values.saleType === 'Birds' && values.quantity > flockToUpdate.count) {
        toast({ variant: "destructive", title: "Not enough birds", description: `You only have ${flockToUpdate.count} birds in this flock.` });
        return;
    }
    if (values.saleType === 'Eggs' && values.quantity > (flockToUpdate.totalEggsCollected || 0)) {
        toast({ variant: "destructive", title: "Not enough eggs", description: `You only have ${flockToUpdate.totalEggsCollected || 0} eggs recorded for this flock.`});
        return;
    }

    updateFlockInventory(firestore, user.uid, values.flockId, -values.quantity, values.saleType);

    addSale(firestore, user.uid, values);

    toast({ title: 'Sale Recorded', description: `Recorded sale to ${values.customer} for ${formatCurrency(values.total)}.` });
    form.reset();
    setAddSaleOpen(false);
  }

  function onEditSubmit(values: z.infer<typeof saleSchema>) {
    if (!user || !flocks || !selectedSale || !originalSaleData) return;
    
    const flockToUpdate = flocks.find(f => f.id === values.flockId);
    if (!flockToUpdate) {
        toast({ variant: "destructive", title: "Error", description: "Could not find the selected flock." });
        return;
    }

    // Revert original inventory change
    updateFlockInventory(firestore, user.uid, originalSaleData.flockId, originalSaleData.quantity, originalSaleData.saleType as 'Birds' | 'Eggs');

    // Check if there's enough new inventory
    if (values.saleType === 'Birds' && values.quantity > flockToUpdate.count) {
        toast({ variant: "destructive", title: "Not enough birds", description: `The selected flock only has ${flockToUpdate.count} birds.` });
        // Rollback the inventory reversion
        updateFlockInventory(firestore, user.uid, originalSaleData.flockId, -originalSaleData.quantity, originalSaleData.saleType as 'Birds' | 'Eggs');
        return;
    }
     if (values.saleType === 'Eggs' && values.quantity > (flockToUpdate.totalEggsCollected || 0)) {
        toast({ variant: "destructive", title: "Not enough eggs", description: `You only have ${flockToUpdate.totalEggsCollected || 0} eggs recorded.`});
        updateFlockInventory(firestore, user.uid, originalSaleData.flockId, -originalSaleData.quantity, originalSaleData.saleType as 'Birds' | 'Eggs');
        return;
    }

    // Apply new inventory change
    updateFlockInventory(firestore, user.uid, values.flockId, -values.quantity, values.saleType);

    updateSale(firestore, user.uid, selectedSale.id, values);

    toast({ title: "Sale Updated", description: "The sale record has been updated." });
    setEditSaleOpen(false);
    setSelectedSale(null);
  }

  function handleDeleteSale(sale: Sale) {
    if (!user || !flocks) return;
    
    // Add back the sold items to inventory
    updateFlockInventory(firestore, user.uid, sale.flockId, sale.quantity, sale.saleType);

    deleteSale(firestore, user.uid, sale.id);
    toast({
      title: "Sale Deleted",
      description: `The sale has been deleted and items have been returned to inventory.`,
      variant: "destructive"
    });
  }

  const handleEditClick = (sale: Sale) => {
    setSelectedSale(sale);
    setOriginalSaleData({ quantity: sale.quantity, flockId: sale.flockId, saleType: sale.saleType });
    form.reset({
        ...sale,
        saleDate: sale.saleDate.toDate(),
        pricePerUnit: sale.pricePerUnit,
    });
    setEditSaleOpen(true);
  }

  const FormFields = () => (
    <div className="space-y-4">
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
                    <SelectItem key={flock.id} value={flock.id} disabled={flock.count === 0 && (!selectedSale || selectedSale.flockId !== flock.id)}>
                        {flock.breed} ({flock.type} - {flock.count} birds)
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />
        {selectedFlockForForm?.type === 'Layer' && (
             <FormField
                control={form.control}
                name="saleType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Sale Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={selectedFlockForForm?.type === 'Broiler'}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select what was sold" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Birds">Birds</SelectItem>
                        <SelectItem value="Eggs">Eggs</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{watchSaleType === 'Eggs' ? 'Quantity' : 'Quantity Sold'}</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="e.g., 50" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
                    <FormLabel>{watchSaleType === 'Eggs' ? 'Price per unit' : 'Price per Bird'} ({currencySymbol})</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 12.50" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
         <FormItem>
            <FormLabel>Total Amount ({currencySymbol})</FormLabel>
            <FormControl>
                <Input type="text" readOnly value={`${calculatedTotal.toFixed(2)}`} className="font-semibold bg-muted" />
            </FormControl>
             <FormMessage />
        </FormItem>
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
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Sales Management</CardTitle>
            <CardDescription>Record sales and view recent transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => {
                form.reset({ flockId: '', saleType: 'Birds', quantity: 10, pricePerUnit: 10, customer: '', saleDate: new Date(), total: 100 });
                setAddSaleOpen(true);
            }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Record New Sale
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Sale Dialog */}
      <Dialog open={isAddSaleOpen} onOpenChange={setAddSaleOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Record a Sale</DialogTitle>
                <DialogDescription>Enter the details of the sale below.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="py-4">
                    <FormFields />
                    <DialogFooter className="mt-4">
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoadingFlocks}>Record Sale</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Sale Dialog */}
      <Dialog open={isEditSaleOpen} onOpenChange={setEditSaleOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Sale</DialogTitle>
                <DialogDescription>Update the details of this sale.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onEditSubmit)} className="py-4">
                    <FormFields />
                    <DialogFooter className="mt-4">
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoadingFlocks}>Save Changes</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>

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
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingSales && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                )}
                {!isLoadingSales && sales?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No sales recorded yet.
                    </TableCell>
                  </TableRow>
                )}
                {sales?.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{format(sale.saleDate.toDate(), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{flocks?.find(f => f.id === sale.flockId)?.breed || sale.flockId.substring(0,6)}</TableCell>
                    <TableCell>{sale.saleType}</TableCell>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell className="text-right">{sale.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => handleEditClick(sale)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this sale record and add the sold items back to the flock inventory.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSale(sale)}>
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
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
