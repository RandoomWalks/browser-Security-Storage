// This file will contain the logic for opening and upgrading the IndexedDB database.
import { getStores } from "./indexedDBUtils";



// database.ts

// Open or upgrade an IndexedDB database
export const openDatabase = (dbName: string, version = 1): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);

        request.onupgradeneeded = event => {
            const db = request.result;

            getStores().forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    const objectStore = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                    objectStore.createIndex('by_createdDate', 'createdDate', { unique: false });
                }
            });
        };

        request.onsuccess = event => resolve(request.result);
        request.onerror = event => reject(request.error);
    });
};