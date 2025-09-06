export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: number;
  synced?: boolean;
}

export interface User {
  id: string;
  employeeId: string;
  name: string;
  password?: string; // Added for login
  balance: number;
  transactions: Transaction[];
  role: 'user' | 'admin' | 'vendor';
  lastUpdated: number;
}
