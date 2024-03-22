// database.ts
// This file will contain the logic for opening and upgrading the IndexedDB database.
import { getStores } from "./indexedDBUtils";
import { addItems } from "./indexedDBUtils";
/**
 * Populates databases with generated data.
 * @param generators An array of DataFactory objects used to generate data and specify where to add it.
 * @param genCt The number of items to generate.
 */
export const populateDbs = async (generators, genCt) => {
    // Loop genCt times
    for (let i = 0; i < genCt; i++) {
        // For each generator
        for (let generator of generators) {
            // Generate a new item
            const newItem = generator.generate();
            // Add the new item to the database and store specified by the generator
            await addItems(generator.dbName, generator.storeName, [newItem]);
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
