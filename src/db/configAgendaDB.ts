import { IErrorSQL, IResponseDB } from '../routes/controllers/types';
import { createConnection } from './createConnection';

export const configAgendaDB = {
    async getAll(): Promise<IResponse[] | IErrorSQL> {
        try {
            const db = await createConnection();
            const sql = `select keyConfig, valueConfig from ConfigSchedule;`
            const [result] = await db.query(sql);
    
            db.end();
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
    async get(keys: string): Promise<IResponse[] | IErrorSQL> {
        try {
            const db = await createConnection();
            const sql = `select keyConfig, valueConfig from ConfigSchedule
                        where keyConfig in(${keys});`
            const [result] = await db.query(sql);
    
            db.end();
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
    async update(keyConfig: string, valueConfig: string): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `   UPDATE ConfigSchedule SET 
                            valueConfig = ?
                            WHERE keyConfig = ?;`
            const [result] = await db.query(sql, [valueConfig, keyConfig]);
        
            db.commit();
            db.end();
            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
}

interface IResponse {
    keyConfig: string,
    valueConfig: string,
}