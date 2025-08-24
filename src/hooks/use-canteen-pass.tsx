"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Transaction, User } from '@/lib/types';
import { useToast } from './use-toast';

interface CanteenPassContextType {
  loading: boolean;
  users: User[];
  currentUser: User | null;
  balance: number;
  transactions: Transaction[];
  addUser: (name: string) => void;
  addTokens: (amount: number) => void;
  spendTokens: (amount: number, description: string) => { success: boolean; data: string | null };
  getSpendingHabits: () => string;
  switchUser: (userId: string) => void;
  logout: () => void;
}

export const CanteenPassContext = createContext<CanteenPassContextType | undefined>(undefined);

const initialUsers: User[] = [
    { id: 'user-alex-doe', name: 'Alex Doe', balance: 100, transactions: [], role: 'user' },
    { id: 'user-jane-doe', name: 'Jane Doe', balance: 250, transactions: [], role: 'user' },
    { id: 'admin-main', name: 'Main Admin', balance: 0, transactions: [], role: 'admin' },
    { id: 'admin-canteen', name: 'Canteen Admin', balance: 0, transactions: [], role: 'admin' },
];


export function useCanteenPassState() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('canteen-users');
      const storedCurrentUserId = localStorage.getItem('canteen-current-user-id');
      
      let loadedUsers: User[] = initialUsers;
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        if (parsedUsers.length > 0) {
            loadedUsers = parsedUsers;
        }
      }
      setUsers(loadedUsers);

      if (storedCurrentUserId) {
          const currentUserId = JSON.parse(storedCurrentUserId);
          const userToSet = loadedUsers.find(u => u.id === currentUserId);
          setCurrentUser(userToSet || null);
      }

    } catch (error) {
      console.error("Failed to load from local storage", error);
      toast({ title: "Error", description: "Could not load your data.", variant: "destructive" });
      setUsers(initialUsers); // Fallback to initial users on error
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('canteen-users', JSON.stringify(users));
        if (currentUser) {
          localStorage.setItem('canteen-current-user-id', JSON.stringify(currentUser.id));
        } else {
            localStorage.removeItem('canteen-current-user-id');
        }
      } catch (error) {
        console.error("Failed to save to local storage", error);
        toast({ title: "Error", description: "Could not save your data.", variant: "destructive" });
      }
    }
  }, [users, currentUser, loading, toast]);

  const updateUserInList = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
  };
  
  const addUser = useCallback((name: string) => {
    const newUser: User = {
      id: `user-${name.toLowerCase().replace(/\s/g, '-')}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      balance: 0,
      transactions: [],
      role: 'user'
    };
    setUsers(prev => [...prev, newUser]);
    toast({
      title: "User Added",
      description: `${name} has been added to the system.`,
    });
  }, [toast]);

  const switchUser = useCallback((userId: string) => {
    const userToSwitch = users.find(u => u.id === userId);
    if(userToSwitch) {
      setCurrentUser(userToSwitch);
      toast({
        title: "Login Successful",
        description: `Welcome, ${userToSwitch.name}.`,
      });
    }
  }, [users, toast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    });
  }, [toast]);

  const addTokens = useCallback((amount: number) => {
    if (!currentUser) return;
    if (amount <= 0) return;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'credit',
      amount,
      description: 'Self-assigned tokens',
      timestamp: Date.now(),
    };
    
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance + amount,
      transactions: [newTransaction, ...currentUser.transactions],
    };

    setCurrentUser(updatedUser);
    updateUserInList(updatedUser);

    toast({
      title: "Success",
      description: `${amount} tokens added to ${currentUser.name}'s account.`,
    });
  }, [currentUser, toast]);

  const spendTokens = useCallback((amount: number, description: string) => {
    if (!currentUser) return { success: false, data: "No active user." };
    if (amount <= 0) return { success: false, data: "Amount must be positive." };
    if (currentUser.balance < amount) return { success: false, data: "Insufficient balance." };

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'debit',
      amount,
      description,
      timestamp: Date.now(),
    };
    
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance - amount,
      transactions: [newTransaction, ...currentUser.transactions],
    };

    setCurrentUser(updatedUser);
    updateUserInList(updatedUser);
    
    const qrData = {
        transactionId: newTransaction.id,
        userId: currentUser.id,
        amount,
        description,
        timestamp: newTransaction.timestamp,
    };

    return { success: true, data: JSON.stringify(qrData, null, 2) };
  }, [currentUser]);

  const getSpendingHabits = useCallback(() => {
    const transactions = currentUser?.transactions || [];
    const debitTransactions = transactions.filter(t => t.type === 'debit');
    if (debitTransactions.length < 3) {
      return "Not enough spending history to make a suggestion. Please make a few more purchases.";
    }
    const totalSpent = debitTransactions.reduce((acc, t) => acc + t.amount, 0);
    const avgSpent = totalSpent / debitTransactions.length;
    const days = (Date.now() - (debitTransactions[debitTransactions.length-1]?.timestamp ?? Date.now())) / (1000 * 60 * 60 * 24);
    const frequency = debitTransactions.length / (days || 1);

    return `User has made ${debitTransactions.length} purchases. Average purchase amount is ${avgSpent.toFixed(2)} tokens. They spend tokens approximately ${frequency.toFixed(1)} times a day.`;
  }, [currentUser]);

  return { 
    loading, 
    users,
    currentUser,
    balance: currentUser?.balance ?? 0,
    transactions: currentUser?.transactions ?? [],
    addUser,
    addTokens, 
    spendTokens, 
    getSpendingHabits,
    switchUser,
    logout,
  };
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
