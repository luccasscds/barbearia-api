import mysql from 'mysql2/promise';

export async function createConnection(): Promise<mysql.Connection> {
    if (!process.env.DATABASE_URL) {
        const message = 'não está configurado a variável DATABASE_URL.';
        console.error(message);
        throw message;
    };

    return await mysql.createConnection(process.env.DATABASE_URL!);
};