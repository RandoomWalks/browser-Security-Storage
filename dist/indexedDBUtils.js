// indexedDBUtils.ts
import { openDatabase } from "./database";
const existingStoresSet = new Set();
export const populateStores = (storesList) => {
    storesList.forEach(name => existingStoresSet.add(name));
};
export const getStores = () => {
    return [...existingStoresSet];
};
export const storeExists = (storeName) => {
    return existingStoresSet.has(storeName);
};
export const addItems = async (dbName, storeName, items) => {
    const db = await openDatabase(dbName);
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    items.forEach(item => store.add(item));
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};
export const addUserAndBookConcurrently = async (newUser, newBook) => {
    const pCreateBook = addItems('itemsDB', 'books', [newBook]);
    const pCreateUser = addItems('itemsDB', 'users', [newUser]);
    const results = await Promise.allSettled([pCreateUser, pCreateBook]);
    results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            console.log(`Operation ${i + 1} succeeded with message: ${result.value}`);
        }
        else {
            console.error(`Operation ${i + 1} failed with reason: ${result.reason}`);
        }
    });
};
export const getItemsPublishedInRange = async (dbName, storeName, startDate, endDate) => {
    const db = await openDatabase(dbName);
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index('by_createdDate');
    const dateRange = IDBKeyRange.bound(startDate, endDate);
    return new Promise((resolve, reject) => {
        const request = index.getAll(dateRange);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};
export const searchItemsByName = async (title) => {
    const db = await openDatabase('itemsDB');
    const transaction = db.transaction(['users', 'books']);
    const userStore = transaction.objectStore('users');
    const booksStore = transaction.objectStore('books');
    const userIndex = userStore.index('by_Name');
    const bookIndex = booksStore.index('by_Name');
    // Use a cursor to search for books/users by title. Adjust keyRange for specific search strategies (e.g., prefix search).
    const keyRange = IDBKeyRange.bound(title, title + '\uffff');
    const [users, books] = await Promise.all([
        getAllFromIndex(userIndex, keyRange),
        getAllFromIndex(bookIndex, keyRange)
    ]);
    return [...users, ...books];
};
// Utility function to read all records from an index that match the key range.
const getAllFromIndex = async (index, keyRange) => {
    const request = index.openCursor(keyRange);
    const results = [];
    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                results.push(cursor.value);
                cursor.continue();
            }
            else {
                resolve(results);
            }
        };
        request.onerror = () => reject(request.error);
    });
};
