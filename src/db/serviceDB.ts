import { connectionToDatabase, transactionToDatabase } from "./createConnection";
import { z } from "zod";
import { handleZod } from "../tools/handleZod";
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
    async update(newService: IParamsUpdateService): Promise<void> {
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
                codEmployee: handleZod.number('codEmployee'),
            });
            newServiceSchema.parse(newService);

            const { nameService, price, durationMin, active, identificationColor, codService, codCompany, codCategory, codEmployee } = newService;
            await transactionToDatabase(async (transaction) => {
                await transaction.execute({
                    sql: `UPDATE Service SET
                            nameService = ?,
                            price = ?,
                            durationMin = ?,
                            ${lodash.isNumber(codCategory) || lodash.isNull(codCategory) ? `codCategory = ${codCategory},`: ''}
                            ${lodash.isString(identificationColor) ? `identificationColor = '${identificationColor}',`: ''}
                            active = ?
                        WHERE codService = ?
                        AND codCompany = ?`,
                    args: [nameService, price, durationMin, active, codService, codCompany],
                });

                await transaction.execute({
                    sql: `  UPDATE Employee_Service SET
                                accessGranted = ?
                            WHERE codService = ?
                            AND codEmployee = ?;`,
                    args: [active, codService, codEmployee],
                });
            });
        } catch (error) {
            throw error as any;
        };
    },
    async create(newService: IParamsNewService): Promise<void> {
        try {
            const newServiceSchema = z.object({
                nameService: handleZod.string('Nome de serviço', {min: 2}),
                price: handleZod.number('Preço'),
                durationMin: handleZod.number('Duração em min'),
                active: handleZod.boolean('Ativo').optional(),
                identificationColor: handleZod.string('Código da cor').nullable(),
                codCompany: handleZod.number('CodCompany'),
                codCategory: handleZod.number('codCategory').optional().nullable(),
                codEmployee: handleZod.number('codEmployee'),
            });
            newServiceSchema.parse(newService);

            const { nameService, price, durationMin, active, identificationColor, codCompany, codCategory, codEmployee } = newService;

            await transactionToDatabase(async (transaction) => {
                const { lastInsertRowid: codService } = await transaction.execute({
                    sql: `INSERT INTO Service (nameService, price, durationMin, active, identificationColor, codCompany, codCategory) VALUES 
                        (?, ?, ?, ?, ?, ?, ?);`,
                    args: [nameService, price, durationMin, (active ?? true), (identificationColor ?? '#007bff'), codCompany, (codCategory ?? null)],
                });

                if(!codService) throw 'Erro ao criar serviço, sem codService';
                await transaction.execute({
                    sql: `  INSERT INTO Employee_Service (codEmployee, codService, accessGranted)
                            select
                                ${codEmployee} codEmployee,
                                ${codService} codService,
                                true accessGranted
                            where not exists (
                                select 1 from Employee_Service where codEmployee = ${codEmployee} and codService = ${codService}
                            );`,
                    args: [],
                });
            });
        } catch (error) {
            throw error as any;
        };
    },
    async delete(newService: IParamsDeleteService): Promise<void> {
        try {
            const newServiceSchema = z.object({
                codService: handleZod.number('CodService'),
                codCompany: handleZod.number('CodCompany'),
                codEmployee: handleZod.number('CodEmployee'),
            });
            newServiceSchema.parse(newService);

            const { codService, codCompany, codEmployee } = newService;

            await transactionToDatabase(async (transaction) => {
                await transaction.execute({
                    sql: `  DELETE FROM Service
                            WHERE codService = ?
                            AND codCompany = ?;`,
                    args: [codService, codCompany],
                });

                if(!codService) throw 'Erro ao criar serviço, sem codService';
                await transaction.execute({
                    sql: `  DELETE FROM Employee_Service
                            WHERE codEmployee = ?
                            AND codService = ?;`,
                    args: [codEmployee, codService],
                });
            });
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
    codEmployee: number,
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
    codEmployee: number,
}

interface IParamsGetsService {
    codServices: string,
    codCompany: number,
};

interface IParamsDeleteService {
    codService: number,
    codCompany: number,
    codEmployee: number,
}