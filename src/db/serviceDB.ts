import { createConnection } from "./createConnection";
import { IResponseDB } from "../routes/controllers/types";

export const serviceDB = {
    async getAll() {
        try {
            const db = await createConnection();
            const sql = `select 
                            codService, nameService, price, durationMin 
                        from Service;`;
            const [result] = await db.query(sql);
    
            db.end();
            return result;
        } catch (error) {
            return error;
        }
    },
    async update(codService: number, nameService: string, price: number, durationMin: number): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `UPDATE Service SET
                            nameService = ?,
                            price = ?,
                            durationMin = ?
                        WHERE codService = ?`;
            const [result] = await db.query(sql, [nameService, price, durationMin, codService]);
    
            db.end();
            return result as any;
        } catch (error) {
           return error as any;
        };
    },
    async create(nameService: string, price: number, durationMin: number): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `INSERT INTO Service (nameService, price, durationMin) VALUES 
                        (?, ?, ?);`;
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