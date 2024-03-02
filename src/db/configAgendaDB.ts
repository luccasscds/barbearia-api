import { z } from 'zod';
import { IErrorSQL, IResponseDB } from '../routes/controllers/types';
import { createConnection } from './createConnection';
import { ResultSetHeader } from 'mysql2';

export const configAgendaDB = {
    async getAll(): Promise<IResponse[] | IErrorSQL> {
        try {
            const db = await createConnection();
            const sql = `select keyConfig, valueConfig from ConfigSchedule;`
            const [result] = await db.query(sql);
    
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },
    async get(keys: string): Promise<IResponse[] | IErrorSQL> {
        try {
            const newValue = keys.replace(/\s/g, '').split(',').map((key) => `"${key}"`).join(',');
            
            const keysSchema = z.string();
            keysSchema.parse(newValue);

            const db = await createConnection();
            const sql = `select keyConfig, valueConfig from ConfigSchedule
                        where keyConfig in(${newValue});`
            const [result] = await db.query(sql);
    
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },
    async update(newConfig: IParamsUpdate): Promise<IResponseDB> {
        try {
            const { keyConfig, valueConfig } = newConfig;
            const newConfigSchema = z.object({
                keyConfig: z.string(),
                valueConfig: z.string(),
            });
            newConfigSchema.parse(newConfig);

            const db = await createConnection();
            const sql = `   UPDATE ConfigSchedule SET 
                            valueConfig = ?
                            WHERE keyConfig = ?;`
            const [result] = await db.query(sql, [valueConfig, keyConfig]);
        
            if((result as ResultSetHeader).affectedRows === 0) {
                throw 'Houve algo erro, nenhum resultado(s) inserido(s)';
            };

            db.commit();
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        };
    },
}

interface IResponse {
    keyConfig: string,
    valueConfig: string,
}

interface IParamsUpdate {
    keyConfig: string,
    valueConfig: string
}