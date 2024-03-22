// models.ts

// since TypeScript interfaces disappear at runtime and cannot directly inform runtime logic. Instead, can define a schema or factory function for each type that knows how to generate a random instance of that type. 

export namespace Utils {
    export function getRandomString(prefix: string): string {
        return `${prefix}_${Math.random().toString(36).substring(7)}`;
    }
}

export namespace Types {

    export interface ServerResponse {
        success: boolean;
        message: string;
    }

    export interface Book {
        id?: number;
        name: string;
        author: string;
        createdDate: Date;
    }

    export interface User {
        id?: number;
        name: string;
        email: string;
        createdDate: Date;
    }
}

export namespace DataFactories {

    function generateBook(): Types.Book {
        return {
            name: Utils.getRandomString('Book'),
            author: Utils.getRandomString('Author'),
            createdDate: new Date(),
        };
    }

    function generateUser(): Types.User {
        return {
            name: Utils.getRandomString('User'),
            email: `${Utils.getRandomString('email')}@example.com`,
            createdDate: new Date(),
        };
    }

    export interface IDataFactory {
        dbName: string;
        storeName: string;
        generate: () => any;
    }

    export const bookFactory: IDataFactory = {
        dbName: 'itemsDB',
        storeName: 'books',
        generate: () => ({
            name: `Book_${Math.random().toString(36).substring(7)}`,
            author: `Author_${Math.random().toString(36).substring(7)}`,
            createdDate: new Date(),
        }),
    };

    export const userFactory: IDataFactory = {
        dbName: 'itemsDB',
        storeName: 'users',
        generate: () => ({
            name: `User_${Math.random().toString(36).substring(7)}`,
            email: `${Math.random().toString(36).substring(7)}@example.com`,
            createdDate: new Date(),
        }),
    };

    export const getFactories = (): IDataFactory[] => {
        return [bookFactory, userFactory];
    }
}