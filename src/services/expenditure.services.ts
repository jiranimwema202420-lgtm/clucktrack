import { collection, doc, Timestamp, Firestore, WhereFilter, where } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import type { Expenditure, Flock } from '@/lib/types';
import { z } from 'zod';
import { expenditureSchema } from '@/lib/types';
import { updateFlockTotals } from './flock.services';

export function addExpenditure(firestore: Firestore, userId: string, data: z.infer<typeof expenditureSchema>) {
    const expendituresRef = collection(firestore, 'users', userId, 'expenditures');
    const amount = data.quantity * data.unitPrice;
    const newExpenditure = {
      ...data,
      expenditureDate: Timestamp.fromDate(data.expenditureDate),
      amount,
    };
    addDocumentNonBlocking(expendituresRef, newExpenditure);
}

export function updateExpenditure(firestore: Firestore, userId: string, expenditureId: string, data: z.infer<typeof expenditureSchema>) {
    const expenditureDocRef = doc(firestore, 'users', userId, 'expenditures', expenditureId);
    const amount = data.quantity * data.unitPrice;
    const updatedExpenditure = {
        ...data,
        expenditureDate: Timestamp.fromDate(data.expenditureDate),
        amount,
    };
    updateDocumentNonBlocking(expenditureDocRef, updatedExpenditure);
}

export function deleteExpenditure(firestore: Firestore, userId: string, expenditureId: string) {
    const expenditureDocRef = doc(firestore, 'users', userId, 'expenditures', expenditureId);
    deleteDocumentNonBlocking(expenditureDocRef);
}

export async function importExpenditures(firestore: Firestore, userId: string, expenditures: z.infer<typeof expenditureSchema>[], flocks: Flock[]) {
    const expendituresRef = collection(firestore, 'users', userId, 'expenditures');

    for (const item of expenditures) {
        const amount = item.quantity * item.unitPrice;
        const newExpenditure = { ...item, expenditureDate: Timestamp.fromDate(item.expenditureDate), amount };
        addDocumentNonBlocking(expendituresRef, newExpenditure);
        
        const flock = flocks.find(f => f.id === item.flockId);
        if (item.flockId && flock) {
            const feedChange = item.category === 'Feed' ? item.quantity : 0;
            await updateFlockTotals(firestore, userId, item.flockId, amount, feedChange);
        }
    }
}
