import { collection, doc, Firestore } from "firebase/firestore";
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from "@/firebase/firestore/non-blocking-writes";
import { z } from "zod";
import { contactSchema } from "@/lib/types";

export type ContactFormData = z.infer<typeof contactSchema>;

export function addContact(
  firestore: Firestore,
  userId: string,
  data: ContactFormData,
) {
  const contactsRef = collection(firestore, "users", userId, "contacts");

  return addDocumentNonBlocking(contactsRef, data);
}

export function updateContact(
  firestore: Firestore,
  userId: string,
  contactId: string,
  data: ContactFormData,
) {
  const contactDocRef = doc(firestore, "users", userId, "contacts", contactId);

  return updateDocumentNonBlocking(contactDocRef, data);
}

export function deleteContact(
  firestore: Firestore,
  userId: string,
  contactId: string,
) {
  const contactDocRef = doc(firestore, "users", userId, "contacts", contactId);

  return deleteDocumentNonBlocking(contactDocRef);
}