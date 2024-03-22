// models.ts
// since TypeScript interfaces disappear at runtime and cannot directly inform runtime logic. Instead, can define a schema or factory function for each type that knows how to generate a random instance of that type. 
export var Utils;
(function (Utils) {
    function getRandomString(prefix) {
        return `${prefix}_${Math.random().toString(36).substring(7)}`;
    }
    Utils.getRandomString = getRandomString;
})(Utils || (Utils = {}));
export var DataFactories;
(function (DataFactories) {
    function generateBook() {
        return {
            name: Utils.getRandomString('Book'),
            author: Utils.getRandomString('Author'),
            createdDate: new Date(),
        };
    }
    function generateUser() {
        return {
            name: Utils.getRandomString('User'),
            email: `${Utils.getRandomString('email')}@example.com`,
            createdDate: new Date(),
        };
    }
    DataFactories.bookFactory = {
        dbName: 'itemsDB',
        storeName: 'books',
        generate: () => ({
            name: `Book_${Math.random().toString(36).substring(7)}`,
            author: `Author_${Math.random().toString(36).substring(7)}`,
            createdDate: new Date(),
        }),
    };
    DataFactories.userFactory = {
        dbName: 'itemsDB',
        storeName: 'users',
        generate: () => ({
            name: `User_${Math.random().toString(36).substring(7)}`,
            email: `${Math.random().toString(36).substring(7)}@example.com`,
            createdDate: new Date(),
        }),
    };
    DataFactories.getFactories = () => {
        return [DataFactories.bookFactory, DataFactories.userFactory];
    };
})(DataFactories || (DataFactories = {}));
