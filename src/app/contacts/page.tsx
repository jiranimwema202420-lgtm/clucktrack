
'use client';

import { useState, useMemo } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Trash2, Pencil } from 'lucide-react';
import { useFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Contact } from '@/lib/types';
import { contactSchema } from '@/lib/types';
import { addContact, updateContact, deleteContact } from '@/services/contact.services';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default function ContactsPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const contactsRef = useMemo(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'contacts');
  }, [firestore, user]);

  const { data: contacts, isLoading } = useCollection<Contact>(contactsRef);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      type: 'Supplier',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      products: '',
    },
  });

  const onSubmit = (values: z.infer<typeof contactSchema>) => {
    if (!user) return;

    if (selectedContact) {
      updateContact(firestore, user.uid, selectedContact.id, values);
      toast({ title: 'Contact Updated', description: 'The contact has been successfully updated.' });
    } else {
      addContact(firestore, user.uid, values);
      toast({ title: 'Contact Added', description: 'The new contact has been added to your list.' });
    }

    form.reset();
    setFormOpen(false);
    setSelectedContact(null);
  };

  const handleEditClick = (contact: Contact) => {
    setSelectedContact(contact);
    form.reset(contact);
    setFormOpen(true);
  };

  const handleDeleteContact = (contactId: string) => {
    if (!user) return;
    deleteContact(firestore, user.uid, contactId);
    toast({ title: 'Contact Deleted', description: 'The contact has been removed.', variant: 'destructive' });
  };

  const FormFields = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name / Company Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., John Doe or ACME Inc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Supplier">Supplier</SelectItem>
                <SelectItem value="Buyer">Buyer</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="contact@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="products"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Associated Products</FormLabel>
            <FormControl>
              <Textarea placeholder="e.g., Feed, Chicks, Eggs, Equipment" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contacts Portal</h1>
          <p className="text-muted-foreground">Manage your suppliers and buyers.</p>
        </div>
        <Button onClick={() => {
            form.reset();
            setSelectedContact(null);
            setFormOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
            <DialogDescription>
              {selectedContact ? 'Update the details for this contact.' : 'Enter the details for your new supplier or buyer.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-4">
              <FormFields />
              <DialogFooter className="mt-4">
                <DialogClose asChild><Button variant="secondary" type="button">Cancel</Button></DialogClose>
                <Button type="submit">{selectedContact ? 'Save Changes' : 'Add Contact'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
          <CardDescription>All your saved suppliers and buyers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && contacts?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No contacts found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
              {contacts?.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>
                    <Badge variant={contact.type === 'Supplier' ? 'secondary' : 'default'}>
                        {contact.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell className="truncate max-w-xs">{contact.products}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => handleEditClick(contact)}>
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
                            This action cannot be undone. This will permanently delete this contact.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteContact(contact.id)}>
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
  );
}
