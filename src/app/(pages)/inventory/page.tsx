'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockFlocks as initialFlocks } from '@/lib/data';
import { PlusCircle, MinusCircle, Calendar as CalendarIcon } from 'lucide-react';
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
  Form,
  FormControl,
  FormDescription,
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
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Flock } from '@/lib/types';


const addFlockSchema = z.object({
  breed: z.string().min(1, 'Breed is required'),
  count: z.coerce.number().min(1, 'Quantity must be at least 1'),
  hatchDate: z.date(),
});

const recordLossSchema = z.object({
    flockId: z.string().min(1, "Please select a flock"),
    count: z.coerce.number().min(1, "Loss count must be at least 1"),
});

export default function InventoryPage() {
  const [flocks, setFlocks] = useState<Flock[]>(initialFlocks);
  const [isAddFlockOpen, setAddFlockOpen] = useState(false);
  const [isRecordLossOpen, setRecordLossOpen] = useState(false);
  const { toast } = useToast();

  const addFlockForm = useForm<z.infer<typeof addFlockSchema>>({
    resolver: zodResolver(addFlockSchema),
    defaultValues: {
      breed: '',
      count: 100,
      hatchDate: new Date(),
    },
  });

  const recordLossForm = useForm<z.infer<typeof recordLossSchema>>({
    resolver: zodResolver(recordLossSchema),
    defaultValues: {
        flockId: '',
        count: 1,
    }
  });

  function onAddFlockSubmit(values: z.infer<typeof addFlockSchema>) {
    const newFlock: Flock = {
      id: `FLK-${String(flocks.length + 1).padStart(3, '0')}`,
      breed: values.breed,
      count: values.count,
      hatchDate: format(values.hatchDate, 'yyyy-MM-dd'),
      age: 0, 
      averageWeight: 0.1
    };
    setFlocks([newFlock, ...flocks]);
    toast({
        title: "Flock Added",
        description: `${values.count} ${values.breed} chicks have been added to the inventory.`
    })
    addFlockForm.reset();
    setAddFlockOpen(false);
  }

  function onRecordLossSubmit(values: z.infer<typeof recordLossSchema>) {
    setFlocks(flocks.map(f => {
        if(f.id === values.flockId) {
            const newCount = f.count - values.count;
            return {...f, count: newCount < 0 ? 0 : newCount };
        }
        return f;
    }));
    const flock = flocks.find(f => f.id === values.flockId);
    toast({
        title: "Loss Recorded",
        description: `Recorded a loss of ${values.count} in flock ${flock?.id} (${flock?.breed}).`
    })
    recordLossForm.reset();
    setRecordLossOpen(false);
  }

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
                    <Button variant="outline">
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
                                                {flocks.map(flock => (
                                                    <SelectItem key={flock.id} value={flock.id}>
                                                        {flock.id} - {flock.breed} ({flock.count} birds)
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
                                            <Input type="number" placeholder="e.g., 5" {...field} />
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

            <Dialog open={isAddFlockOpen} onOpenChange={setAddFlockOpen}>
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
                <Form {...addFlockForm}>
                  <form onSubmit={addFlockForm.handleSubmit(onAddFlockSubmit)} className="space-y-4">
                    <FormField
                      control={addFlockForm.control}
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
                    <FormField
                      control={addFlockForm.control}
                      name="count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addFlockForm.control}
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
              <TableHead className="text-right">Age (Weeks)</TableHead>
              <TableHead className="text-right">Avg. Weight (kg)</TableHead>
              <TableHead>Hatch Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flocks.map((flock) => (
              <TableRow key={flock.id}>
                <TableCell className="font-medium">
                  <Badge variant="secondary">{flock.id}</Badge>
                </TableCell>
                <TableCell>{flock.breed}</TableCell>
                <TableCell className="text-right">{flock.count.toLocaleString()}</TableCell>
                <TableCell className="text-right">{flock.age}</TableCell>
                <TableCell className="text-right">{flock.averageWeight.toFixed(2)}</TableCell>
                <TableCell>{flock.hatchDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
