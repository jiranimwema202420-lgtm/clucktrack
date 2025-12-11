

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Calendar as CalendarIcon, Loader2, Trash2, Pencil, ScanLine, Camera, X, Upload } from 'lucide-react';
import type { Expenditure, Flock } from '@/lib/types';
import { expenditureSchema } from '@/lib/types';
import { useFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { z } from 'zod';
import { scanReceipt } from '@/ai/flows/scan-receipt';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Papa from 'papaparse';
import { useCurrency } from '@/hooks/use-currency';
import { addExpenditure, updateExpenditure, deleteExpenditure, importExpenditures } from '@/services/expenditure.services';
import { addFlock, updateFlockTotals } from '@/services/flock.services';

export const dynamic = 'force-dynamic';

const expenditureCategories = ['Feed', 'Medicine', 'Utilities', 'Labor', 'Equipment', 'Maintenance', 'Day Old Chicks', 'Other'];
const flockRelatedCategories = ['Feed', 'Medicine', 'Maintenance'];

type ParsedExpenditure = z.infer<typeof expenditureSchema>;

export default function ExpenditurePage() {
  const [isAddExpenseOpen, setAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setEditExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expenditure | null>(null);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedExpenditure[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { formatCurrency, currencySymbol } = useCurrency();

  const expendituresRef = useMemo(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'expenditures');
  }, [firestore, user]);

  const { data: expenditures, isLoading } = useCollection<Expenditure>(expendituresRef);
  
  const flocksRef = useMemo(() => {
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
    const quantity = form.getValues('quantity');
    const unitPrice = form.getValues('unitPrice');
    const amount = (typeof quantity === 'number' ? quantity : 0) * (typeof unitPrice === 'number' ? unitPrice : 0);
    setCalculatedAmount(amount);
    form.setValue('amount', amount, { shouldValidate: true });
  }, [watchQuantity, watchUnitPrice, form]);
  
  useEffect(() => {
    if (isScannerOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          setHasCameraPermission(true);
  
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
  
      getCameraPermission();
  
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [isScannerOpen, toast]);

  const handleCaptureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageDataUri = canvas.toDataURL('image/jpeg');

    try {
      const result = await scanReceipt({ receiptImage: imageDataUri });
      toast({
        title: 'Scan Successful',
        description: 'Receipt data has been extracted.',
      });

      const scannedCategory = result.category.toLowerCase();
      const matchedCategory = expenditureCategories.find(c => c.toLowerCase().includes(scannedCategory) || scannedCategory.includes(c.toLowerCase())) || 'Other';
      
      form.setValue('category', matchedCategory);
      form.setValue('quantity', result.quantity > 0 ? result.quantity : 1);
      form.setValue('unitPrice', result.unitPrice > 0 ? result.unitPrice : result.amount);
      form.setValue('amount', result.amount);
      form.setValue('description', result.description);
      form.setValue('expenditureDate', result.expenditureDate ? new Date(result.expenditureDate) : new Date());

      setScannerOpen(false);
      setAddExpenseOpen(true);
    } catch (error) {
      console.error('Error scanning receipt:', error);
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: 'Could not extract data from the receipt. Please try again or enter manually.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  function onSubmit(values: z.infer<typeof expenditureSchema>) {
    if (!user || !flocksRef) return;

    const amount = values.quantity * values.unitPrice;
    if (amount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Total amount must be greater than zero." });
      return;
    }

    if (flockRelatedCategories.includes(values.category) && !values.flockId) {
        toast({ variant: "destructive", title: "Flock Required", description: "Please select a flock for this expenditure category." });
        return;
    }

    if (values.category === 'Day Old Chicks') {
        addFlock(firestore, user.uid, values);
        toast({ title: 'New Flock Created', description: `A new flock of ${values.quantity} chicks has been added to your inventory.` });
    }
    
    addExpenditure(firestore, user.uid, values);

    if (values.flockId && values.category !== 'Day Old Chicks') {
        const feedChange = values.category === 'Feed' ? values.quantity : 0;
        updateFlockTotals(firestore, user.uid, values.flockId, amount, feedChange);
    }

    toast({ title: 'Expenditure Recorded', description: `Recorded ${formatCurrency(amount)} for ${values.category}.` });
    form.reset();
    setAddExpenseOpen(false);
  }

  function onEditSubmit(values: z.infer<typeof expenditureSchema>) {
    if (!user || !selectedExpense || !flocks) return;
    const amount = values.quantity * values.unitPrice;
    if (amount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Total amount must be greater than zero." });
      return;
    }

    updateExpenditure(firestore, user.uid, selectedExpense.id, values);

    const amountDifference = amount - selectedExpense.amount;
    const oldFeedAmount = selectedExpense.category === 'Feed' ? selectedExpense.quantity : 0;
    const newFeedAmount = values.category === 'Feed' ? values.quantity : 0;
    const feedDifference = newFeedAmount - oldFeedAmount;
    
    const originalFlock = flocks.find(f => f.id === selectedExpense.flockId);

    if (selectedExpense.flockId && selectedExpense.flockId !== values.flockId) {
        if(originalFlock) {
            updateFlockTotals(firestore, user.uid, selectedExpense.flockId, -selectedExpense.amount, -oldFeedAmount);
        }
    }
    if (values.flockId) {
        const flockAmountChange = selectedExpense.flockId === values.flockId ? amountDifference : amount;
        const flockFeedChange = selectedExpense.flockId === values.flockId ? feedDifference : newFeedAmount;
        updateFlockTotals(firestore, user.uid, values.flockId, flockAmountChange, flockFeedChange);
    }

    toast({ title: "Expenditure Updated", description: "The expenditure record has been updated." });
    setEditExpenseOpen(false);
    setSelectedExpense(null);
  }

  function handleDeleteExpenditure(expense: Expenditure) {
    if (!user || !flocks) return;
    deleteExpenditure(firestore, user.uid, expense.id);

    if (expense.flockId) {
        const flock = flocks.find(f => f.id === expense.flockId);
        if (flock) {
            const feedChange = expense.category === 'Feed' ? expense.quantity : 0;
            updateFlockTotals(firestore, user.uid, expense.flockId, -expense.amount, -feedChange);
        }
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setParsedData([]);
    setParseErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validatedData: ParsedExpenditure[] = [];
        const errors: string[] = [];

        results.data.forEach((row: any, index) => {
          const parsedRow = {
            ...row,
            quantity: parseFloat(row.quantity),
            unitPrice: parseFloat(row.unitPrice),
            amount: parseFloat(row.quantity) * parseFloat(row.unitPrice),
            expenditureDate: new Date(row.expenditureDate),
          };

          const validation = expenditureSchema.safeParse(parsedRow);
          if (validation.success) {
            validatedData.push(validation.data);
          } else {
            const errorMessages = validation.error.errors.map(e => `Row ${index + 2}: ${e.path.join('.')} - ${e.message}`).join(', ');
            errors.push(errorMessages);
          }
        });
        
        setParsedData(validatedData);
        setParseErrors(errors);
      },
      error: (error) => {
        setParseErrors([`CSV parsing error: ${error.message}`]);
      },
    });
  };

  const handleDownloadTemplate = () => {
    const headers = "category,quantity,unitPrice,description,expenditureDate,flockId";
    const templateData = "Feed,50,25.50,50kg Broiler Feed,2023-10-26,your_flock_id_here\nMedicine,10,5.00,Vaccines,,";
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${templateData}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenditure_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImport = async () => {
    if (!user || !flocks) return;
    setIsImporting(true);

    await importExpenditures(firestore, user.uid, parsedData, flocks);

    toast({ title: 'Import Successful', description: `${parsedData.length} expenditures have been imported.` });
    setIsImporting(false);
    setImportModalOpen(false);
    setParsedData([]);
    setParseErrors([]);
  };


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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                  <Input type="number" placeholder="e.g., 10" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
                  <FormLabel>Unit Price ({currencySymbol})</FormLabel>
                  <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 25.00" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
          />
        </div>
        <FormItem>
            <FormLabel>Total Amount ({currencySymbol})</FormLabel>
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
                 {watchCategory === 'Day Old Chicks' && (
                    <FormDescription>
                        Enter the breed of the chicks here (e.g., "Cobb 500"). This will be used as the flock name.
                    </FormDescription>
                )}
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
          <CardContent className="grid gap-2">
            <Button className="w-full" onClick={() => {
                form.reset({ category: '', quantity: 1, unitPrice: 0, description: '', expenditureDate: new Date(), flockId: '' });
                setAddExpenseOpen(true);
            }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Record New Expense
            </Button>
             <Button variant="outline" className="w-full" onClick={() => setScannerOpen(true)}>
                <ScanLine className="mr-2 h-4 w-4" />
                Scan Receipt
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setImportModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
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
        
       <Dialog open={isScannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Scan Receipt</DialogTitle>
            <DialogDescription>
              Position your receipt in the frame and click capture.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <video
              ref={videoRef}
              className={cn('w-full aspect-video rounded-md bg-muted', {
                'hidden': hasCameraPermission === false,
              })}
              autoPlay
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            {hasCameraPermission === false && (
              <Alert variant="destructive" className="w-full aspect-video flex flex-col justify-center items-center">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser to use this feature.
                </AlertDescription>
              </Alert>
            )}
            {isScanning && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-md">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-white mt-4">Analyzing receipt...</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setScannerOpen(false)}
              disabled={isScanning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCaptureAndScan}
              disabled={isScanning || hasCameraPermission !== true}
            >
              {isScanning ? 'Scanning...' : <><Camera className="mr-2 h-4 w-4" /> Capture & Scan</>}
            </Button>
          </DialogFooter>
        </DialogContent>
       </Dialog>

       <Dialog open={isImportModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Import Expenditures from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with your expenditures. Ensure it matches the template format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-4">
              <Button asChild variant="secondary" className="flex-1">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose CSV File
                </label>
              </Button>
              <Input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              <Button variant="outline" onClick={handleDownloadTemplate} className="flex-1">
                Download Template
              </Button>
            </div>
            {parseErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 max-h-32 overflow-y-auto">
                    {parseErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            {parsedData.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold">Preview Data ({parsedData.length} records)</h3>
                <div className="max-h-64 overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>{format(item.expenditureDate, 'yyyy-MM-dd')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setImportModalOpen(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={parsedData.length === 0 || parseErrors.length > 0 || isImporting}>
              {isImporting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Importing...</> : `Import ${parsedData.length} records`}
            </Button>
          </DialogFooter>
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
                    <TableCell className="text-right">{formatCurrency(expense.unitPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
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
