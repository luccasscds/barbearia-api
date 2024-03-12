import { z } from 'zod';
import { IErrorSQL, IResponseDB } from '../routes/controllers/types';
import { createConnection } from './createConnection';
import { ResultSetHeader } from 'mysql2';
import { handleZod } from '../tools/handleZod';

export const configAgendaDB = {
    async getAll(codCompany: number): Promise<IResponse[] | IErrorSQL> {
        try {
            const codCompanySchema = z.number(handleZod.params('CodCompany', 'número'));
            codCompanySchema.parse(codCompany);

            const db = await createConnection();
            const sql = `SELECT keyConfig, valueConfig 
                        FROM ConfigSchedule
                        WHERE codCompany = ?;`
            const [result] = await db.query(sql, [codCompany]);
    
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },
    async get(newConfigAgenda: IParamsGetConfigAgenda): Promise<IResponse[] | IErrorSQL> {
        try {
            const { codCompany, keys } = newConfigAgenda;
            const newEventSchema = z.object({
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
                keys: z.string(handleZod.params('Keys', 'array de texto')).array(),
            });
            newEventSchema.parse(newConfigAgenda);

            const newValue = keys.map((key) => `"${key}"`).join(',');

            const db = await createConnection();
            const sql = `select keyConfig, valueConfig from ConfigSchedule
                        WHERE keyConfig in(${newValue})
                        AND codCompany = ${codCompany};`
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
            const { keyConfig, valueConfig, codCompany } = newConfig;
            const newConfigSchema = z.object({
                keyConfig: z.string(handleZod.params('KeyConfig', 'texto')),
                valueConfig: z.string(handleZod.params('ValueConfig', 'texto')),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            newConfigSchema.parse(newConfig);

            const db = await createConnection();
            const sql = `   UPDATE ConfigSchedule SET 
                            valueConfig = ?
                            WHERE keyConfig = ?
                            AND codCompany = ?;`
            const [result] = await db.query(sql, [valueConfig, keyConfig, codCompany]);
        
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
    valueConfig: string,
    codCompany: number,
}

interface IParamsGetConfigAgenda {
    keys: string[],
    codCompany: number,
}