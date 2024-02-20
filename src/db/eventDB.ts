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
                            ) total,
                            (
                                select identificationColor from Service where codService = (
                                    select MAX(v.codService)
                                    from VirtualLine v
                                    where v.codClient = vl.codClient
                                    and v.dateVirtual = vl.dateVirtual
                                    and v.startTime = vl.startTime
                                )
                            ) identificationColor,
                            vl.codPayment,
                            (select name from PaymentMethod where codPay = vl.codPayment) desPayment
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
            const defaultDay = 15;

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
                    and vl.dateVirtual >= DATE_SUB(current_date, INTERVAL ? DAY)
                    order by vl.dateVirtual desc, vl.startTime desc;`;
            const [result] = await db.query(sql, [codClient, defaultDay]);
    
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
    async createEvent(newEvent: IParamsCreateEvent): Promise<IResponseDB> {
        try {
            const { codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment } = newEvent;
            const db = await createConnection();
            const sql = `INSERT INTO VirtualLine 
                            (codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment)
                        VALUES 
                            (?, ?, ?, ?, ?, ?, ?);`;
            const [result] = await db.query(sql, [codClient, codService, (codStatus ?? 1), dateVirtual, startTime, endTime, codPayment]);
    
            db.end();
            return result as any;
        } catch (error) {
            return error as any;
        }
    },
    async updateEvent(newEvent: IParamsUpdateEvent): Promise<IResponseDB> {
        try {
            const { codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codVirtual } = newEvent;
            const db = await createConnection();
            const sql = `UPDATE VirtualLine SET
                            codClient = ?,
                            codService = ?,
                            codStatus = ?,
                            dateVirtual = ?,
                            startTime = ?,
                            endTime = ?,
                            codPayment = ?
                        WHERE codVirtual = ?;`;
            const [result] = await db.query(sql, [codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codVirtual]);
    
            db.end();
            return result as any;
        } catch (error) {
            return error as any;
        }
    },
    async deleteEvent(newEvent: IParamsDeleteEvent): Promise<IResponseDB> {
        try {
            const { codClient, dateVirtual, startTime } = newEvent;

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

interface IParamsCreateEvent {
    codClient: number,
    codService: number,
    codStatus: number,
    codPayment: number,
    dateVirtual: string,
    startTime: string,
    endTime: string,
};

interface IParamsUpdateEvent {
    codClient: number,
    codService: number,
    codStatus: number,
    dateVirtual: string,
    startTime: string,
    endTime: string,
    codVirtual: string,
    codPayment: number,
};

interface IParamsDeleteEvent {
    codClient: number,
    dateVirtual: string,
    startTime: string,
};