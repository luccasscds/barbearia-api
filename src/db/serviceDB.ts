import { createConnection } from "./createConnection";
import { IResponseDB } from "../routes/controllers/types";

export const serviceDB = {
    async getAll() {
        try {
            const db = await createConnection();
            const sql = `select 
                            codService, nameService, price, durationMin, active, identificationColor
                        from Service;`;
            const [result] = await db.query(sql);
    
            db.end();
            return result;
        } catch (error) {
            return error;
        }
    },
    async getAllActive() {
        try {
            const db = await createConnection();
            const sql = `select 
                            codService, nameService, price, durationMin
                        from Service where active = true;`;
            const [result] = await db.query(sql);
    
            db.end();
            return result;
        } catch (error) {
            return error;
        }
    },
    async get(codServices: string) {
        try {
            const db = await createConnection();
            const sql = `select 
                            codService, nameService, price, durationMin, active
                        from Service
                        where codService in( ${codServices.replace(/\s/g, '')} );`;
            const [result] = await db.query(sql);
    
            db.end();
            return result;
        } catch (error) {
            return error;
        }
    },
    async update(newService: IParamsUpdateService): Promise<IResponseDB> {
        try {
            const { nameService, price, durationMin, active, identificationColor, codService } = newService;
            const db = await createConnection();
            const sql = `UPDATE Service SET
                            nameService = ?,
                            price = ?,
                            durationMin = ?,
                            active = ?,
                            identificationColor = ?
                        WHERE codService = ?`;
            const [result] = await db.query(sql, [nameService, price, durationMin, active, identificationColor, codService]);
    
            db.commit();
            db.end();
            return result as any;
        } catch (error) {
           return error as any;
        };
    },
    async create(newService: IParamsNewService): Promise<IResponseDB> {
        try {
            const { nameService, price, durationMin, identificationColor } = newService;
            const db = await createConnection();
            const sql = `INSERT INTO Service (nameService, price, durationMin, active, identificationColor) VALUES 
                        (?, ?, ?, true, ?);`;
            const [result] = await db.query(sql, [nameService, price, durationMin, identificationColor]);
    
            db.end();
            return result as any;
        } catch (error) {
           return error as any;
        };
    },
    async delete(codService: number): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `DELETE FROM Service 
                        WHERE codService = ?;`;
            const [result] = await db.query(sql, [codService]);
    
            db.end();
            return result as any;
        } catch (error) {
           return error as any;
        };
    },
};

export interface IParamsNewService {
    nameService: string,
    price: number,
    durationMin: number,
    identificationColor?: string,
}

export interface IParamsUpdateService {
    codService: number,
    nameService: string,
    price: number,
    durationMin: number,
    active: boolean,
    identificationColor?: string,
}