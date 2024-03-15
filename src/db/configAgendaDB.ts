import { z } from 'zod';
import { connectionToDatabase } from './createConnection';
import { handleZod } from '../tools/handleZod';
import { ResultSet } from '@libsql/client/.';

export const configAgendaDB = {
    async getAll(codCompany: number): Promise<IResponse[]> {
        try {
            const codCompanySchema = z.number(handleZod.params('CodCompany', 'número'));
            codCompanySchema.parse(codCompany);

            const sql = `SELECT keyConfig, valueConfig 
                        FROM ConfigSchedule
                        WHERE codCompany = ?;`
            const result = await connectionToDatabase(sql, [codCompany] );
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
    async get(newConfigAgenda: IParamsGetConfigAgenda): Promise<IResponse[]> {
        try {
            const { codCompany, keys } = newConfigAgenda;
            const newEventSchema = z.object({
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
                keys: z.string(handleZod.params('Keys', 'array de texto')).array(),
            });
            newEventSchema.parse(newConfigAgenda);

            const newValue = keys.map((key) => `"${key}"`).join(',');

            const sql = `select keyConfig, valueConfig from ConfigSchedule
                        WHERE keyConfig in(${newValue})
                        AND codCompany = ${codCompany};`
            const result = await connectionToDatabase(sql);
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
    async update(newConfig: IParamsUpdate): Promise<ResultSet> {
        try {
            const { keyConfig, valueConfig, codCompany } = newConfig;
            const newConfigSchema = z.object({
                keyConfig: z.string(handleZod.params('KeyConfig', 'texto')),
                valueConfig: z.string(handleZod.params('ValueConfig', 'texto')),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            newConfigSchema.parse(newConfig);

            const sql = `   UPDATE ConfigSchedule SET 
                            valueConfig = ?
                            WHERE keyConfig = ?
                            AND codCompany = ?;`
            const result = await connectionToDatabase(sql, [valueConfig, keyConfig, codCompany] );
        
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

interface IParamsUpdate {
    keyConfig: string,
    valueConfig: string,
    codCompany: number,
}

interface IParamsGetConfigAgenda {
    keys: string[],
    codCompany: number,
}