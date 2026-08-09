import { collection, doc, increment, Timestamp, Firestore, writeBatch } from 'firebase/firestore';
import { addDocumentNonBlocking, commitBatchNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/firestore/non-blocking-writes';
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

function inventoryField(saleType: Sale['saleType']) {
    return saleType === 'Birds' ? 'count' : 'totalEggsCollected';
}

function saleData(data: z.infer<typeof saleSchema>) {
    return {
        ...data,
        saleDate: Timestamp.fromDate(data.saleDate),
        total: data.quantity * data.pricePerUnit,
    };
}

export function addSaleWithInventory(firestore: Firestore, userId: string, data: z.infer<typeof saleSchema>) {
    const salesRef = collection(firestore, 'users', userId, 'sales');
    const saleDocRef = doc(salesRef);
    const flockDocRef = doc(firestore, 'users', userId, 'flocks', data.flockId);
    const batch = writeBatch(firestore);

    batch.set(saleDocRef, saleData(data));
    batch.update(flockDocRef, { [inventoryField(data.saleType)]: increment(-data.quantity) });

    return commitBatchNonBlocking(batch, {
        path: saleDocRef.path,
        operation: 'create',
        requestResourceData: data,
    });
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

export function updateSaleWithInventory(
    firestore: Firestore,
    userId: string,
    saleId: string,
    data: z.infer<typeof saleSchema>,
    originalSale: Pick<Sale, 'flockId' | 'saleType' | 'quantity'>
) {
    const saleDocRef = doc(firestore, 'users', userId, 'sales', saleId);
    const inventoryChanges = new Map<string, Record<string, number>>();
    const addInventoryChange = (flockId: string, saleType: Sale['saleType'], quantityChange: number) => {
        const changes = inventoryChanges.get(flockId) ?? {};
        const field = inventoryField(saleType);
        changes[field] = (changes[field] ?? 0) + quantityChange;
        inventoryChanges.set(flockId, changes);
    };

    addInventoryChange(originalSale.flockId, originalSale.saleType, originalSale.quantity);
    addInventoryChange(data.flockId, data.saleType, -data.quantity);

    const batch = writeBatch(firestore);
    batch.update(saleDocRef, saleData(data));
    inventoryChanges.forEach((changes, flockId) => {
        const updates = Object.fromEntries(
            Object.entries(changes)
                .filter(([, quantityChange]) => quantityChange !== 0)
                .map(([field, quantityChange]) => [field, increment(quantityChange)])
        );

        if (Object.keys(updates).length > 0) {
            batch.update(doc(firestore, 'users', userId, 'flocks', flockId), updates);
        }
    });

    return commitBatchNonBlocking(batch, {
        path: saleDocRef.path,
        operation: 'update',
        requestResourceData: data,
    });
}

export function deleteSale(firestore: Firestore, userId: string, saleId: string) {
    const saleDocRef = doc(firestore, 'users', userId, 'sales', saleId);
    deleteDocumentNonBlocking(saleDocRef);
}

export function deleteSaleWithInventory(firestore: Firestore, userId: string, sale: Sale) {
    const saleDocRef = doc(firestore, 'users', userId, 'sales', sale.id);
    const flockDocRef = doc(firestore, 'users', userId, 'flocks', sale.flockId);
    const batch = writeBatch(firestore);

    batch.delete(saleDocRef);
    batch.update(flockDocRef, { [inventoryField(sale.saleType)]: increment(sale.quantity) });

    return commitBatchNonBlocking(batch, {
        path: saleDocRef.path,
        operation: 'delete',
    });
}
