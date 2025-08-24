export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: number;
}

export interface User {
  id: string;
  employeeId: string;
  name: string;
  balance: number;
  transactions: Transaction[];
  role: 'user' | 'admin';
  lastUpdated: number;
}
