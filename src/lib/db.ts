import Dexie, { type Table } from 'dexie';

export interface QueuedMutation {
  id?: number;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data: unknown;
  timestamp: number;
  retries: number;
}

export interface CachedProduct {
  id: string;
  data: unknown;
  timestamp: number;
}

export class InventoryDB extends Dexie {
  mutationQueue!: Table<QueuedMutation>;
  products!: Table<CachedProduct>;

  constructor() {
    super('InventoryDB');
    this.version(1).stores({
      mutationQueue: '++id, timestamp',
      products: 'id, timestamp',
    });
  }
}

export const db = new InventoryDB();

