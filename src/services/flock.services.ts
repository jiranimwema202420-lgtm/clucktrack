import {
  collection,
  doc,
  runTransaction,
  Timestamp,
  Firestore,
} from "firebase/firestore";

import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from "@/firebase/firestore/non-blocking-writes";

import { expenditureSchema, flockSchema, type Flock } from "@/lib/types";

import { z } from "zod";

export type FlockExpenditureData = z.infer<typeof expenditureSchema>;
export type FlockUpdateData = Partial<z.infer<typeof flockSchema>>;

export function addFlock(
  firestore: Firestore,
  userId: string,
  expenditure: FlockExpenditureData,
) {
  const flocksRef = collection(firestore, "users", userId, "flocks");

  const newFlock = {
    breed: expenditure.description || "Unknown Breed",
    type: "Broiler",
    count: expenditure.quantity,
    initialCount: expenditure.quantity,
    hatchDate: Timestamp.fromDate(expenditure.expenditureDate),
    averageWeight: 0.1,
    totalFeedConsumed: 0,
    totalCost: expenditure.quantity * expenditure.unitPrice,
    eggProductionRate: 0,
    totalEggsCollected: 0,
  };

  return addDocumentNonBlocking(flocksRef, newFlock);
}

export function updateFlock(
  firestore: Firestore,
  userId: string,
  flockId: string,
  data: FlockUpdateData,
) {
  const flockDocRef = doc(firestore, "users", userId, "flocks", flockId);

  const updateData: Record<string, unknown> = {
    ...data,
  };

  if (data.hatchDate && data.hatchDate instanceof Date) {
    updateData.hatchDate = Timestamp.fromDate(data.hatchDate);
  }

  return updateDocumentNonBlocking(flockDocRef, updateData);
}

export function deleteFlock(
  firestore: Firestore,
  userId: string,
  flockId: string,
) {
  const flockDocRef = doc(firestore, "users", userId, "flocks", flockId);

  return deleteDocumentNonBlocking(flockDocRef);
}

export async function updateFlockTotals(
  firestore: Firestore,
  userId: string,
  flockId: string,
  amountChange: number,
  feedChange: number,
) {
  const flockDocRef = doc(firestore, "users", userId, "flocks", flockId);

  await runTransaction(firestore, async (transaction) => {
    const flockSnapshot = await transaction.get(flockDocRef);

    if (!flockSnapshot.exists()) {
      throw new Error("The selected flock no longer exists.");
    }

    const flock = flockSnapshot.data() as Flock;

    const currentTotalCost = Number(flock.totalCost ?? 0);

    const currentFeedConsumed = Number(flock.totalFeedConsumed ?? 0);

    transaction.update(flockDocRef, {
      totalCost: currentTotalCost + amountChange,
      totalFeedConsumed: currentFeedConsumed + feedChange,
    });
  });
}

export class MortalityInventoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MortalityInventoryError";
  }
}

export async function recordMortality(
  firestore: Firestore,
  userId: string,
  flockId: string,
  count: number,
  recordedAt: Date,
) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new MortalityInventoryError(
      "Mortality count must be a positive whole number.",
    );
  }

  const flockDocRef = doc(firestore, "users", userId, "flocks", flockId);

  const mortalityDocRef = doc(
    collection(firestore, "users", userId, "mortalities"),
  );

  await runTransaction(firestore, async (transaction) => {
    const flockSnapshot = await transaction.get(flockDocRef);

    if (!flockSnapshot.exists()) {
      throw new MortalityInventoryError("The selected flock no longer exists.");
    }

    const flock = flockSnapshot.data() as Flock;

    const currentCount = Number(flock.count ?? 0);

    if (count > currentCount) {
      throw new MortalityInventoryError(
        `Cannot record a loss of ${count}; only ${currentCount} birds remain.`,
      );
    }

    transaction.update(flockDocRef, {
      count: currentCount - count,
    });

    transaction.set(mortalityDocRef, {
      flockId,
      count,
      recordedAt: Timestamp.fromDate(recordedAt),
    });
  });
}
