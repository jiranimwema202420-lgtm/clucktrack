import { collection, doc, Timestamp, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import type { Sale } from '@/lib/types';
import { z } from 'zod';
import { saleSchema } from '@/lib/types';

export function addSale(firestore: Firestore, userId: string, data: z.infer<typeof saleSchema>) {
    const salesRef = collection(firestore, 'users', userId, 'sales');
    const total = data.quantity * data.pricePerUnit;
    const newSale = {
      ...data,
      saleDate: Timestamp.fromDate(data.saleDate),
      total,
    };
    addDocumentNonBlocking(salesRef, newSale);
}

export function updateSale(firestore: Firestore, userId: string, saleId: string, data: z.infer<typeof saleSchema>) {
    const saleDocRef = doc(firestore, 'users', userId, 'sales', saleId);
    const total = data.quantity * data.pricePerUnit;
    const updatedSale = {
        ...data,
        saleDate: Timestamp.fromDate(data.saleDate),
        total,
    };
    updateDocumentNonBlocking(saleDocRef, updatedSale);
}

export function deleteSale(firestore: Firestore, userId: string, saleId: string) {
    const saleDocRef = doc(firestore, 'users', userId, 'sales', saleId);
    deleteDocumentNonBlocking(saleDocRef);
}
