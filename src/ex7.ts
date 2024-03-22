export interface Book {
    id?: number;
    title: string;
    author: string;
    createdDate: Date;
}

export interface User {
    id?: number;
    name: string;
    email: string;
    createdDate: Date;
}
export interface ServerResponse {
    success: boolean;
    message: string;
}


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


// Mock function simulating sending data to a server
export function syncDataWithServer<T>(data: T[]): Promise<ServerResponse> {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Data sent to server: ${JSON.stringify(data)}`);
            resolve({ success: true, message: "Data synchronized successfully." });
        }, 1000); // Simulate network delay
    });
}

// * function that fetches all unsynchronized items from IndexedDB, sends them to the server using the mock function, and then marks them as synchronized in the local database upon successful server response.
export async function synchronizeLocalData(dbName: string, storeName: string): Promise<void> {
    const db = await openDatabase('books');
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const unsyncedItemsRequest = store.index('by_synchronized').getAll(IDBKeyRange.only(false));

    unsyncedItemsRequest.onsuccess = async () => {
        const unsyncedItems = unsyncedItemsRequest.result;
        if (unsyncedItems.length === 0) {
            console.log("No items need syncing.");
            return;
        }

        try {
            const response = await syncDataWithServer(unsyncedItems);
            if (response.success) {
                const markSyncedTransaction = db.transaction(storeName, 'readwrite');
                const markSyncedStore = markSyncedTransaction.objectStore(storeName);
                unsyncedItems.forEach(item => {
                    item.synchronized = true;
                    markSyncedStore.put(item);
                });
                console.log(response.message);
            } else {
                console.error("Failed to sync data with server.");
            }
        } catch (error) {
            console.error("An error occurred during sync:", error);
        }
    };
}

export const main = async (): Promise<void> => {
    try {
        populateStores(['books', 'users']);

        const newUser: User = { name: 'Jane Doe', email: 'jane.doe@example.com', createdDate: new Date() };
        const newBook: Book = { title: 'To Kill a Mockingbird', author: 'Harper Lee', createdDate: new Date() };

        await addUserAndBookConcurrently(newUser, newBook);
        console.log('User and book added concurrently.');

        // Demonstrate getting items in a date range
        const startDate = new Date('2024-03-01');
        const endDate = new Date('2024-03-31');
        const booksInRange = await getItemsPublishedInRange<Book>('itemsDB', 'books', startDate, endDate);
        console.log('Books published in March 2024:', booksInRange);

        synchronizeLocalData('itemsDB', 'users')
            .catch((error) => console.error('Failed to synchronize data:', error));


    } catch (error) {
        console.error('An error occurred:', error);
    }
};

document.getElementById('AddButton')?.addEventListener('click', () => main());
