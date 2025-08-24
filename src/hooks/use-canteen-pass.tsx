"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Transaction } from '@/lib/types';
import { useToast } from './use-toast';

interface CanteenPassContextType {
  loading: boolean;
  balance: number;
  transactions: Transaction[];
  user: { id: string; name: string };
  addTokens: (amount: number) => void;
  spendTokens: (amount: number, description: string) => { success: boolean; data: string | null };
  getSpendingHabits: () => string;
}

export const CanteenPassContext = createContext<CanteenPassContextType | undefined>(undefined);

export function useCanteenPassState() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(100);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const user = { id: `user-${Math.random().toString(36).substr(2, 9)}`, name: 'Alex Doe' };
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedBalance = localStorage.getItem('canteen-balance');
      const storedTransactions = localStorage.getItem('canteen-transactions');
      if (storedBalance) {
        setBalance(JSON.parse(storedBalance));
      }
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.error("Failed to load from local storage", error);
      toast({ title: "Error", description: "Could not load your data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('canteen-balance', JSON.stringify(balance));
        localStorage.setItem('canteen-transactions', JSON.stringify(transactions));
      } catch (error) {
        console.error("Failed to save to local storage", error);
        toast({ title: "Error", description: "Could not save your data.", variant: "destructive" });
      }
    }
  }, [balance, transactions, loading, toast]);

  const addTokens = useCallback((amount: number) => {
    if (amount <= 0) return;
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'credit',
      amount,
      description: 'Self-assigned tokens',
      timestamp: Date.now(),
    };
    setBalance((prev) => prev + amount);
    setTransactions((prev) => [newTransaction, ...prev]);
    toast({
      title: "Success",
      description: `${amount} tokens added to your account.`,
    });
  }, [toast]);

  const spendTokens = useCallback((amount: number, description: string) => {
    if (amount <= 0) return { success: false, data: "Amount must be positive." };
    if (balance < amount) return { success: false, data: "Insufficient balance." };

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'debit',
      amount,
      description,
      timestamp: Date.now(),
    };
    setBalance((prev) => prev - amount);
    setTransactions((prev) => [newTransaction, ...prev]);
    
    const qrData = {
        transactionId: newTransaction.id,
        userId: user.id,
        amount,
        description,
        timestamp: newTransaction.timestamp,
    };

    return { success: true, data: JSON.stringify(qrData, null, 2) };

  }, [balance, user.id]);

  const getSpendingHabits = useCallback(() => {
    const debitTransactions = transactions.filter(t => t.type === 'debit');
    if (debitTransactions.length < 3) {
      return "Not enough spending history to make a suggestion. Please make a few more purchases.";
    }
    const totalSpent = debitTransactions.reduce((acc, t) => acc + t.amount, 0);
    const avgSpent = totalSpent / debitTransactions.length;
    const days = (Date.now() - (debitTransactions[debitTransactions.length-1]?.timestamp ?? Date.now())) / (1000 * 60 * 60 * 24);
    const frequency = debitTransactions.length / (days || 1);

    return `User has made ${debitTransactions.length} purchases. Average purchase amount is ${avgSpent.toFixed(2)} tokens. They spend tokens approximately ${frequency.toFixed(1)} times a day.`;
  }, [transactions]);


  return { loading, balance, transactions, user, addTokens, spendTokens, getSpendingHabits };
}

export function CanteenPassProvider({ children }: { children: ReactNode }) {
  const value = useCanteenPassState();
  return (
    <CanteenPassContext.Provider value={value}>
      {children}
    </CanteenPassContext.Provider>
  );
}


export function useCanteenPass() {
  const context = useContext(CanteenPassContext);
  if (context === undefined) {
    throw new Error('useCanteenPass must be used within a CanteenPassProvider');
  }
  return context;
}
