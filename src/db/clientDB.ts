import { IResponseDB } from '../routes/controllers/types';
import { createConnection } from './createConnection';

export const clientDB = {
    async getAll(): Promise<IResponseClient[]> {
        try {
            const db = await createConnection();
            const sql = `select codClient, nameClient, emailClient from Client;`
            const [result] = await db.query(sql);
    
            db.end();
            return result as any;
        } catch (error) {
            return error as any;
        }
    },

    async get(id: number) {
        try {
            const db = await createConnection();
            const sql = `   select codClient, nameClient, emailClient 
                            from Client where codClient = ?;`
            const [result] = await db.query(sql, [id]);
    
            db.end();
            return result;
        } catch (error) {
            return error;
        }
    },
    
    async new(name: string, email: string, password?: string): Promise<IResponseDB> {
        const db = await createConnection();
        
        try {
            const sql = `INSERT INTO Client (nameClient, emailClient, passwordClient) VALUES (?, ?, ?);`
            const [result] = await db.query(sql, [name, email, password]);
        
            db.commit();
            return result as any;
        } catch (error) {
            db.rollback();
            return error as any;
        } finally {
            db.end();
        }
    },
    
    async update(id: number, name: string, email: string): Promise<IResponseDB> {
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
    },
    
    async delete(id: number): Promise<IResponseDB> {
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
    },
}

interface IResponseClient {
    codClient: number,
    nameClient: string,
    emailClient: string,
}