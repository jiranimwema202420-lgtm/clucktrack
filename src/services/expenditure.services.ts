import { z } from "zod";
import {
  collection,
  doc,
  Firestore,
  Timestamp,
  runTransaction,
} from "firebase/firestore";

import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from "@/firebase/firestore/non-blocking-writes";

import { expenditureSchema, type Flock } from "@/lib/types";

export type ExpenditureFormData = z.infer<
  typeof expenditureSchema
>;

export function addExpenditure(
  firestore: Firestore,
  userId: string,
  data: ExpenditureFormData,
) {
  const expendituresRef = collection(
    firestore,
    "users",
    userId,
    "expenditures",
  );

  const amount =
    data.quantity * data.unitPrice;

  const newExpenditure = {
    ...data,
    expenditureDate: Timestamp.fromDate(
      data.expenditureDate,
    ),
    amount,
  };

  return addDocumentNonBlocking(
    expendituresRef,
    newExpenditure,
  );
}

export function updateExpenditure(
  firestore: Firestore,
  userId: string,
  expenditureId: string,
  data: ExpenditureFormData,
) {
  const expenditureDocRef = doc(
    firestore,
    "users",
    userId,
    "expenditures",
    expenditureId,
  );

  const amount =
    data.quantity * data.unitPrice;

  const updatedExpenditure = {
    ...data,
    expenditureDate: Timestamp.fromDate(
      data.expenditureDate,
    ),
    amount,
  };

  return updateDocumentNonBlocking(
    expenditureDocRef,
    updatedExpenditure,
  );
}

export function deleteExpenditure(
  firestore: Firestore,
  userId: string,
  expenditureId: string,
) {
  const expenditureDocRef = doc(
    firestore,
    "users",
    userId,
    "expenditures",
    expenditureId,
  );

  return deleteDocumentNonBlocking(
    expenditureDocRef,
  );
}

/**
 * Imports expenditures atomically with their corresponding
 * flock-total updates.
 *
 * Every expenditure document and every affected flock update
 * is committed as part of the same Firestore transaction.
 *
 * Multiple imported expenditures for the same flock are
 * aggregated so that the flock document is updated only once.
 */
export async function importExpenditures(
  firestore: Firestore,
  userId: string,
  expenditures: ExpenditureFormData[],
  flocks: Flock[],
) {
  if (expenditures.length === 0) {
    return;
  }

  // Firestore transactions have a 500-write limit.
  // Each expenditure requires one write, and each affected
  // flock requires one additional write.
  //
  // Keeping the import below 250 records guarantees that
  // even if every row belongs to a different flock, the
  // transaction stays within the Firestore write limit.
  if (expenditures.length > 250) {
    throw new Error(
      "Import is limited to 250 expenditures per operation. Split larger imports into smaller batches.",
    );
  }

  const expendituresRef = collection(
    firestore,
    "users",
    userId,
    "expenditures",
  );

  const flockDeltas = new Map<
    string,
    {
      amountChange: number;
      feedChange: number;
    }
  >();

  for (const item of expenditures) {
    if (!item.flockId) {
      continue;
    }

    const flock = flocks.find(
      (candidate) => candidate.id === item.flockId,
    );

    if (!flock) {
  throw new Error(
    `The selected flock ${item.flockId} could not be found.`,
  );
}

    const amount =
      item.quantity * item.unitPrice;

    const existing =
      flockDeltas.get(item.flockId) ?? {
        amountChange: 0,
        feedChange: 0,
      };

    existing.amountChange += amount;

    if (item.category === "Feed") {
      existing.feedChange += item.quantity;
    }

    flockDeltas.set(
      item.flockId,
      existing,
    );
  }

  const flockIds = Array.from(
    flockDeltas.keys(),
  );

  await runTransaction(
    firestore,
    async (transaction) => {
      const flockSnapshots = new Map();

      // All reads must happen before writes in a
      // Firestore transaction.
      for (const flockId of flockIds) {
        const flockDocRef = doc(
          firestore,
          "users",
          userId,
          "flocks",
          flockId,
        );

        const snapshot =
          await transaction.get(flockDocRef);

        if (!snapshot.exists()) {
          throw new Error(
            `The selected flock ${flockId} no longer exists.`,
          );
        }

        flockSnapshots.set(
          flockId,
          snapshot,
        );
      }

      // Create every expenditure inside the transaction.
      for (const item of expenditures) {
        const expenditureDocRef =
          doc(expendituresRef);

        const amount =
          item.quantity * item.unitPrice;

        const newExpenditure = {
          ...item,
          expenditureDate:
            Timestamp.fromDate(
              item.expenditureDate,
            ),
          amount,
        };

        transaction.set(
          expenditureDocRef,
          newExpenditure,
        );
      }

      // Update each affected flock once.
      for (const [flockId, delta] of flockDeltas) {
        const snapshot =
          flockSnapshots.get(flockId);

        if (!snapshot) {
          continue;
        }

        const flock =
          snapshot.data() as Flock;

        const currentTotalCost =
          Number(flock.totalCost ?? 0);

        const currentFeedConsumed =
          Number(
            flock.totalFeedConsumed ?? 0,
          );

        const flockDocRef = doc(
          firestore,
          "users",
          userId,
          "flocks",
          flockId,
        );

        transaction.update(
          flockDocRef,
          {
            totalCost:
              currentTotalCost +
              delta.amountChange,
            totalFeedConsumed:
              currentFeedConsumed +
              delta.feedChange,
          },
        );
      }
    },
  );
}


