import { IResponseDB } from "../routes/controllers/types";
import { createConnection } from "./createConnection";

export const eventDB = {
    async getEvent(date: string): Promise<any> {
        try {
            const db = await createConnection();
            const sql = `select 
                            distinct vl.dateVirtual, vl.startTime, vl.endTime, vl.codStatus,
                            (select name from Status where codStatus = vl.codStatus) status,
                            (
                                select GROUP_CONCAT(v.codVirtual) from VirtualLine v
                                where v.codClient = vl.codClient
                                and v.dateVirtual = vl.dateVirtual
                                and v.startTime = vl.startTime
                                and v.endTime = vl.endTime
                            ) codVirtual,
                            (select c.codClient from Client c where c.codClient = vl.codClient) codClient,
                            (select c.nameClient from Client c where c.codClient = vl.codClient) nameClient,
                            (select c.numberPhone from Client c where c.codClient = vl.codClient) numberPhone,
                            (
                                select GROUP_CONCAT(codService) from Service where codService in (
                                    select v.codService
                                    from VirtualLine v
                                    where v.codClient = vl.codClient
                                    and v.dateVirtual = vl.dateVirtual
                                    and v.startTime = vl.startTime
                                )
                            ) codServices,
                            (
                                select GROUP_CONCAT(nameService) from Service where codService in (
                                    select v.codService
                                    from VirtualLine v
                                    where v.codClient = vl.codClient
                                    and v.dateVirtual = vl.dateVirtual
                                    and v.startTime = vl.startTime
                                )
                            ) nameServices,
                            (
                                select sum(price) from Service where codService in (
                                    select v.codService
                                    from VirtualLine v
                                    where v.codClient = vl.codClient
                                    and v.dateVirtual = vl.dateVirtual
                                    and v.startTime = vl.startTime
                                )
                            ) total
                        from VirtualLine vl
                        where vl.dateVirtual = ?;`;
            const [result] = await db.query(sql, [date]);
    
            db.end();
            return result;
        } catch (error) {
            return error;
        }
    },
    async getEventByClient(codClient: number): Promise<any> {
        try {
            const db = await createConnection();
            const sql = `select 
                        distinct vl.dateVirtual, vl.startTime, vl.endTime,
                        (
                            select GROUP_CONCAT(codService) from Service where codService in (
                                select v.codService
                                from VirtualLine v
                                where v.codClient = vl.codClient
                                and v.dateVirtual = vl.dateVirtual
                                and v.startTime = vl.startTime
                            )
                        ) codServices,
                        (
                            select GROUP_CONCAT(nameService) from Service where codService in (
                                select v.codService
                                from VirtualLine v
                                where v.codClient = vl.codClient
                                and v.dateVirtual = vl.dateVirtual
                                and v.startTime = vl.startTime
                            )
                        ) nameServices,
                        (
                            select sum(price) from Service where codService in (
                                select v.codService
                                from VirtualLine v
                                where v.codClient = vl.codClient
                                and v.dateVirtual = vl.dateVirtual
                                and v.startTime = vl.startTime
                            )
                        ) total
                    from VirtualLine vl
                    where vl.codClient = ?
                    order by vl.dateVirtual desc, vl.startTime desc;`;
            const [result] = await db.query(sql, [codClient]);
    
            db.end();
            return result;
        } catch (error) {
            return error;
        }
    },
    async getEventByMonth(id: number): Promise<any> {
        try {
            const db = await createConnection();
            const sql = `select distinct dateVirtual from VirtualLine where month(dateVirtual) = ?;`;
            const [result] = await db.query(sql, [id]);
    
            db.end();
            return result as any;
        } catch (error) {
            return error as any;
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
    async updateEvent(codClient: number, codService: number, dateVirtual: string, startTime: string, endTime: string, codVirtual: string): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `UPDATE VirtualLine SET
                            codClient = ?,
                            codService = ?,
                            dateVirtual = ?,
                            startTime = ?,
                            endTime = ?
                        WHERE codVirtual = ?;`;
            const [result] = await db.query(sql, [codClient, codService, dateVirtual, startTime, endTime, codVirtual]);
    
            db.end();
            return result as any;
        } catch (error) {
            return error as any;
        }
    },
    async deleteEvent(codClient: number, dateVirtual: string, startTime: string): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `DELETE FROM VirtualLine 
                        WHERE codClient = ?
                        and dateVirtual = ?
                        and startTime = ?;`;
            const [result] = await db.query(sql, [codClient, dateVirtual, startTime]);
    
            db.end();
            return result as any;
        } catch (error) {
            return error as any;
        }
    },
    async deleteIn(codVirtual: string): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `DELETE FROM VirtualLine 
                        WHERE codVirtual in(${codVirtual});`;
            const [result] = await db.query(sql);
    
            db.end();
            return result as any;
        } catch (error) {
            return error as any;
        }
    },
};