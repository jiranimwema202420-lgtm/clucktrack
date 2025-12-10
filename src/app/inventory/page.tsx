

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MinusCircle, Calendar as CalendarIcon, Loader2, Trash2, Pencil } from 'lucide-react';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, differenceInWeeks } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Flock } from '@/lib/types';
import { flockSchema } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, Timestamp, doc } from 'firebase/firestore';
import { z } from 'zod';
import { useCurrency } from '@/hooks/use-currency';

export const dynamic = 'force-dynamic';

const recordLossSchema = z.object({
    flockId: z.string().min(1, "Please select a flock"),
    count: z.coerce.number().min(1, "Loss count must be at least 1"),
});

export default function InventoryPage() {
  const [isAddFlockOpen, setAddFlockOpen] = useState(false);
  const [isEditFlockOpen, setEditFlockOpen] = useState(false);
  const [isRecordLossOpen, setRecordLossOpen] = useState(false);
  const [selectedFlock, setSelectedFlock] = useState<Flock | null>(null);

  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { formatCurrency } = useCurrency();

  const flocksRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'flocks');
  }, [firestore, user]);

  const { data: flocks, isLoading } = useCollection<Flock>(flocksRef);

  const form = useForm<z.infer<typeof flockSchema>>({
    resolver: zodResolver(flockSchema),
    defaultValues: {
      breed: '',
      count: 100,
      hatchDate: new Date(),
      initialCount: 100,
      averageWeight: 0.1,
      totalFeedConsumed: 0,
      totalCost: 0,
    },
  });

  function onAddFlockSubmit(values: z.infer<typeof flockSchema>) {
    if (!flocksRef) return;
    
    const newFlockData = {
      ...values,
      hatchDate: Timestamp.fromDate(values.hatchDate)
    };

    addDocumentNonBlocking(flocksRef, newFlockData);
    
    toast({
        title: "Flock Added",
        description: `${values.count} ${values.breed} chicks have been added to the inventory.`
    })
    form.reset({
      breed: '',
      count: 100,
      hatchDate: new Date(),
      initialCount: 100,
      averageWeight: 0.1,
      totalFeedConsumed: 0,
      totalCost: 0,
    });
    setAddFlockOpen(false);
  }

  function onEditFlockSubmit(values: z.infer<typeof flockSchema>) {
    if (!user || !selectedFlock) return;
    const flockDocRef = doc(firestore, 'users', user.uid, 'flocks', selectedFlock.id);
    
    updateDocumentNonBlocking(flockDocRef, {
        ...values,
        hatchDate: Timestamp.fromDate(values.hatchDate)
    });

    toast({
        title: "Flock Updated",
        description: `Flock ${selectedFlock.id.substring(0,6)}... has been updated.`
    });
    setEditFlockOpen(false);
    setSelectedFlock(null);
  }

  function onRecordLossSubmit(values: z.infer<typeof recordLossSchema>) {
    if (!user) return;
    const flock = flocks?.find(f => f.id === values.flockId);
    if (!flock) {
        toast({
            variant: "destructive",
            title: "Flock not found",
            description: "Could not find the selected flock to record the loss."
        });
        return;
    }
    if (values.count > flock.count) {
        toast({
            variant: "destructive",
            title: "Invalid Loss Count",
            description: `Cannot record a loss of ${values.count} birds as the flock only has ${flock.count} remaining.`
        });
        return;
    }

    const newCount = flock.count - values.count;
    const flockDocRef = doc(firestore, 'users', user.uid, 'flocks', values.flockId);
    
    updateDocumentNonBlocking(flockDocRef, {
        count: newCount
    });

    toast({
        title: "Loss Recorded",
        description: `Recorded a loss of ${values.count} in flock ${flock?.id.substring(0,6)}. New count: ${newCount}`,
    })
    recordLossForm.reset();
    setRecordLossOpen(false);
  }
  
  function handleDeleteFlock(flockId: string) {
    if (!user) return;
    const flockDocRef = doc(firestore, 'users', user.uid, 'flocks', flockId);
    deleteDocumentNonBlocking(flockDocRef);
    toast({
      title: "Flock Deleted",
      description: `Flock has been removed from the inventory.`,
      variant: "destructive"
    })
  }
  
  const handleEditClick = (flock: Flock) => {
    setSelectedFlock(flock);
    form.reset({
        ...flock,
        hatchDate: flock.hatchDate.toDate(),
        totalCost: flock.totalCost || 0,
    });
    setEditFlockOpen(true);
  }

  const recordLossForm = useForm<z.infer<typeof recordLossSchema>>({
    resolver: zodResolver(recordLossSchema),
    defaultValues: {
        flockId: '',
        count: 1,
    }
  });


  const getAgeInWeeks = (hatchDate: Timestamp) => {
    if (!hatchDate) return 0;
    return differenceInWeeks(new Date(), hatchDate.toDate());
  };

  const calculateFCR = (flock: Flock) => {
    if (!flock.count || !flock.averageWeight || !flock.totalFeedConsumed || flock.totalFeedConsumed <= 0) return 'N/A';
    const totalWeight = flock.count * flock.averageWeight;
    if (totalWeight === 0) return 'N/A';
    const fcr = flock.totalFeedConsumed / totalWeight;
    return fcr.toFixed(2);
  }

  const calculateCostPerBird = (flock: Flock) => {
    if(!flock.count || !flock.totalCost || flock.count <= 0) return 'N/A';
    const cost = flock.totalCost / flock.count;
    return formatCurrency(cost);
  }

  const FormFields = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
        <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Breed</FormLabel>
                <FormControl>
                <Input placeholder="e.g., Cobb 500" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <div className="grid grid-cols-2 gap-4">
        <FormField
            control={form.control}
            name="initialCount"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Initial Quantity</FormLabel>
                <FormControl>
                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="count"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Current Quantity</FormLabel>
                <FormControl>
                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        </div>
        <FormField
            control={form.control}
            name="hatchDate"
            render={({ field }) => (
            <FormItem className="flex flex-col">
                <FormLabel>Hatch Date</FormLabel>
                <Popover>
                <PopoverTrigger asChild>
                    <FormControl>
                    <Button
                        variant={'outline'}
                        className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                        )}
                    >
                        {field.value ? (
                        format(field.value, 'PPP')
                        ) : (
                        <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                    />
                </PopoverContent>
                </Popover>
                <FormMessage />
            </FormItem>
            )}
        />
        <div className="grid grid-cols-2 gap-4">
        <FormField
            control={form.control}
            name="averageWeight"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Avg. Weight (kg)</FormLabel>
                <FormControl>
                <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="totalFeedConsumed"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Total Feed (kg)</FormLabel>
                <FormControl>
                <Input type="number" step="0.1" {...field} readOnly={isEdit} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        </div>
        <FormField
            control={form.control}
            name="totalCost"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Total Cost</FormLabel>
                <FormControl>
                <Input type="number" step="0.01" {...field} readOnly={isEdit} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Flock Inventory</CardTitle>
            <CardDescription>An overview of all active flocks on the farm.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isRecordLossOpen} onOpenChange={setRecordLossOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" disabled={!flocks || flocks.length === 0}>
                        <MinusCircle className="mr-2 h-4 w-4" />
                        Record Loss
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Flock Loss</DialogTitle>
                        <DialogDescription>
                            Select the flock and enter the number of losses to record.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...recordLossForm}>
                        <form onSubmit={recordLossForm.handleSubmit(onRecordLossSubmit)} className="space-y-4">
                            <FormField
                                control={recordLossForm.control}
                                name="flockId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Flock</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a flock" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {flocks?.map(flock => (
                                                    <SelectItem key={flock.id} value={flock.id}>
                                                        {flock.id.substring(0,6)}... - {flock.breed} ({flock.count} birds)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={recordLossForm.control}
                                name="count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of Losses</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 5" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Record Loss</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Dialog open={isAddFlockOpen} onOpenChange={(isOpen) => {
                if(isOpen) form.reset({
                    breed: '',
                    count: 100,
                    hatchDate: new Date(),
                    initialCount: 100,
                    averageWeight: 0.1,
                    totalFeedConsumed: 0,
                    totalCost: 0,
                });
                setAddFlockOpen(isOpen);
            }}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Chicks
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Flock</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new flock of chicks.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onAddFlockSubmit)} className="space-y-4 py-4">
                    <FormFields />
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Add Flock</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Edit Flock Dialog */}
            <Dialog open={isEditFlockOpen} onOpenChange={setEditFlockOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Flock</DialogTitle>
                  <DialogDescription>
                    Update the details for this flock. Cost and Feed are auto-calculated from expenditures.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onEditFlockSubmit)} className="space-y-4 py-4">
                    <FormFields isEdit={true} />
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flock ID</TableHead>
              <TableHead>Breed</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Age (w)</TableHead>
              <TableHead className="text-right">Avg. Wt (kg)</TableHead>
              <TableHead className="text-right">FCR</TableHead>
              <TableHead className="text-right">Cost/Bird</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && flocks?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No flocks found. Add some chicks to get started.
                </TableCell>
              </TableRow>
            )}
            {flocks?.map((flock) => (
              <TableRow key={flock.id}>
                <TableCell className="font-medium">
                  <Badge variant="secondary">{flock.id.substring(0,6)}...</Badge>
                </TableCell>
                <TableCell>{flock.breed}</TableCell>
                <TableCell className="text-right">{flock.count.toLocaleString()}</TableCell>
                <TableCell className="text-right">{getAgeInWeeks(flock.hatchDate)}</TableCell>
                <TableCell className="text-right">{flock.averageWeight.toFixed(2)}</TableCell>
                <TableCell className="text-right">{calculateFCR(flock)}</TableCell>
                <TableCell className="text-right">{calculateCostPerBird(flock)}</TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => handleEditClick(flock)}>
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
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the flock
                                and all of its associated data.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteFlock(flock.id)}>
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
  );
}
