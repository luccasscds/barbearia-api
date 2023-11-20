import mysql from 'mysql2/promise';

export async function createConnection(): Promise<mysql.Connection> {
    if (!process.env.DATABASE_URL) {
        console.error('não está configurado a variável DATABASE_URL.');
        // @ts-ignore
        return;
    };

    return await mysql.createConnection(process.env.DATABASE_URL!);
};