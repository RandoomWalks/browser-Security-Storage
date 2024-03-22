// indexedDBUtils.ts
import { openDatabase } from "./database";
import { User, Book } from './models';
const existingStoresSet = new Set<string>();

export const populateStores = (storesList: string[]): void => {
    storesList.forEach(name => existingStoresSet.add(name));
};

export const getStores = (): string[] => {
    return [...existingStoresSet];
};

export const storeExists = (storeName: string): boolean => {
    return existingStoresSet.has(storeName);
};

export const addItems = async <T>(dbName: string, storeName: string, items: T[]): Promise<void> => {
    const db = await openDatabase(dbName);
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    items.forEach(item => store.add(item));

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export const addUserAndBookConcurrently = async (newUser: User, newBook: Book): Promise<void> => {
    const pCreateBook = addItems('itemsDB', 'books', [newBook]);
    const pCreateUser = addItems('itemsDB', 'users', [newUser]);

    const results = await Promise.allSettled([pCreateUser, pCreateBook]);

    results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            console.log(`Operation ${i + 1} succeeded with message: ${result.value}`);
        } else {
            console.error(`Operation ${i + 1} failed with reason: ${result.reason}`);
        }
    });
};

export const getItemsPublishedInRange = async <T>(dbName: string, storeName: string, startDate: Date, endDate: Date): Promise<T[]> => {
    const db = await openDatabase(dbName);
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index('by_createdDate');
    const dateRange = IDBKeyRange.bound(startDate, endDate);

    return new Promise((resolve, reject) => {
        const request = index.getAll(dateRange);
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
    });
};
