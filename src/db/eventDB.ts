import { IResponseDB } from "../routes/controllers/types";
import { createConnection } from "./createConnection";

export const eventDB = {
    async getEvent(date: string) {
        try {
            const db = await createConnection();
            const sql = `select 
                            distinct c.nameClient,
                            c.codClient,
                            v.status,
                            v.dateVirtual,
                            v.startTime,
                            v.endTime
                        from VirtualLine v, Client c
                        where v.codClient = c.codClient
                        and v.dateVirtual = ?;`;
            const [result] = await db.query(sql, [date]);
    
            db.end();
            return result;
        } catch (error) {
            return error;
        }
    },
    async getEventByMonth(id: number) {
        try {
            const db = await createConnection();
            const sql = `select distinct dateVirtual from VirtualLine where month(dateVirtual) = ?;`;
            const [result] = await db.query(sql, [id]);
    
            db.end();
            return result;
        } catch (error) {
            return error;
        }
    },
    async createEvent(codClient: number, codService: number, dateVirtual: string, startTime: string, endTime: string): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `INSERT INTO VirtualLine 
                            (codClient, codService, status, dateVirtual, startTime, endTime)
                        VALUES 
                            (?, ?, 'Tempo estimado', ?, ?, ?);`;
            const [result] = await db.query(sql, [codClient, codService, dateVirtual, startTime, endTime]);
    
            db.end();
            return result as any;
        } catch (error) {
            return error as any;
        }
    },
    async deleteEvent(codClient: number, dateVirtual: string): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `DELETE FROM VirtualLine 
                        WHERE codClient = ?
                        and dateVirtual = ?;`;
            const [result] = await db.query(sql, [codClient, dateVirtual]);
    
            db.end();
            return result as any;
        } catch (error) {
            return error as any;
        }
    },
};