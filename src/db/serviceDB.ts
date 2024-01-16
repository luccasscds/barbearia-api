import { createConnection } from "./createConnection";
import { IResponseDB } from "../routes/controllers/types";

export const serviceDB = {
    async getAll() {
        try {
            const db = await createConnection();
            const sql = `select 
                            codService, nameService, price, durationMin, active
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
    async update(codService: number, nameService: string, price: number, durationMin: number, active: boolean): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `UPDATE Service SET
                            nameService = ?,
                            price = ?,
                            durationMin = ?,
                            active = ?
                        WHERE codService = ?`;
            const [result] = await db.query(sql, [nameService, price, durationMin, active, codService]);
    
            db.commit();
            db.end();
            return result as any;
        } catch (error) {
           return error as any;
        };
    },
    async create(nameService: string, price: number, durationMin: number): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `INSERT INTO Service (nameService, price, durationMin, active) VALUES 
                        (?, ?, ?, true);`;
            const [result] = await db.query(sql, [nameService, price, durationMin]);
    
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