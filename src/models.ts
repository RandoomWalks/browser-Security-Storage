// models.ts
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
