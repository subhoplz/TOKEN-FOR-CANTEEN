export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  balance: number;
  transactions: Transaction[];
}
