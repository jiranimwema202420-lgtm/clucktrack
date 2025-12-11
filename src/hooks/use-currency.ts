
'use client';

import { useMemo } from "react";
import { useFirebase, useDoc } from "@/firebase";
import { doc } from 'firebase/firestore';
import type { UserProfile } from "@/lib/types";

const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    KES: 'KSh',
    NGN: '₦',
};

export const useCurrency = () => {
    const { user, firestore } = useFirebase();

    const userProfileRef = useMemo(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
      }, [firestore, user]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const currencyCode = userProfile?.currency || 'USD';
    const currencySymbol = currencySymbols[currencyCode] || '$';

    const formatCurrency = (amount: number) => {
        if (typeof amount !== 'number') {
            return `${currencySymbol}0.00`;
        }
        return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return { currencyCode, currencySymbol, formatCurrency };
};
