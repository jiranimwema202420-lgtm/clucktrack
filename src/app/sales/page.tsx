
'use client';

import { useState, useEffect } from 'react';
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
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, Timestamp, doc } from 'firebase/firestore';
import { z } from 'zod';
import { useCurrency } from '@/hooks/use-currency';

export const dynamic = 'force-dynamic';

export default function SalesPage() {
  const [isAddSaleOpen, setAddSaleOpen] = useState(false);
  const [isEditSaleOpen, setEditSaleOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [originalSaleQuantity, setOriginalSaleQuantity] = useState(0);

  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { formatCurrency, currencySymbol } = useCurrency();

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
      pricePerUnit: 10.0,
      customer: '',
      saleDate: new Date(),
    },
  });

  const watchQuantity = form.watch('quantity');
  const watchPricePerUnit = form.watch('pricePerUnit');
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  useEffect(() => {
    const quantity = form.getValues('quantity');
    const pricePerUnit = form.getValues('pricePerUnit');
    const total = (typeof quantity === 'number' ? quantity : 0) * (typeof pricePerUnit === 'number' ? pricePerUnit : 0);
    setCalculatedTotal(total);
    form.setValue('total', total, { shouldValidate: true });
  }, [watchQuantity, watchPricePerUnit, form]);


  function onSubmit(values: z.infer<typeof saleSchema>) {
    if (!salesRef || !user || !flocks) return;
    
    const flockToUpdate = flocks.find(f => f.id === values.flockId);
    if (!flockToUpdate) {
        toast({ variant: "destructive", title: "Error", description: "Could not find the selected flock." });
        return;
    }
    
    if (values.quantity > flockToUpdate.count) {
        toast({ variant: "destructive", title: "Not enough birds", description: `You only have ${flockToUpdate.count} birds in flock ${flockToUpdate.id.substring(0,6)}, but are trying to sell ${values.quantity}.` });
        return;
    }

    const newCount = flockToUpdate.count - values.quantity;
    const flockDocRef = doc(firestore, 'users', user.uid, 'flocks', values.flockId);
    updateDocumentNonBlocking(flockDocRef, { count: newCount });

    const total = values.quantity * values.pricePerUnit;
    const newSale = {
      ...values,
      saleDate: Timestamp.fromDate(values.saleDate),
      total,
    };
    addDocumentNonBlocking(salesRef, newSale);

    toast({ title: 'Sale Recorded', description: `Recorded sale of ${values.quantity} birds to ${values.customer} for ${formatCurrency(total)}.` });
    form.reset();
    setAddSaleOpen(false);
  }

  function onEditSubmit(values: z.infer<typeof saleSchema>) {
    if (!user || !flocks || !selectedSale) return;
    
    const saleDocRef = doc(firestore, 'users', user.uid, 'sales', selectedSale.id);
    const flockToUpdate = flocks.find(f => f.id === values.flockId);
    if (!flockToUpdate) {
        toast({ variant: "destructive", title: "Error", description: "Could not find the selected flock." });
        return;
    }

    const quantityDifference = values.quantity - originalSaleQuantity;
    
    // If flock is changed, revert original flock count and deduct from new one
    if(values.flockId !== selectedSale.flockId) {
        const originalFlock = flocks.find(f => f.id === selectedSale.flockId);
        if(originalFlock) {
            const originalFlockDocRef = doc(firestore, 'users', user.uid, 'flocks', selectedSale.flockId);
            updateDocumentNonBlocking(originalFlockDocRef, { count: originalFlock.count + originalSaleQuantity });
        }
        if(values.quantity > flockToUpdate.count) {
            toast({ variant: "destructive", title: "Not enough birds", description: `The newly selected flock only has ${flockToUpdate.count} birds.` });
            // Re-add the quantity to the original flock since the operation failed
             if(originalFlock) {
                const originalFlockDocRef = doc(firestore, 'users', user.uid, 'flocks', selectedSale.flockId);
                updateDocumentNonBlocking(originalFlockDocRef, { count: originalFlock.count });
            }
            return;
        }
        const newFlockDocRef = doc(firestore, 'users', user.uid, 'flocks', values.flockId);
        updateDocumentNonBlocking(newFlockDocRef, { count: flockToUpdate.count - values.quantity });

    } else { // Flock is the same, just adjust quantity
        if (quantityDifference > flockToUpdate.count) {
            toast({ variant: "destructive", title: "Not enough birds", description: `Cannot update sale. You only have ${flockToUpdate.count} birds remaining in the flock.` });
            return;
        }
        const newFlockCount = flockToUpdate.count - quantityDifference;
        const flockDocRef = doc(firestore, 'users', user.uid, 'flocks', values.flockId);
        updateDocumentNonBlocking(flockDocRef, { count: newFlockCount });
    }

    const total = values.quantity * values.pricePerUnit;
    const updatedSale = {
        ...values,
        saleDate: Timestamp.fromDate(values.saleDate),
        total,
    };
    updateDocumentNonBlocking(saleDocRef, updatedSale);

    toast({ title: "Sale Updated", description: "The sale record has been updated." });
    setEditSaleOpen(false);
    setSelectedSale(null);
  }

  function handleDeleteSale(sale: Sale) {
    if (!user || !flocks) return;
    
    const flockToRestore = flocks.find(f => f.id === sale.flockId);
    if (flockToRestore) {
        const newCount = flockToRestore.count + sale.quantity;
        const flockDocRef = doc(firestore, 'users', user.uid, 'flocks', sale.flockId);
        updateDocumentNonBlocking(flockDocRef, { count: newCount });
    }

    const saleDocRef = doc(firestore, 'users', user.uid, 'sales', sale.id);
    deleteDocumentNonBlocking(saleDocRef);
    toast({
      title: "Sale Deleted",
      description: `The sale record has been deleted and ${sale.quantity} birds have been added back to the flock.`,
      variant: "destructive"
    });
  }

  const handleEditClick = (sale: Sale) => {
    setSelectedSale(sale);
    setOriginalSaleQuantity(sale.quantity);
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
                        {flock.breed} ({flock.count} birds)
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Quantity Sold</FormLabel>
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
                    <FormLabel>Price per Bird ({currencySymbol})</FormLabel>
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
                <Input type="text" readOnly value={`${currencySymbol}${calculatedTotal.toFixed(2)}`} className="font-semibold bg-muted" />
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
                form.reset({ flockId: '', quantity: 10, pricePerUnit: 10, customer: '', saleDate: new Date(), total: 100 });
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
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingSales && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                )}
                {!isLoadingSales && sales?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
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
                                    This action cannot be undone. This will permanently delete this sale record and add the sold birds back to the flock.
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

    
