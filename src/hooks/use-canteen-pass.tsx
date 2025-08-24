
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
  addUser: (name: string, employeeId: string, role?: 'user' | 'admin', password?: string) => void;
  addTokens: (amount: number) => void;
  addTokensToUser: (userId: string, amount: number) => void;
  spendTokens: (amount: number, description: string) => { success: boolean; data: string | null };
  spendTokensFromUser: (userId: string, amount: number, description: string) => { success: boolean; data: string | null };
  getSpendingHabits: () => string;
  switchUser: (userId: string, password?: string) => void;
  logout: () => void;
  deleteUser: (userId: string) => void;
  editUser: (userId: string, name: string, employeeId: string) => void;
}

export const CanteenPassContext = createContext<CanteenPassContextType | undefined>(undefined);

const initialUsers: User[] = [
    { id: 'user-alex-doe', employeeId: 'E12345', name: 'Alex Doe', password: 'password', balance: 100, transactions: [], role: 'user', lastUpdated: Date.now() },
    { id: 'user-jane-doe', employeeId: 'E67890', name: 'Jane Doe', password: 'password', balance: 250, transactions: [], role: 'user', lastUpdated: Date.now() },
    { id: 'admin-main', employeeId: 'A00001', name: 'Main Admin', password: 'password', balance: 0, transactions: [], role: 'admin', lastUpdated: Date.now() },
    { id: 'admin-canteen', employeeId: 'A00002', name: 'Canteen Admin', password: 'password', balance: 0, transactions: [], role: 'admin', lastUpdated: Date.now() },
];


export function useCanteenPassState() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  const createSignature = (data: { employee_id: string, timestamp: string }) => {
    const dataString = `${data.employee_id}|${data.timestamp}|CanteenPass-Secret-Key`; // Added a static "secret"
    let hash = 0;
    if (dataString.length === 0) return `sig-0`;
    for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `sig-${hash}`;
  };

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('canteen-users');
      const storedCurrentUserId = localStorage.getItem('canteen-current-user-id');
      
      let loadedUsers: User[] = [];
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
            loadedUsers = parsedUsers;
        } else {
            loadedUsers = initialUsers;
        }
      } else {
        loadedUsers = initialUsers;
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
      setUsers(initialUsers);
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
  
  const addUser = useCallback((name: string, employeeId: string, role: 'user' | 'admin' = 'user', password?: string) => {
    const newUser: User = {
      id: `${role}-${name.toLowerCase().replace(/\s/g, '-')}-${Math.random().toString(36).substr(2, 5)}`,
      employeeId,
      name,
      password: password,
      balance: role === 'admin' ? 0 : 0,
      transactions: [],
      role: role,
      lastUpdated: Date.now()
    };
    setUsers(prev => [...prev, newUser]);
    toast({
      title: `${role.charAt(0).toUpperCase() + role.slice(1)} Added`,
      description: `${name} has been added to the system as a ${role}.`,
    });
  }, [toast]);

  const switchUser = useCallback((userId: string, password?: string) => {
    const userToSwitch = users.find(u => u.id === userId);
    if(userToSwitch) {
      if (userToSwitch.role !== 'admin' && userToSwitch.password && userToSwitch.password !== password) {
          toast({
              title: "Login Failed",
              description: "The password you entered is incorrect.",
              variant: "destructive",
          });
          return;
      }
      setCurrentUser(userToSwitch);
      toast({
        title: "Login Successful",
        description: `Welcome, ${userToSwitch.name}.`,
      });
    } else {
        toast({
            title: "Login Failed",
            description: "User not found.",
            variant: "destructive",
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
      lastUpdated: Date.now(),
    };

    setCurrentUser(updatedUser);
    updateUserInList(updatedUser);

    toast({
      title: "Success",
      description: `${amount} tokens added to ${currentUser.name}'s account.`,
    });
  }, [currentUser, toast]);

  const addTokensToUser = useCallback((userId: string, amount: number) => {
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.id === userId) {
          const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            type: 'credit',
            amount,
            description: 'Tokens added by admin',
            timestamp: Date.now(),
          };
          const updatedUser = {
            ...user,
            balance: user.balance + amount,
            transactions: [newTransaction, ...user.transactions],
            lastUpdated: Date.now(),
          };
          
          if(currentUser?.id === userId) {
              setCurrentUser(updatedUser);
          }
  
          toast({
              title: 'Success',
              description: `${amount} tokens added to ${user.name}'s account.`,
          });
  
          return updatedUser;
        }
        return user;
      });
      return newUsers;
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
    
    const updatedUser: User = {
      ...currentUser,
      balance: currentUser.balance - amount,
      transactions: [newTransaction, ...currentUser.transactions],
      lastUpdated: Date.now(),
    };

    setCurrentUser(updatedUser);
    updateUserInList(updatedUser);
    
    const qrPayload = {
      employee_id: updatedUser.employeeId,
      timestamp: new Date(updatedUser.lastUpdated).toISOString(),
    };
    const signature = createSignature(qrPayload);
    
    const qrData = {
        ...qrPayload,
        device_signature: signature,
        name: updatedUser.name,
        balance: updatedUser.balance,
        transaction: {
          amount: newTransaction.amount,
          description: newTransaction.description
        }
    };

    return { success: true, data: JSON.stringify(qrData, null, 2) };
  }, [currentUser]);

  const spendTokensFromUser = useCallback((userId: string, amount: number, description: string) => {
    let success = false;
    let data: string | null = "User not found.";
    
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.id === userId) {
          if (user.balance < amount) {
            data = "Insufficient balance.";
            return user;
          }
          const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            type: 'debit',
            amount,
            description,
            timestamp: Date.now(),
          };
          const updatedUser = {
            ...user,
            balance: user.balance - amount,
            transactions: [newTransaction, ...user.transactions],
            lastUpdated: Date.now(),
          };
          success = true;
          data = "Transaction successful";
          return updatedUser;
        }
        return user;
      });
      return newUsers;
    });

    return { success, data };
  }, []);

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
  
  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => {
        const userToDelete = prev.find(user => user.id === userId);
        if (!userToDelete) return prev;

        if (userToDelete.role === 'admin') {
            toast({ title: "Action Forbidden", description: "Admin users cannot be deleted.", variant: "destructive" });
            return prev;
        }

        const newUsers = prev.filter(user => user.id !== userId);

        if (currentUser?.id === userId) {
            setCurrentUser(null);
        }
        toast({ title: "User Deleted", description: `User ${userToDelete.name} has been removed.`});
        return newUsers;
    });
  }, [currentUser?.id, toast]);
  
  const editUser = useCallback((userId: string, name: string, employeeId: string) => {
     setUsers(prev => {
        const newUsers = prev.map(user => {
            if (user.id === userId) {
                const updatedUser = { ...user, name, employeeId, lastUpdated: Date.now() };
                if (currentUser?.id === userId) {
                    setCurrentUser(updatedUser);
                }
                toast({ title: "User Updated", description: "User details have been changed." });
                return updatedUser;
            }
            return user;
        });
        return newUsers;
     });
  }, [currentUser?.id, toast]);

  const allTransactions = users.flatMap(u => u.transactions);


  return { 
    loading, 
    users,
    currentUser,
    balance: currentUser?.balance ?? 0,
    transactions: currentUser?.role === 'admin' ? allTransactions.sort((a,b) => b.timestamp - a.timestamp) : (currentUser?.transactions ?? []),
    addUser,
    addTokens, 
    addTokensToUser,
    spendTokens, 
    spendTokensFromUser,
    getSpendingHabits,
    switchUser,
    logout,
    deleteUser,
    editUser
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
