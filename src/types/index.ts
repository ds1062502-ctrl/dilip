export enum TransactionType {
  CREDIT = 'CREDIT',
  PAYMENT = 'PAYMENT'
}

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  createdAt: number;
}

export interface Transaction {
  id?: number;
  customerId: number;
  amount: number;
  type: TransactionType;
  note?: string;
  date: number;
}

export interface CustomerWithBalance extends Customer {
  totalCredit: number;
  totalPayment: number;
  balance: number;
}
