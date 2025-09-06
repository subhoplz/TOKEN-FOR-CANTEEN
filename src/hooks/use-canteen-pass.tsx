
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
  getDoc
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useOnlineStatus } from './use-online-status';

interface CanteenPassContextType {
  loading: boolean;
  users: User[];
  currentUser: User | null;
  balance: number;
  transactions: Transaction[];
  pendingSyncCount: number;
  addUser: (name: string, employeeId: string, role?: User['role'], password?: string) => void;
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
    { employeeId: 'V00001', name: 'Canteen Vendor', password: 'password', balance: 0, transactions: [], role: 'vendor', lastUpdated: Date.now() },
];


export function useCanteenPassState() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const { toast } = useToast();
  const seedingRef = useRef(false);
  const isOnline = useOnlineStatus();

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

  const getLocalUsers = () => {
    const localData = localStorage.getItem('canteen-users');
    return localData ? JSON.parse(localData) : [];
  };

  const syncOfflineTransactions = useCallback(async () => {
    if (!isOnline) return;

    const allUsers: User[] = getLocalUsers();
    let updated = false;

    const syncPromises = allUsers.map(async (user) => {
        const unsyncedTxs = user.transactions.filter(tx => !tx.synced);
        if (unsyncedTxs.length > 0) {
            updated = true;
            try {
                const userDocRef = doc(db, 'users', user.id);
                // We don't just update, we fetch the latest state from DB to merge
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const serverUser = docSnap.data() as User;
                    const serverTxIds = new Set(serverUser.transactions.map(t => t.id));
                    
                    const newTransactions = unsyncedTxs.filter(tx => !serverTxIds.has(tx.id));
                    if (newTransactions.length > 0) {
                       const batch = writeBatch(db);
                       const updatedTransactions = [...newTransactions, ...serverUser.transactions]
                         .sort((a, b) => b.timestamp - a.timestamp)
                         .map(tx => ({...tx, synced: true}));
                       
                       const finalBalance = updatedTransactions.reduce((acc, tx) => {
                           return acc + (tx.type === 'credit' ? tx.amount : -tx.amount);
                       }, 0); // Recalculate balance from transactions for consistency. Assuming 0 initial.
                       // A real app would have a base balance to add to. For now this is ok.
                       // Let's stick to the simpler approach of just updating from current balance.
                       
                       let calculatedBalance = serverUser.balance;
                       newTransactions.forEach(tx => {
                           if(tx.type === 'debit') calculatedBalance -= tx.amount;
                           else calculatedBalance += tx.amount;
                       });


                       batch.update(userDocRef, {
                           transactions: updatedTransactions,
                           balance: calculatedBalance,
                           lastUpdated: Date.now()
                       });
                       await batch.commit();
                    }
                }
            } catch (e) {
                console.error("Failed to sync transactions for user:", user.id, e);
                updated = false; // Don't show sync success if any fail
            }
        }
    });

    await Promise.all(syncPromises);

    if (updated) {
        toast({
            title: "Data Synced",
            description: "All offline transactions have been successfully saved to the server."
        });
    }
  }, [isOnline, toast]);

  useEffect(() => {
    if (isOnline) {
      syncOfflineTransactions();
    }
  }, [isOnline, syncOfflineTransactions]);


  // Seed database if it's empty
  useEffect(() => {
    const seedDatabase = async () => {
        if (seedingRef.current) return;
        seedingRef.current = true;
        
        try {
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
        } catch (e) {
            console.error("Could not connect to Firestore to seed the database.", e);
        }
    };
    seedDatabase();
  }, []);

  // Listen for real-time updates to the users collection
  useEffect(() => {
    setLoading(true);
    const usersCollection = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
        const usersData: User[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), transactions: (doc.data().transactions || []).map((t: Transaction) => ({...t, synced: true})) } as User));
        setUsers(usersData);
        localStorage.setItem('canteen-users', JSON.stringify(usersData));

        if (currentUser) {
            const updatedCurrentUser = usersData.find(u => u.id === currentUser.id);
            if (updatedCurrentUser) {
                setCurrentUser(updatedCurrentUser);
            } else {
                logout();
            }
        }
        setLoading(false);
    }, (error) => {
        console.warn("Firestore snapshot error:", error);
        toast({ 
            title: "You are offline", 
            description: "The application is running on locally saved data.",
        });
        setUsers(getLocalUsers());
        setLoading(false);
    });

    const storedCurrentUserId = localStorage.getItem('canteen-current-user-id');
    if (storedCurrentUserId) {
        const localUsers = getLocalUsers();
        const localUser = localUsers.find((u:User) => u.id === JSON.parse(storedCurrentUserId));
        if (localUser) setCurrentUser(localUser);
    }

    return () => unsubscribe();
  }, [toast]);
  
  useEffect(() => {
      const allLocalUsers: User[] = getLocalUsers();
      const count = allLocalUsers.reduce((acc, user) => {
          return acc + user.transactions.filter(tx => !tx.synced).length;
      }, 0);
      setPendingSyncCount(count);
  }, [users]);


  const addUser = useCallback(async (name: string, employeeId: string, role: User['role'] = 'user', password?: string) => {
    try {
        const usersCollection = collection(db, 'users');
        await addDoc(usersCollection, {
            employeeId,
            name,
            password: password || 'password',
            balance: 0,
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
        toast({ title: "Error", description: "Failed to add user. Check your connection.", variant: "destructive" });
    }
  }, [toast]);

  const switchUser = useCallback((userId: string, password?: string) => {
    const userToSwitch = users.find(u => u.id === userId);
    if(userToSwitch) {
      if (userToSwitch.role === 'user' && userToSwitch.password && userToSwitch.password !== password) {
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

    const newTransaction: Transaction = {
        id: uuidv4(),
        type: 'credit',
        amount,
        description: 'Self-assigned tokens',
        timestamp: Date.now(),
        synced: isOnline,
    };
    
    // Optimistic UI update
    const updatedUser = {
        ...currentUser,
        balance: currentUser.balance + amount,
        transactions: [newTransaction, ...currentUser.transactions],
        lastUpdated: Date.now(),
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    try {
        const userDocRef = doc(db, 'users', currentUser.id);
        await updateDoc(userDocRef, {
            balance: updatedUser.balance,
            transactions: updatedUser.transactions.map(t => ({...t, synced: true})),
            lastUpdated: updatedUser.lastUpdated,
        });
        toast({ title: "Success", description: `${amount} tokens added to your account.` });
    } catch (error) {
        console.error("Error adding tokens:", error);
        toast({ title: "Error", description: "Failed to add tokens. It's saved locally.", variant: "destructive" });
    }
  }, [currentUser, toast, isOnline]);

  const addTokensToUser = useCallback(async (userId: string, amount: number) => {
    if (amount <= 0) return;
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;
    
     const newTransaction: Transaction = {
        id: uuidv4(),
        type: 'credit',
        amount,
        description: 'Tokens added by admin',
        timestamp: Date.now(),
        synced: isOnline,
    };

    const updatedUser = {
        ...userToUpdate,
        balance: userToUpdate.balance + amount,
        transactions: [newTransaction, ...userToUpdate.transactions],
        lastUpdated: Date.now()
    }

    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    
    try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            balance: updatedUser.balance,
            transactions: updatedUser.transactions.map(t => ({...t, synced: true})),
            lastUpdated: updatedUser.lastUpdated,
        });
        toast({ title: 'Success', description: `${amount} tokens added to ${userToUpdate.name}'s account.` });
    } catch (error) {
        console.error("Error adding tokens to user:", error);
        toast({ title: "Error", description: `Failed to add tokens to ${userToUpdate.name}. It's saved locally.`, variant: "destructive" });
    }
  }, [users, toast, isOnline]);


  const spendTokens = useCallback(async (amount: number, description: string) => {
    if (!currentUser) return { success: false, data: "No active user." };
    if (amount <= 0) return { success: false, data: "Amount must be positive." };
    if (currentUser.balance < amount) return { success: false, data: "Insufficient balance." };

    const newTransaction: Transaction = {
        id: uuidv4(),
        type: 'debit',
        amount,
        description,
        timestamp: Date.now(),
        synced: isOnline,
    };
    
    const newBalance = currentUser.balance - amount;
    const newLastUpdated = Date.now();

    const updatedCurrentUser = {
        ...currentUser,
        balance: newBalance,
        transactions: [newTransaction, ...currentUser.transactions],
        lastUpdated: newLastUpdated
    }
    setCurrentUser(updatedCurrentUser);
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedCurrentUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('canteen-users', JSON.stringify(updatedUsers));
    
    updateDoc(doc(db, 'users', currentUser.id), {
        balance: newBalance,
        transactions: updatedCurrentUser.transactions.map(t => ({...t, synced: true})),
        lastUpdated: newLastUpdated,
    }).catch(err => {
        console.warn("Could not sync transaction to Firestore, will rely on QR.", err);
        toast({ title: "Offline Transaction", description: "Your transaction will be synced later."})
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
  }, [currentUser, users, toast, isOnline]);

  const spendTokensFromUser = useCallback(async (userId: string, amount: number, description: string) => {
    let allUsers = getLocalUsers();
    const userToUpdate = allUsers.find((u:User) => u.id === userId);
    
    if (!userToUpdate) return { success: false, data: "User not found." };
    if (userToUpdate.balance < amount) return { success: false, data: "Insufficient balance." };

    const newTransaction: Transaction = {
        id: uuidv4(),
        type: 'debit',
        amount,
        description,
        timestamp: Date.now(),
        synced: false // Always false initially, will be synced later
    };

    userToUpdate.balance -= amount;
    userToUpdate.transactions.unshift(newTransaction);
    userToUpdate.lastUpdated = Date.now();

    const updatedUsers = allUsers.map((u: User) => u.id === userId ? userToUpdate : u);
    setUsers(updatedUsers);
    localStorage.setItem('canteen-users', JSON.stringify(updatedUsers));

    // After updating local state, attempt to sync.
    syncOfflineTransactions();

    return { success: true, data: "Transaction saved locally" };
  }, [syncOfflineTransactions]);

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
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit && userToEdit.role === 'admin') {
        toast({ title: "Action Forbidden", description: "Admin users cannot be edited.", variant: "destructive" });
        return;
    }
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
  }, [users, toast]);

  const allTransactions = users.flatMap(u => 
      (u.transactions || []).map(t => ({...t, userName: u.name}))
  ).sort((a,b) => b.timestamp - a.timestamp);


  return { 
    loading, 
    users,
    currentUser,
    balance: currentUser?.balance ?? 0,
    transactions: currentUser?.role === 'admin' ? allTransactions : (currentUser?.transactions ?? []),
    pendingSyncCount,
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
