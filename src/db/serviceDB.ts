import { connectionToDatabase } from "./createConnection";
import { z } from "zod";
import { handleZod } from "../tools/handleZod";
import { ResultSet } from "@libsql/client/.";
import lodash from 'lodash';

export const serviceDB = {
    async getAll(codCompany: number) {
        try {
            const codCompanySchema = handleZod.number('CodCompany');
            codCompanySchema.parse(codCompany);

            const sql = `SELECT 
                            s.codService, s.nameService, s.price, s.durationMin, s.active, s.identificationColor,
                            s.codCategory, c.nameCategory
                        FROM Service s
                        LEFT JOIN Category c ON c.codCategory = s.codCategory
                        WHERE s.codCompany = ?;`;
            const result = await connectionToDatabase(sql, [codCompany] );
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async getAllActive(codCompany: number) {
        try {
            const codCompanySchema = handleZod.number('CodCompany');
            codCompanySchema.parse(codCompany);

            const sql = `SELECT 
                            s.codService,
                            s.nameService,
                            s.price,
                            s.durationMin,
                            s.active,
                            s.identificationColor,
                            s.codCategory,
                            c.nameCategory,
                            (select GROUP_CONCAT(es.codEmployee) from Employee_Service es where es.codService = s.codService) codEmployees
                        FROM Service s
                        LEFT JOIN Category c ON c.codCategory = s.codCategory
                        WHERE s.active = true
                        AND s.codCompany = ?;`;
            const result = await connectionToDatabase(sql, [codCompany] );
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async get(newService: IParamsGetsService) {
        try {
            const newServiceSchema = z.object({
                codCompany: handleZod.number('CodCompany'),
                codServices: handleZod.string('CodServices'),
            });
            newServiceSchema.parse(newService);

            const { codCompany, codServices } = newService;
            const sql = `SELECT 
                            s.codService, s.nameService, s.price, s.durationMin, s.active, s.identificationColor,
                            s.codCategory, c.nameCategory
                        FROM Service s
                        LEFT JOIN Category c ON c.codCategory = s.codCategory
                        WHERE s.codService in( ${codServices.replace(/\s/g, '')} )
                        AND s.codCompany = ${codCompany};`;
            const result = await connectionToDatabase(sql);
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async update(newService: IParamsUpdateService): Promise<ResultSet> {
        try {
            const newServiceSchema = z.object({
                codService: handleZod.number('CodService'),
                nameService: handleZod.string('Nome de serviço', {min: 2}),
                price: handleZod.number('Preço'),
                durationMin: handleZod.number('Duração em min'),
                active: handleZod.boolean('Ativo'),
                identificationColor: handleZod.string('Código da cor').nullable(),
                codCompany: handleZod.number('CodCompany'),
                codCategory: handleZod.number('codCategory').optional().nullable(),
            });
            newServiceSchema.parse(newService);

            const { nameService, price, durationMin, active, identificationColor, codService, codCompany, codCategory } = newService;
            const sql = `UPDATE Service SET
                            nameService = ?,
                            price = ?,
                            durationMin = ?,
                            active = ?,
                            ${lodash.isNumber(codCategory) || lodash.isNull(codCategory) ? `codCategory = ${codCategory},`: ''}
                            identificationColor = ?
                        WHERE codService = ?
                        AND codCompany = ?`;
            const result = await connectionToDatabase(sql, [nameService, price, durationMin, active, identificationColor, codService, codCompany] );

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
    async create(newService: IParamsNewService): Promise<ResultSet> {
        try {
            const newServiceSchema = z.object({
                nameService: handleZod.string('Nome de serviço', {min: 2}),
                price: handleZod.number('Preço'),
                durationMin: handleZod.number('Duração em min'),
                active: handleZod.boolean('Ativo').optional(),
                identificationColor: handleZod.string('Código da cor').nullable(),
                codCompany: handleZod.number('CodCompany'),
                codCategory: handleZod.number('codCategory').optional().nullable(),
            });
            newServiceSchema.parse(newService);

            const { nameService, price, durationMin, active, identificationColor, codCompany, codCategory } = newService;
            const sql = `INSERT INTO Service (nameService, price, durationMin, active, identificationColor, codCompany, codCategory) VALUES 
                        (?, ?, ?, ?, ?, ?, ?);`;
            const result = await connectionToDatabase(sql, [nameService, price, durationMin, (active ?? true), identificationColor, codCompany, codCategory] );

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
    async delete(newService: IParamsDeleteService): Promise<ResultSet> {
        try {
            const newServiceSchema = z.object({
                codService: handleZod.number('CodService'),
                codCompany: handleZod.number('CodCompany'),
            });
            newServiceSchema.parse(newService);

            const { codService, codCompany } = newService;
            const sql = `DELETE FROM Service 
                        WHERE codService = ?
                        AND codCompany = ?;`;
            const result = await connectionToDatabase(sql, [codService, codCompany] );
            
            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
};

export interface IParamsNewService {
    nameService: string,
    price: number,
    durationMin: number,
    active?: boolean,
    identificationColor?: string,
    codCompany: number,
    codCategory?: number,
}

export interface IParamsUpdateService {
    codService: number,
    nameService: string,
    price: number,
    durationMin: number,
    active: boolean,
    identificationColor?: string,
    codCompany: number,
    codCategory?: number,
}

interface IParamsGetsService {
    codServices: string,
    codCompany: number,
};

interface IParamsDeleteService {
    codService: number,
    codCompany: number,
}