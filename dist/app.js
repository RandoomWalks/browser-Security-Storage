import { synchronizeLocalData } from "./sync";
import { populateStores, getItemsPublishedInRange, addUserAndBookConcurrently } from "./indexedDBUtils";
// import { addUserAndBookConcurrently } from "./sync"; // Ensure this is defined or adjusted appropriately
export const main = async () => {
    try {
        populateStores(['books', 'users']);
        const newUser = { name: 'Jane Doe', email: 'jane.doe@example.com', createdDate: new Date() };
        const newBook = { title: 'To Kill a Mockingbird', author: 'Harper Lee', createdDate: new Date() };
        await addUserAndBookConcurrently(newUser, newBook);
        console.log('User and book added concurrently.');
        // Demonstrate getting items in a date range
        const startDate = new Date('2024-03-01');
        const endDate = new Date('2024-03-31');
        const booksInRange = await getItemsPublishedInRange('itemsDB', 'books', startDate, endDate);
        console.log('Books published in March 2024:', booksInRange);
        synchronizeLocalData('itemsDB', 'users')
            .catch((error) => console.error('Failed to synchronize data:', error));
    }
    catch (error) {
        console.error('An error occurred:', error);
    }
};
document.getElementById('AddButton')?.addEventListener('click', () => main());
