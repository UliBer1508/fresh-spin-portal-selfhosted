import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Booking } from '@/hooks/useBookings';

interface OfflineDB extends DBSchema {
  bookings: {
    key: string;
    value: Booking;
    indexes: { 'by-date': Date };
  };
  'pending-actions': {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      table: string;
      data: any;
      timestamp: Date;
      retryCount: number;
    };
  };
  'sync-queue': {
    key: string;
    value: {
      id: string;
      endpoint: string;
      method: string;
      body: any;
      timestamp: Date;
      status: 'pending' | 'processing' | 'failed';
    };
  };
}

const DB_NAME = 'teuni-waescheportal';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Bookings store
        if (!db.objectStoreNames.contains('bookings')) {
          const bookingStore = db.createObjectStore('bookings', { keyPath: 'id' });
          bookingStore.createIndex('by-date', 'check_in_date');
        }

        // Pending actions store
        if (!db.objectStoreNames.contains('pending-actions')) {
          db.createObjectStore('pending-actions', { keyPath: 'id' });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// Bookings offline storage
export const saveBookingOffline = async (booking: Booking): Promise<void> => {
  const db = await getDB();
  await db.put('bookings', booking);
};

export const saveBookingsOffline = async (bookings: Booking[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('bookings', 'readwrite');
  await Promise.all([
    ...bookings.map(booking => tx.store.put(booking)),
    tx.done
  ]);
};

export const getOfflineBookings = async (): Promise<Booking[]> => {
  const db = await getDB();
  return db.getAll('bookings');
};

export const getOfflineBooking = async (id: string): Promise<Booking | undefined> => {
  const db = await getDB();
  return db.get('bookings', id);
};

export const deleteOfflineBooking = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('bookings', id);
};

export const clearOfflineBookings = async (): Promise<void> => {
  const db = await getDB();
  await db.clear('bookings');
};

// Pending actions queue
export const queueAction = async (
  action: 'create' | 'update' | 'delete',
  table: string,
  data: any
): Promise<string> => {
  const db = await getDB();
  const id = `${table}_${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.put('pending-actions', {
    id,
    action,
    table,
    data,
    timestamp: new Date(),
    retryCount: 0,
  });

  // Trigger background sync if available
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    // @ts-ignore - Background Sync API is not fully typed
    if ('sync' in registration) {
      // @ts-ignore
      await registration.sync.register('background-sync');
    }
  }

  return id;
};

export const getPendingActions = async () => {
  const db = await getDB();
  return db.getAll('pending-actions');
};

export const deletePendingAction = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('pending-actions', id);
};

export const updatePendingActionRetry = async (id: string): Promise<void> => {
  const db = await getDB();
  const action = await db.get('pending-actions', id);
  if (action) {
    action.retryCount++;
    await db.put('pending-actions', action);
  }
};

export const clearPendingActions = async (): Promise<void> => {
  const db = await getDB();
  await db.clear('pending-actions');
};

// Sync queue management
export const addToSyncQueue = async (
  endpoint: string,
  method: string,
  body: any
): Promise<void> => {
  const db = await getDB();
  const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.put('sync-queue', {
    id,
    endpoint,
    method,
    body,
    timestamp: new Date(),
    status: 'pending',
  });
};

export const getSyncQueue = async () => {
  const db = await getDB();
  return db.getAll('sync-queue');
};

export const updateSyncQueueStatus = async (
  id: string,
  status: 'pending' | 'processing' | 'failed'
): Promise<void> => {
  const db = await getDB();
  const item = await db.get('sync-queue', id);
  if (item) {
    item.status = status;
    await db.put('sync-queue', item);
  }
};

export const deleteSyncQueueItem = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('sync-queue', id);
};

export const clearSyncQueue = async (): Promise<void> => {
  const db = await getDB();
  await db.clear('sync-queue');
};

// Sync offline data with Supabase
export const syncOfflineData = async (): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> => {
  const result = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        // Here you would make the actual API call to Supabase
        // For now, we'll just simulate it
        console.log('[OfflineStorage] Syncing action:', action);
        
        // On success, remove from queue
        await deletePendingAction(action.id);
        result.success++;
      } catch (error) {
        console.error('[OfflineStorage] Failed to sync action:', action, error);
        
        // Update retry count
        await updatePendingActionRetry(action.id);
        result.failed++;
        result.errors.push(`Failed to sync ${action.table} ${action.action}: ${error}`);
      }
    }
  } catch (error) {
    console.error('[OfflineStorage] Error during sync:', error);
    result.errors.push(`Sync error: ${error}`);
  }

  return result;
};

// Get storage statistics
export const getStorageStats = async () => {
  const db = await getDB();
  const [bookings, pendingActions, syncQueue] = await Promise.all([
    db.count('bookings'),
    db.count('pending-actions'),
    db.count('sync-queue'),
  ]);

  return {
    bookings,
    pendingActions,
    syncQueue,
    total: bookings + pendingActions + syncQueue,
  };
};
