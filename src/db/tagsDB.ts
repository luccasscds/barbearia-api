import { ZodError, z } from 'zod';
import { IErrorSQL, IResponseDB } from '../routes/controllers/types';
import { createConnection } from './createConnection';

export const tagsDB = {
    async getAll(): Promise<IResponseTags[] | IErrorSQL> {
        try {
            const db = await createConnection();
            const sql = `select codStatus, name from Status;
            `
            const [result] = await db.query(sql);
    
            db.end();
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
}

interface IResponseTags {
    codStatus: number,
    name: string,
}