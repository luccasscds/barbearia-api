import { createConnection } from "./createConnection";
import { IResponseDB } from "../routes/controllers/types";
import { z } from "zod";
import { handleZod } from "../tools/handleZod";

export const serviceDB = {
    async getAll(codCompany: number) {
        try {
            const codCompanySchema = z.number(handleZod.params('CodCompany', 'número'));
            codCompanySchema.parse(codCompany);

            const db = await createConnection();
            const sql = `SELECT 
                            codService, nameService, price, durationMin, active, identificationColor
                        FROM Service
                        WHERE codCompany = ?;`;
            const [result] = await db.query(sql, [codCompany]);
    
            db.end();
            return result;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error;
        }
    },
    async getAllActive(codCompany: number) {
        try {
            const codCompanySchema = z.number(handleZod.params('CodCompany', 'número'));
            codCompanySchema.parse(codCompany);

            const db = await createConnection();
            const sql = `SELECT 
                            codService, nameService, price, durationMin
                        FROM Service WHERE active = true
                        AND codCompany = ?;`;
            const [result] = await db.query(sql, [codCompany]);
    
            db.end();
            return result;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error;
        }
    },
    async get(newService: IParamsGetsService) {
        try {
            const newServiceSchema = z.object({
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
                codServices: z.string(handleZod.params('CodServices', 'texto')),
            });
            newServiceSchema.parse(newService);

            const { codCompany, codServices } = newService;
            const db = await createConnection();
            const sql = `select 
                            codService, nameService, price, durationMin, active
                        from Service
                        where codService in( ${codServices.replace(/\s/g, '')} )
                        AND codCompany = ${codCompany};`;
            const [result] = await db.query(sql);
    
            db.end();
            return result;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error;
        }
    },
    async update(newService: IParamsUpdateService): Promise<IResponseDB> {
        try {
            const newServiceSchema = z.object({
                codService: z.number(handleZod.params('CodService', 'número')),
                nameService: z.string(handleZod.params('Nome de serviço', 'texto')).min(2, 'O campo Nome Serviço deve conter pelo menos 2 caractere(s)'),
                price: z.number(handleZod.params('Preço', 'número')),
                durationMin: z.number(handleZod.params('Duração em min', 'número')),
                active: z.boolean(handleZod.params('Ativo', 'boolean')),
                identificationColor: z.string(handleZod.params('Código da cor', 'texto')).nullable(),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            newServiceSchema.parse(newService);

            const { nameService, price, durationMin, active, identificationColor, codService, codCompany } = newService;
            const db = await createConnection();
            const sql = `UPDATE Service SET
                            nameService = ?,
                            price = ?,
                            durationMin = ?,
                            active = ?,
                            identificationColor = ?
                        WHERE codService = ?
                        AND codCompany = ?`;
            const [result] = await db.query(sql, [nameService, price, durationMin, active, identificationColor, codService, codCompany]);
    
            if((result as any).affectedRows === 0) {
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
    async create(newService: IParamsNewService): Promise<IResponseDB> {
        try {
            const newServiceSchema = z.object({
                nameService: z.string(handleZod.params('Nome de serviço', 'texto')).min(2, 'O campo Nome Serviço deve conter pelo menos 2 caractere(s)'),
                price: z.number(handleZod.params('Preço', 'número')),
                durationMin: z.number(handleZod.params('Duração em min', 'número')),
                active: z.boolean(handleZod.params('Ativo', 'boolean')).optional(),
                identificationColor: z.string(handleZod.params('Código da cor', 'texto')).nullable(),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            newServiceSchema.parse(newService);

            const { nameService, price, durationMin, active, identificationColor, codCompany } = newService;
            const db = await createConnection();
            const sql = `INSERT INTO Service (nameService, price, durationMin, active, identificationColor, codCompany) VALUES 
                        (?, ?, ?, ?, ?, ?);`;
            const [result] = await db.query(sql, [nameService, price, durationMin, (active ?? true), identificationColor, codCompany]);
    
            if((result as any).affectedRows === 0) {
                throw 'Houve algo erro, nenhum resultado(s) inserido(s)';
            };

            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        };
    },
    async delete(newService: IParamsDeleteService): Promise<IResponseDB> {
        try {
            const newServiceSchema = z.object({
                codService: z.number(handleZod.params('CodService', 'número')),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            newServiceSchema.parse(newService);

            const { codService, codCompany } = newService;
            const db = await createConnection();
            const sql = `DELETE FROM Service 
                        WHERE codService = ?
                        AND codCompany = ?;`;
            const [result] = await db.query(sql, [codService, codCompany]);
            
            if((result as any).affectedRows === 0) {
                throw 'Houve algo erro, nenhum resultado(s) inserido(s)';
            };
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
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