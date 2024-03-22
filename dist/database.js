// database.ts
// This file will contain the logic for opening and upgrading the IndexedDB database.
import { getStores, batchOperation } from "./indexedDBUtils";
/**
 * Populates databases with generated data.
 * @param generators An array of DataFactory objects used to generate data and specify where to add it.
 * @param genCt The number of items to generate.
 */
export const populateDbs = async (generators, genCt, batchSize = 100 // Define preferred batch size
) => {
    // For each generator
    for (let generator of generators) {
        let batch = []; // Temporary store for the current batch
        // Loop genCt times
        for (let i = 0; i < genCt; i++) {
            // Generate a new item and add it to the batch
            const newItem = generator.generate();
            batch.push(newItem);
            // Once the batch size is reached or it's the last item, process the batch
            if (batch.length === batchSize || i === genCt - 1) {
                await batchOperation(generator.dbName, generator.storeName, batch, (store, item) => store.add(item) // Assuming batchOperation is for add operations
                );
                batch = []; // Reset the batch
            }
        }
    }
};
// Open or upgrade an IndexedDB database
export const openDatabase = (dbName, version = 1) => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);
        request.onupgradeneeded = event => {
            const db = request.result;
            getStores().forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    const objectStore = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                    objectStore.createIndex('by_createdDate', 'createdDate', { unique: false });
                    objectStore.createIndex('by_Name', 'name', { unique: false });
                }
            });
        };
        request.onsuccess = event => resolve(request.result);
        request.onerror = event => reject(request.error);
    });
};
