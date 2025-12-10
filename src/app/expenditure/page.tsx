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
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Calendar as CalendarIcon, Loader2, Trash2, Pencil } from 'lucide-react';
import type { Expenditure, Flock } from '@/lib/types';
import { expenditureSchema } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, Timestamp, doc } from 'firebase/firestore';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const expenditureCategories = ['Feed', 'Medicine', 'Utilities', 'Labor', 'Equipment', 'Maintenance', 'Day Old Chicks', 'Other'];
const flockRelatedCategories = ['Feed', 'Medicine', 'Maintenance'];

export default function ExpenditurePage() {
  const [isAddExpenseOpen, setAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setEditExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expenditure | null>(null);
  
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const expendituresRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'expenditures');
  }, [firestore, user]);

  const { data: expenditures, isLoading } = useCollection<Expenditure>(expendituresRef);
  
  const flocksRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'flocks');
  }, [firestore, user]);

  const { data: flocks, isLoading: isLoadingFlocks } = useCollection<Flock>(flocksRef);

  const form = useForm<z.infer<typeof expenditureSchema>>({
    resolver: zodResolver(expenditureSchema),
    defaultValues: {
      category: '',
      quantity: 1,
      unitPrice: 0,
      description: '',
      expenditureDate: new Date(),
      flockId: '',
    },
  });

  const watchQuantity = form.watch('quantity');
  const watchUnitPrice = form.watch('unitPrice');
  const watchCategory = form.watch('category');
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  useEffect(() => {
    const quantity = typeof watchQuantity === 'number' ? watchQuantity : 0;
    const unitPrice = typeof watchUnitPrice === 'number' ? watchUnitPrice : 0;
    const amount = quantity * unitPrice;
    setCalculatedAmount(amount);
    form.setValue('amount', amount, { shouldValidate: true });
  }, [watchQuantity, watchUnitPrice, form]);

  async function updateFlockTotals(flockId: string, amountChange: number, feedChange: number) {
    if (!user || !flocks) return;
    const flockToUpdate = flocks.find(f => f.id === flockId);
    if (!flockToUpdate) return;
    
    const flockDocRef = doc(firestore, 'users', user.uid, 'flocks', flockId);
    const newTotalCost = (flockToUpdate.totalCost || 0) + amountChange;
    const newTotalFeed = (flockToUpdate.totalFeedConsumed || 0) + feedChange;

    await updateDocumentNonBlocking(flockDocRef, {
        totalCost: newTotalCost,
        totalFeedConsumed: newTotalFeed,
    });
  }

  function onSubmit(values: z.infer<typeof expenditureSchema>) {
    if (!expendituresRef || !user) return;

    const amount = values.quantity * values.unitPrice;
    if (amount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Total amount must be greater than zero." });
      return;
    }

    if (flockRelatedCategories.includes(values.category) && !values.flockId) {
        toast({ variant: "destructive", title: "Flock Required", description: "Please select a flock for this expenditure category." });
        return;
    }
    
    const newExpenditure = { ...values, expenditureDate: Timestamp.fromDate(values.expenditureDate), amount: amount };
    addDocumentNonBlocking(expendituresRef, newExpenditure);

    if (values.flockId) {
        const feedChange = values.category === 'Feed' ? values.quantity : 0;
        updateFlockTotals(values.flockId, amount, feedChange);
    }

    toast({ title: 'Expenditure Recorded', description: `Recorded $${amount.toFixed(2)} for ${values.category}.` });
    form.reset();
    setAddExpenseOpen(false);
  }

  function onEditSubmit(values: z.infer<typeof expenditureSchema>) {
    if (!user || !selectedExpense) return;
    const amount = values.quantity * values.unitPrice;
    if (amount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Total amount must be greater than zero." });
      return;
    }
    const expenditureDocRef = doc(firestore, 'users', user.uid, 'expenditures', selectedExpense.id);
    const updatedExpenditure = { ...values, expenditureDate: Timestamp.fromDate(values.expenditureDate), amount: amount };
    updateDocumentNonBlocking(expenditureDocRef, updatedExpenditure);

    // Calculate changes and update flock
    const amountDifference = amount - selectedExpense.amount;
    const oldFeedAmount = selectedExpense.category === 'Feed' ? selectedExpense.quantity : 0;
    const newFeedAmount = values.category === 'Feed' ? values.quantity : 0;
    const feedDifference = newFeedAmount - oldFeedAmount;
    
    // If flock association changed, revert old and apply to new
    if (selectedExpense.flockId && selectedExpense.flockId !== values.flockId) {
        updateFlockTotals(selectedExpense.flockId, -selectedExpense.amount, -oldFeedAmount);
    }
    if (values.flockId) {
        updateFlockTotals(values.flockId, amountDifference, feedDifference);
    }


    toast({ title: "Expenditure Updated", description: "The expenditure record has been updated." });
    setEditExpenseOpen(false);
    setSelectedExpense(null);
  }

  function handleDeleteExpenditure(expense: Expenditure) {
    if (!user) return;
    const expenditureDocRef = doc(firestore, 'users', user.uid, 'expenditures', expense.id);
    deleteDocumentNonBlocking(expenditureDocRef);

    if (expense.flockId) {
        const feedChange = expense.category === 'Feed' ? expense.quantity : 0;
        updateFlockTotals(expense.flockId, -expense.amount, -feedChange);
    }

    toast({ title: "Expenditure Deleted", description: "The expenditure record has been deleted.", variant: "destructive" });
  }
  
  const handleEditClick = (expense: Expenditure) => {
    setSelectedExpense(expense);
    form.reset({
        ...expense,
        expenditureDate: expense.expenditureDate.toDate(),
    });
    setEditExpenseOpen(true);
  }

  const FormFields = () => (
    <div className="space-y-4">
        <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {expenditureCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                        {category}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />

        {flockRelatedCategories.includes(watchCategory) && (
             <FormField
                control={form.control}
                name="flockId"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Assign to Flock</FormLabel>
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
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                  <Input type="number" placeholder="e.g., 10" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
          />
          <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>Unit Price ($)</FormLabel>
                  <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 25.00" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
          />
        </div>
        <FormItem>
            <FormLabel>Total Amount ($)</FormLabel>
            <FormControl>
                <Input type="text" readOnly value={calculatedAmount.toFixed(2)} className="font-semibold bg-muted" />
            </FormControl>
             <FormMessage />
        </FormItem>
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                <Textarea placeholder="e.g., Monthly electricity bill" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="expenditureDate"
            render={({ field }) => (
            <FormItem className="flex flex-col">
                <FormLabel>Date of Expenditure</FormLabel>
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
            <CardTitle>Expenditure Tracking</CardTitle>
            <CardDescription>Record and view farm expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => {
                form.reset({ category: '', quantity: 1, unitPrice: 0, description: '', expenditureDate: new Date(), flockId: '' });
                setAddExpenseOpen(true);
            }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Record New Expense
            </Button>
          </CardContent>
        </Card>
      </div>

       <Dialog open={isAddExpenseOpen} onOpenChange={setAddExpenseOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record Expenditure</DialogTitle>
                    <DialogDescription>Enter the details of the farm expense.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="py-4">
                        <FormFields />
                        <DialogFooter className="mt-4">
                            <DialogClose asChild><Button variant="secondary" type="button">Cancel</Button></DialogClose>
                            <Button type="submit">Save Expense</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
       </Dialog>

       <Dialog open={isEditExpenseOpen} onOpenChange={setEditExpenseOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Expenditure</DialogTitle>
                    <DialogDescription>Update the details of this expense.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onEditSubmit)} className="py-4">
                        <FormFields />
                        <DialogFooter className="mt-4">
                            <DialogClose asChild><Button variant="secondary" type="button">Cancel</Button></DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
       </Dialog>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenditures</CardTitle>
            <CardDescription>A log of the most recent farm expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                )}
                 {!isLoading && expenditures?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No expenditures recorded yet.
                    </TableCell>
                  </TableRow>
                )}
                {expenditures?.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(expense.expenditureDate.toDate(), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="truncate max-w-xs">{expense.description}</TableCell>
                    <TableCell className="text-right">{expense.quantity}</TableCell>
                    <TableCell className="text-right">${expense.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => handleEditClick(expense)}>
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
                                This action cannot be undone. This will permanently delete this expenditure record and update flock totals.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteExpenditure(expense)}>
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
