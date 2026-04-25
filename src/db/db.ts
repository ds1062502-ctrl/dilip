import Dexie, { type Table } from 'dexie';
import { Customer, Transaction } from '../types';

export class AppDatabase extends Dexie {
  customers!: Table<Customer>;
  transactions!: Table<Transaction>;

  constructor() {
    super('NammaSantheDatabase');
    this.version(1).stores({
      customers: '++id, name, phone',
      transactions: '++id, customerId, type, date'
    });
  }
}

export const db = new AppDatabase();
