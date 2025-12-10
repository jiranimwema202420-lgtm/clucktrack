import { collection, doc, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { z } from 'zod';
import { contactSchema } from '@/lib/types';

export function addContact(firestore: Firestore, userId: string, data: z.infer<typeof contactSchema>) {
    const contactsRef = collection(firestore, 'users', userId, 'contacts');
    addDocumentNonBlocking(contactsRef, data);
}

export function updateContact(firestore: Firestore, userId: string, contactId: string, data: z.infer<typeof contactSchema>) {
    const contactDocRef = doc(firestore, 'users', userId, 'contacts', contactId);
    updateDocumentNonBlocking(contactDocRef, data);
}

export function deleteContact(firestore: Firestore, userId: string, contactId: string) {
    const contactDocRef = doc(firestore, 'users', userId, 'contacts', contactId);
    deleteDocumentNonBlocking(contactDocRef);
}
