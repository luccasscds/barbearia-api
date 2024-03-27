import { connectionToDatabase } from "./createConnection";
import { z } from "zod";
import { handleZod } from "../tools/handleZod";
import { ResultSet } from "@libsql/client/.";

export const serviceDB = {
    async getAll(codCompany: number) {
        try {
            const codCompanySchema = handleZod.number('CodCompany');
            codCompanySchema.parse(codCompany);

            const sql = `SELECT 
                            codService, nameService, price, durationMin, active, identificationColor
                        FROM Service
                        WHERE codCompany = ?;`;
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
                            codService, nameService, price, durationMin
                        FROM Service WHERE active = true
                        AND codCompany = ?;`;
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
            const sql = `select 
                            codService, nameService, price, durationMin, active
                        from Service
                        where codService in( ${codServices.replace(/\s/g, '')} )
                        AND codCompany = ${codCompany};`;
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
            });
            newServiceSchema.parse(newService);

            const { nameService, price, durationMin, active, identificationColor, codService, codCompany } = newService;
            const sql = `UPDATE Service SET
                            nameService = ?,
                            price = ?,
                            durationMin = ?,
                            active = ?,
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
            });
            newServiceSchema.parse(newService);

            const { nameService, price, durationMin, active, identificationColor, codCompany } = newService;
            const sql = `INSERT INTO Service (nameService, price, durationMin, active, identificationColor, codCompany) VALUES 
                        (?, ?, ?, ?, ?, ?);`;
            const result = await connectionToDatabase(sql, [nameService, price, durationMin, (active ?? true), identificationColor, codCompany] );

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
}

export interface IParamsUpdateService {
    codService: number,
    nameService: string,
    price: number,
    durationMin: number,
    active: boolean,
    identificationColor?: string,
    codCompany: number,
}

interface IParamsGetsService {
    codServices: string,
    codCompany: number,
};

interface IParamsDeleteService {
    codService: number,
    codCompany: number,
}