import { collection, doc, runTransaction, Timestamp, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/firestore/non-blocking-writes';
import { z } from 'zod';
import { expenditureSchema, flockSchema, type Flock } from '@/lib/types';

export function addFlock(firestore: Firestore, userId: string, expenditure: z.infer<typeof expenditureSchema>) {
    const flocksRef = collection(firestore, 'users', userId, 'flocks');
    const newFlock = {
        breed: expenditure.description || 'Unknown Breed',
        type: 'Broiler', // Defaulting to broiler for new chick purchases
        count: expenditure.quantity,
        initialCount: expenditure.quantity,
        hatchDate: Timestamp.fromDate(expenditure.expenditureDate),
        averageWeight: 0.1, // Default starting weight
        totalFeedConsumed: 0,
        totalCost: expenditure.quantity * expenditure.unitPrice,
        eggProductionRate: 0,
        totalEggsCollected: 0,
    };
    addDocumentNonBlocking(flocksRef, newFlock);
}

export function updateFlock(firestore: Firestore, userId: string, flockId: string, data: Partial<z.infer<typeof flockSchema>>) {
    const flockDocRef = doc(firestore, 'users', userId, 'flocks', flockId);
    const updateData: any = { ...data };
    if (data.hatchDate && data.hatchDate instanceof Date) {
        updateData.hatchDate = Timestamp.fromDate(data.hatchDate);
    }
    updateDocumentNonBlocking(flockDocRef, updateData);
}

export function deleteFlock(firestore: Firestore, userId: string, flockId: string) {
    const flockDocRef = doc(firestore, 'users', userId, 'flocks', flockId);
    deleteDocumentNonBlocking(flockDocRef);
}

export async function updateFlockTotals(firestore: Firestore, userId: string, flockId: string, amountChange: number, feedChange: number) {
    // This function is intended to be used with a proper transaction on the backend (e.g., Cloud Function)
    // to safely read and then write values.
    // For the client-side, the calculation is done within the component before calling updateFlock.
    // This function can be built out later if a transactional update service is created.
}

export class MortalityInventoryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MortalityInventoryError';
    }
}

export async function recordMortality(
    firestore: Firestore,
    userId: string,
    flockId: string,
    count: number,
    recordedAt: Date
) {
    const flockDocRef = doc(firestore, 'users', userId, 'flocks', flockId);
    const mortalityDocRef = doc(collection(firestore, 'users', userId, 'mortalities'));

    await runTransaction(firestore, async transaction => {
        const flockSnapshot = await transaction.get(flockDocRef);
        if (!flockSnapshot.exists()) {
            throw new MortalityInventoryError('The selected flock no longer exists.');
        }

        const flock = flockSnapshot.data() as Flock;
        if (count > flock.count) {
            throw new MortalityInventoryError(`Cannot record a loss of ${count}; only ${flock.count} birds remain.`);
        }

        transaction.update(flockDocRef, { count: flock.count - count });
        transaction.set(mortalityDocRef, {
            flockId,
            count,
            recordedAt: Timestamp.fromDate(recordedAt),
        });
    });
}
