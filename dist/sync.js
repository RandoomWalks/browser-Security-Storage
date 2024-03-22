import { openDatabase } from "./database";
// Mock function simulating sending data to a server
export function syncDataWithServer(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Data sent to server: ${JSON.stringify(data)}`);
            resolve({ success: true, message: "Data synchronized successfully." });
        }, 1000); // Simulate network delay
    });
}
// * function that fetches all unsynchronized items from IndexedDB, sends them to the server using the mock function, and then marks them as synchronized in the local database upon successful server response.
export async function synchronizeLocalData(dbName, storeName) {
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
            }
            else {
                console.error("Failed to sync data with server.");
            }
        }
        catch (error) {
            console.error("An error occurred during sync:", error);
        }
    };
}
