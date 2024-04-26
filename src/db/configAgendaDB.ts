import { z } from 'zod';
import { connectionToDatabase } from './createConnection';
import { handleZod } from '../tools/handleZod';
import { ResultSet } from '@libsql/client/.';

export const configAgendaDB = {
    async getAll(codCompany: number): Promise<IResponse[]> {
        try {
            const codCompanySchema = handleZod.number('CodCompany');
            codCompanySchema.parse(codCompany);

            const sql = `SELECT keyConfig, valueConfig 
                        FROM ConfigSchedule
                        WHERE codCompany = ?;`
            const result = await connectionToDatabase(sql, [codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async get(newConfigAgenda: IParamsGetConfigAgenda): Promise<IResponse[]> {
        try {
            const { codCompany, keys } = newConfigAgenda;
            const newEventSchema = z.object({
                codCompany: handleZod.number('CodCompany'),
                keys: z.string(handleZod.params('Keys', 'array de texto')).array(),
            });
            newEventSchema.parse(newConfigAgenda);

            const newValue = keys.map((key) => `"${key}"`).join(',');

            const sql = `select keyConfig, valueConfig from ConfigSchedule
                        WHERE keyConfig in(${newValue})
                        AND codCompany = ${codCompany};`
            const result = await connectionToDatabase(sql) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async update(newConfig: IParamsUpdate): Promise<ResultSet> {
        try {
            const { keyConfig, valueConfig, codCompany } = newConfig;
            const newConfigSchema = z.object({
                keyConfig: handleZod.string('KeyConfig'),
                valueConfig: handleZod.string('ValueConfig'),
                codCompany: handleZod.number('CodCompany'),
            });
            newConfigSchema.parse(newConfig);

            const sql = `   UPDATE ConfigSchedule SET 
                            valueConfig = ?
                            WHERE keyConfig = ?
                            AND codCompany = ?;`
            const result = await connectionToDatabase(sql, [valueConfig, keyConfig, codCompany] ) as ResultSet;
        
            return result;
        } catch (error) {
            throw error as any;
        };
    },

    async create(codCompany: number) {
        try {
            const codCompanySchema = handleZod.number('CodCompany');
            codCompanySchema.parse(codCompany);

            const sql = `   Insert into ConfigSchedule (codCompany, keyConfig, valueConfig) values 
                            (${codCompany}, 'timeIntervalMin', '15'),
                            (${codCompany}, 'maxDay', '15'),
                            (${codCompany}, 'cancelHoursBefore', '2'),
                            (${codCompany}, 'textCancellationPolicy', 'Caso o cancelamento não seja feito 2h antes, será cobrado 50% do valor do serviço como multa por não comprimento com a as normas do estabelecimento'),
                            (${codCompany}, 'allowCancellation', 'true'),
                            (${codCompany}, 'textToClient', ''),
                            (${codCompany}, 'pixRatePercentage', '50'),
                            (${codCompany}, 'keyPix', ''),
                            (${codCompany}, 'allowSchedulingHolidays', 'false');`;
            const result = await connectionToDatabase(sql, undefined, true) as any;
        
            return result;
        } catch (error) {
            throw error as any;
        };
    }
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