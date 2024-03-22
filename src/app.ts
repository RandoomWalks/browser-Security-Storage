// app.ts
import { synchronizeLocalData } from "./sync";
import { populateStores, addItems, getItemsPublishedInRange, addUserAndBookConcurrently } from "./indexedDBUtils";
import { DataFactories, Types } from "./models";
import { populateDbs } from './database';

export const main = async (): Promise<void> => {
    try {
        populateStores(['books', 'users']);

        const newUser: Types.User = { name: 'Jane Doe', email: 'jane.doe@example.com', createdDate: new Date() };
        const newBook: Types.Book = { name: 'To Kill a Mockingbird', author: 'Harper Lee', createdDate: new Date() };

        await addUserAndBookConcurrently(newUser, newBook);
        console.log('User and book added concurrently.');

        // Demonstrate getting items in a date range
        const startDate = new Date('2024-03-01');
        const endDate = new Date('2024-03-31');
        const booksInRange = await getItemsPublishedInRange<Types.Book>('itemsDB', 'books', startDate, endDate);
        console.log('Books published in March 2024:', booksInRange);

        synchronizeLocalData('itemsDB', 'users')
            .catch((error) => console.error('Failed to synchronize data:', error));

        await populateDbs(DataFactories.getFactories(), 50);

        // export const populateDbs = async <T extends { dbName: string; storeName: string; generate: () => any; }>(
        //     generators: T[],
        //     genCt: number
        // ):
        
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

document.getElementById('AddButton')?.addEventListener('click', () => main());
