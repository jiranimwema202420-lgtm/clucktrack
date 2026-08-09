import {
    collection,
    doc,
    Firestore,
    runTransaction,
    Timestamp,
    Transaction,
} from 'firebase/firestore';
import type { Flock, Sale } from '@/lib/types';
import { z } from 'zod';
import { saleSchema } from '@/lib/types';

type SaleInput = z.infer<typeof saleSchema>;
type InventoryField = 'count' | 'totalEggsCollected';
type InventoryChanges = Map<string, Partial<Record<InventoryField, number>>>;

export class SaleInventoryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SaleInventoryError';
    }
}

function inventoryField(saleType: Sale['saleType']): InventoryField {
    return saleType === 'Birds' ? 'count' : 'totalEggsCollected';
}

function saleData(data: SaleInput) {
    return {
        ...data,
        saleDate: Timestamp.fromDate(data.saleDate),
        total: data.quantity * data.pricePerUnit,
    };
}

function addInventoryChange(
    changes: InventoryChanges,
    flockId: string,
    saleType: Sale['saleType'],
    quantityChange: number
) {
    const field = inventoryField(saleType);
    const flockChanges = changes.get(flockId) ?? {};
    flockChanges[field] = (flockChanges[field] ?? 0) + quantityChange;
    changes.set(flockId, flockChanges);
}

async function applyInventoryChanges(
    transaction: Transaction,
    firestore: Firestore,
    userId: string,
    changes: InventoryChanges
) {
    const updates = [...changes.entries()]
        .map(([flockId, fieldChanges]) => [
            flockId,
            Object.entries(fieldChanges).filter(([, quantityChange]) => quantityChange !== 0),
        ] as const)
        .filter(([, fieldChanges]) => fieldChanges.length > 0);

    const snapshots = await Promise.all(
        updates.map(([flockId]) => transaction.get(doc(firestore, 'users', userId, 'flocks', flockId)))
    );

    updates.forEach(([flockId, fieldChanges], index) => {
        const flockSnapshot = snapshots[index];
        if (!flockSnapshot.exists()) {
            throw new SaleInventoryError('The selected flock no longer exists.');
        }

        const flock = flockSnapshot.data() as Flock;
        const flockUpdates: Partial<Record<InventoryField, number>> = {};

        fieldChanges.forEach(([field, quantityChange]) => {
            const currentQuantity = flock[field] ?? 0;
            const nextQuantity = currentQuantity + quantityChange;

            if (nextQuantity < 0) {
                const itemLabel = field === 'count' ? 'birds' : 'eggs';
                throw new SaleInventoryError(`Not enough ${itemLabel} remain in the selected flock.`);
            }

            flockUpdates[field] = nextQuantity;
        });

        transaction.update(doc(firestore, 'users', userId, 'flocks', flockId), flockUpdates);
    });
}

export async function addSaleWithInventory(firestore: Firestore, userId: string, data: SaleInput) {
    const saleDocRef = doc(collection(firestore, 'users', userId, 'sales'));
    const inventoryChanges: InventoryChanges = new Map();
    addInventoryChange(inventoryChanges, data.flockId, data.saleType, -data.quantity);

    await runTransaction(firestore, async transaction => {
        await applyInventoryChanges(transaction, firestore, userId, inventoryChanges);
        transaction.set(saleDocRef, saleData(data));
    });
}

export async function updateSaleWithInventory(
    firestore: Firestore,
    userId: string,
    saleId: string,
    data: SaleInput
) {
    const saleDocRef = doc(firestore, 'users', userId, 'sales', saleId);

    await runTransaction(firestore, async transaction => {
        const saleSnapshot = await transaction.get(saleDocRef);
        if (!saleSnapshot.exists()) {
            throw new SaleInventoryError('This sale no longer exists.');
        }

        const existingSale = saleSnapshot.data() as Sale;
        const inventoryChanges: InventoryChanges = new Map();
        addInventoryChange(inventoryChanges, existingSale.flockId, existingSale.saleType, existingSale.quantity);
        addInventoryChange(inventoryChanges, data.flockId, data.saleType, -data.quantity);

        await applyInventoryChanges(transaction, firestore, userId, inventoryChanges);
        transaction.update(saleDocRef, saleData(data));
    });
}

export async function deleteSaleWithInventory(firestore: Firestore, userId: string, saleId: string) {
    const saleDocRef = doc(firestore, 'users', userId, 'sales', saleId);

    await runTransaction(firestore, async transaction => {
        const saleSnapshot = await transaction.get(saleDocRef);
        if (!saleSnapshot.exists()) {
            throw new SaleInventoryError('This sale no longer exists.');
        }

        const sale = saleSnapshot.data() as Sale;
        const inventoryChanges: InventoryChanges = new Map();
        addInventoryChange(inventoryChanges, sale.flockId, sale.saleType, sale.quantity);

        await applyInventoryChanges(transaction, firestore, userId, inventoryChanges);
        transaction.delete(saleDocRef);
    });
}
