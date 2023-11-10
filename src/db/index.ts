import mysql from 'mysql2/promise';
import { IResponseDB } from '../routes/controllers/types';

async function createConnection(): Promise<mysql.Connection> {
    if (!process.env.DATABASE_URL) {
        console.error('não está configurado a variável DATABASE_URL.');
        // @ts-ignore
        return;
    };

    return await mysql.createConnection(process.env.DATABASE_URL!);
};

export async function getClient(id: number) {
    try {
        const db = await createConnection();
        const sql = `   select codClient, nameClient, emailClient 
                        from Client where codClient = ?;`
        const [result] = await db.query(sql, [id]);

        db.end();
        return result;
    } catch (error) {
        return error;
    } finally {
    }
};

export async function newClient(name: string, email: string): Promise<IResponseDB> {
    const db = await createConnection();
    
    try {
        const sql = `INSERT INTO Client (nameClient, emailClient) VALUES (?, ?);`
        const [result] = await db.query(sql, [name, email]);
    
        db.commit();
        return result as any;
    } catch (error) {
        db.rollback();
        return error as any;
    } finally {
        db.end();
    }
};

export async function updateClient(id: number, name: string, email: string): Promise<IResponseDB> {
    const db = await createConnection();
    
    try {
        const sql = `   UPDATE Client SET 
                        nameClient = ?,
                        emailClient = ?
                        WHERE codClient = ?;`
        const [result] = await db.query(sql, [name, email, id]);
    
        db.commit();
        return result as any;
    } catch (error) {
        db.rollback();
        return error as any;
    } finally {
        db.end();
    };
};

export async function deleteClient(id: number): Promise<IResponseDB> {
    const db = await createConnection();
    
    try {
        const sql = `DELETE FROM Client WHERE codClient = ?;`
        const [result] = await db.query(sql, [id]);
    
        db.commit();
        return result as any;
    } catch (error) {
        db.rollback();
        return error as any;
    } finally {
        db.end();
    };
};