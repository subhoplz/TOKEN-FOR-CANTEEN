
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Transaction, User } from '@/lib/types';
import { useToast } from './use-toast';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  getDocs,
  query,
  where,
  getDoc
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

interface CanteenPassContextType {
  loading: boolean;
  users: User[];
  currentUser: User | null;
  balance: number;
  transactions: Transaction[];
  addUser: (name: string, employeeId: string, role?: 'user' | 'admin', password?: string) => void;
  addTokens: (amount: number) => void;
  addTokensToUser: (userId: string, amount: number) => void;
  spendTokens: (amount: number, description: string) => Promise<{ success: boolean; data: string | null }>;
  spendTokensFromUser: (userId: string, amount: number, description: string) => Promise<{ success: boolean; data: string | null }>;
  getSpendingHabits: () => string;
  switchUser: (userId: string, password?: string) => void;
  logout: () => void;
  deleteUser: (userId: string) => void;
  editUser: (userId: string, name: string, employeeId: string) => void;
}

export const CanteenPassContext = createContext<CanteenPassContextType | undefined>(undefined);

// Sample data to seed the database if it's empty
const initialUsers: Omit<User, 'id'>[] = [
    { employeeId: 'E12345', name: 'Alex Doe', password: 'password', balance: 100, transactions: [], role: 'user', lastUpdated: Date.now() },
    { employeeId: 'E67890', name: 'Jane Doe', password: 'password', balance: 250, transactions: [], role: 'user', lastUpdated: Date.now() },
    { employeeId: 'A00001', name: 'Main Admin', password: 'password', balance: 0, transactions: [], role: 'admin', lastUpdated: Date.now() },
    { employeeId: 'A00002', name: 'Canteen Admin', password: 'password', balance: 0, transactions: [], role: 'admin', lastUpdated: Date.now() },
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

  // Seed database if it's empty
  useEffect(() => {
    const seedDatabase = async () => {
        const usersCollection = collection(db, 'users');
        const snapshot = await getDocs(usersCollection);
        if (snapshot.empty) {
            console.log("Seeding database with initial users...");
            const batch = writeBatch(db);
            initialUsers.forEach(userData => {
                const docRef = doc(usersCollection);
                batch.set(docRef, userData);
            });
            await batch.commit();
        }
    };
    seedDatabase();
  }, []);

  // Listen for real-time updates to the users collection
  useEffect(() => {
    setLoading(true);
    const usersCollection = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);

        // Update current user with fresh data
        if (currentUser) {
            const updatedCurrentUser = usersData.find(u => u.id === currentUser.id);
            if (updatedCurrentUser) {
                setCurrentUser(updatedCurrentUser);
                localStorage.setItem('canteen-current-user-id', JSON.stringify(updatedCurrentUser.id));
            } else {
                // The current user was deleted
                setCurrentUser(null);
                localStorage.removeItem('canteen-current-user-id');
            }
        }
        setLoading(false);
    }, (error) => {
        console.error("Firestore snapshot error:", error);
        toast({ title: "Error", description: "Could not fetch data from the database.", variant: "destructive" });
        setLoading(false);
    });

    // Restore current user from local storage on initial load
    const storedCurrentUserId = localStorage.getItem('canteen-current-user-id');
    if (storedCurrentUserId) {
        const userId = JSON.parse(storedCurrentUserId);
        const userDocRef = doc(db, 'users', userId);
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists()) {
                setCurrentUser({ id: docSnap.id, ...docSnap.data() } as User);
            }
        });
    }


    return () => unsubscribe();
  }, [toast, currentUser?.id]);


  const addUser = useCallback(async (name: string, employeeId: string, role: 'user' | 'admin' = 'user', password?: string) => {
    try {
        const usersCollection = collection(db, 'users');
        await addDoc(usersCollection, {
            employeeId,
            name,
            password: password || 'password', // Default password for simplicity
            balance: role === 'admin' ? 0 : 0,
            transactions: [],
            role: role,
            lastUpdated: Date.now()
        });
        toast({
            title: `${role.charAt(0).toUpperCase() + role.slice(1)} Added`,
            description: `${name} has been added to the system.`,
        });
    } catch (error) {
        console.error("Error adding user:", error);
        toast({ title: "Error", description: "Failed to add user.", variant: "destructive" });
    }
  }, [toast]);

  const switchUser = useCallback((userId: string, password?: string) => {
    const userToSwitch = users.find(u => u.id === userId);
    if(userToSwitch) {
      if (userToSwitch.role !== 'admin' && userToSwitch.password && userToSwitch.password !== password) {
          toast({ title: "Login Failed", description: "The password you entered is incorrect.", variant: "destructive" });
          return;
      }
      setCurrentUser(userToSwitch);
      localStorage.setItem('canteen-current-user-id', JSON.stringify(userToSwitch.id));
      toast({ title: "Login Successful", description: `Welcome, ${userToSwitch.name}.` });
    } else {
        toast({ title: "Login Failed", description: "User not found.", variant: "destructive" });
    }
  }, [users, toast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('canteen-current-user-id');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  }, [toast]);

  const addTokens = useCallback(async (amount: number) => {
    if (!currentUser) return;
    if (amount <= 0) return;

    try {
        const userDocRef = doc(db, 'users', currentUser.id);
        const newTransaction: Transaction = {
            id: uuidv4(),
            type: 'credit',
            amount,
            description: 'Self-assigned tokens',
            timestamp: Date.now(),
        };
        
        await updateDoc(userDocRef, {
            balance: currentUser.balance + amount,
            transactions: [newTransaction, ...currentUser.transactions],
            lastUpdated: Date.now(),
        });
        
        toast({ title: "Success", description: `${amount} tokens added to your account.` });
    } catch (error) {
        console.error("Error adding tokens:", error);
        toast({ title: "Error", description: "Failed to add tokens.", variant: "destructive" });
    }
  }, [currentUser, toast]);

  const addTokensToUser = useCallback(async (userId: string, amount: number) => {
    if (amount <= 0) return;
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;
    
    try {
        const userDocRef = doc(db, 'users', userId);
        const newTransaction: Transaction = {
            id: uuidv4(),
            type: 'credit',
            amount,
            description: 'Tokens added by admin',
            timestamp: Date.now(),
        };

        await updateDoc(userDocRef, {
            balance: userToUpdate.balance + amount,
            transactions: [newTransaction, ...userToUpdate.transactions],
            lastUpdated: Date.now(),
        });

        toast({ title: 'Success', description: `${amount} tokens added to ${userToUpdate.name}'s account.` });
    } catch (error) {
        console.error("Error adding tokens to user:", error);
        toast({ title: "Error", description: `Failed to add tokens to ${userToUpdate.name}.`, variant: "destructive" });
    }
  }, [users, toast]);


  const spendTokens = useCallback(async (amount: number, description: string) => {
    if (!currentUser) return { success: false, data: "No active user." };
    if (amount <= 0) return { success: false, data: "Amount must be positive." };
    if (currentUser.balance < amount) return { success: false, data: "Insufficient balance." };

    try {
        const userDocRef = doc(db, 'users', currentUser.id);
        const newTransaction: Transaction = {
            id: uuidv4(),
            type: 'debit',
            amount,
            description,
            timestamp: Date.now(),
        };
        
        const newBalance = currentUser.balance - amount;
        const newLastUpdated = Date.now();
        
        await updateDoc(userDocRef, {
            balance: newBalance,
            transactions: [newTransaction, ...currentUser.transactions],
            lastUpdated: newLastUpdated,
        });

        const qrPayload = {
            employee_id: currentUser.employeeId,
            timestamp: new Date(newLastUpdated).toISOString(),
        };
        const signature = createSignature(qrPayload);
        
        const qrData = {
            ...qrPayload,
            device_signature: signature,
            name: currentUser.name,
            balance: newBalance,
            transaction: {
                amount: newTransaction.amount,
                description: newTransaction.description
            }
        };

        return { success: true, data: JSON.stringify(qrData, null, 2) };
    } catch (error) {
        console.error("Error spending tokens:", error);
        return { success: false, data: "Failed to process transaction." };
    }
  }, [currentUser]);

  const spendTokensFromUser = useCallback(async (userId: string, amount: number, description: string) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return { success: false, data: "User not found." };
    if (userToUpdate.balance < amount) return { success: false, data: "Insufficient balance." };

    try {
        const userDocRef = doc(db, 'users', userId);
        const newTransaction: Transaction = {
            id: uuidv4(),
            type: 'debit',
            amount,
            description,
            timestamp: Date.now(),
        };

        await updateDoc(userDocRef, {
            balance: userToUpdate.balance - amount,
            transactions: [newTransaction, ...userToUpdate.transactions],
            lastUpdated: Date.now(),
        });
        
        return { success: true, data: "Transaction successful" };
    } catch (error) {
        console.error("Error spending tokens from user:", error);
        return { success: false, data: "Failed to process transaction." };
    }
  }, [users]);

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
  
  const deleteUser = useCallback(async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    if (userToDelete.role === 'admin') {
        toast({ title: "Action Forbidden", description: "Admin users cannot be deleted.", variant: "destructive" });
        return;
    }
    try {
        const userDocRef = doc(db, 'users', userId);
        await deleteDoc(userDocRef);
        toast({ title: "User Deleted", description: `User ${userToDelete.name} has been removed.`});
    } catch (error) {
        console.error("Error deleting user:", error);
        toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    }
  }, [users, toast]);
  
  const editUser = useCallback(async (userId: string, name: string, employeeId: string) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            name,
            employeeId,
            lastUpdated: Date.now(),
        });
        toast({ title: "User Updated", description: "User details have been changed." });
    } catch (error) {
        console.error("Error editing user:", error);
        toast({ title: "Error", description: "Failed to update user details.", variant: "destructive" });
    }
  }, [toast]);

  // Aggregate transactions for admin view
  const allTransactions = users.flatMap(u => 
      u.transactions.map(t => ({...t, userName: u.name}))
  ).sort((a,b) => b.timestamp - a.timestamp);


  return { 
    loading, 
    users,
    currentUser,
    balance: currentUser?.balance ?? 0,
    transactions: currentUser?.role === 'admin' ? allTransactions : (currentUser?.transactions ?? []),
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
