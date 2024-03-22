// app.ts
import { synchronizeLocalData, performIncrementalSync } from "./sync";
import { populateStores, getItemsPublishedInRange, addUserAndBookConcurrently } from "./indexedDBUtils";
import { DataFactories } from "./models";
import { populateDbs } from './database';
export const main = async () => {
    try {
        populateStores(['books', 'users']);
        const newUser = { name: 'Jane Doe', email: 'jane.doe@example.com', createdDate: new Date() };
        const newBook = { name: 'To Kill a Mockingbird', author: 'Harper Lee', createdDate: new Date() };
        await addUserAndBookConcurrently(newUser, newBook);
        console.log('User and book added concurrently.');
        // Demonstrate getting items in a date range
        const startDate = new Date('2024-03-01');
        const endDate = new Date('2024-03-31');
        const booksInRange = await getItemsPublishedInRange('itemsDB', 'books', startDate, endDate);
        console.log('Books published in March 2024:', booksInRange);
        synchronizeLocalData('itemsDB', 'users')
            .catch((error) => console.error('Failed to synchronize data:', error));
        await populateDbs(DataFactories.getFactories(), 500);
        // Assume lastSyncTimestamp is stored and retrieved from somewhere, like localStorage
        const lastSyncTimestamp = Date.now() - 10000; // Example: 10 seconds ago
        performIncrementalSync('itemsDB', 'books', lastSyncTimestamp)
            .then(() => console.log('Incremental sync completed.'))
            .catch((error) => console.error('Incremental sync failed:', error));
    }
    catch (error) {
        console.error('An error occurred:', error);
    }
};
document.getElementById('AddButton')?.addEventListener('click', () => main());
