import { z } from "zod";
import { IResponseDB } from "../routes/controllers/types";
import { createConnection } from "./createConnection";
import { handleZod } from "../tools/handleZod";
import { ResultSetHeader } from "mysql2";

export const eventDB = {
    async getEvent(newEvent: IParamsGetEvent): Promise<any> {
        try {
            const newEventSchema = z.object({
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
                date: handleZod.date(),
            });
            newEventSchema.parse(newEvent);

            const { codCompany, date } = newEvent;
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
                            (select name from PaymentMethod where codPay = vl.codPayment) desPayment,
                            codCompany
                        from VirtualLine vl
                        where vl.dateVirtual = ?
                        and codCompany = ?;`;
            const [result] = await db.query(sql, [ date, codCompany ]);
    
            db.end();
            return result;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error;
        }
    },
    async getEventByClient(newEvent: IParamsGetEventByClient): Promise<any> {
        try {
            const { codClient, codCompany } = newEvent;
            const newEventSchema = z.object({
                codClient: z.number(handleZod.params('CodClient', 'número')),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            newEventSchema.parse(newEvent);

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
                    and codCompany = ?
                    order by vl.dateVirtual desc, vl.startTime desc;`;
            const [result] = await db.query(sql, [codClient, defaultDay, codCompany]);
    
            db.end();
            return result;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error;
        }
    },
    async getEventByMonth(newEvent: IParamsGetEventByMonth): Promise<any> {
        try {
            const { codMonth, codCompany } = newEvent;
            const newEventSchema = z.object({
                codMonth: z.number(handleZod.params('CodClient', 'número')),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            newEventSchema.parse(newEvent);

            const db = await createConnection();
            const sql = `SELECT DISTINCT dateVirtual 
                        FROM VirtualLine 
                        WHERE MONTH(dateVirtual) = ?
                        AND codCompany = ?;`;
            const [result] = await db.query(sql, [codMonth, codCompany]);
    
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },
    async createEvent(newEvent: IParamsCreateEvent): Promise<IResponseDB> {
        try {
            const EventSchema = z.object({
                codClient: z.number(handleZod.params('CodClient', 'número')),
                codService: z.number(handleZod.params('CodService', 'número')),
                codStatus: z.number(handleZod.params('CodStatus', 'número')),
                dateVirtual: handleZod.date(),
                startTime: handleZod.time('Tempo inicial'),
                endTime: handleZod.time('Tempo final'),
                codPayment: z.number(handleZod.params('CodPayment', 'número')),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            EventSchema.parse(newEvent);

            const { codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codCompany } = newEvent;
            const db = await createConnection();
            const sql = `INSERT INTO VirtualLine 
                            (codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codCompany)
                        VALUES 
                            (?, ?, ?, ?, ?, ?, ?, ?);`;
            const [result] = await db.query(sql, [codClient, codService, (codStatus ?? 1), dateVirtual, startTime, endTime, codPayment, codCompany]);
            
            if((result as ResultSetHeader).affectedRows === 0) {
                throw 'Houve algo erro, nenhum resultado(s) inserido(s)';
            };

            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },
    async updateEvent(newEvent: IParamsUpdateEvent): Promise<IResponseDB> {
        try {
            const EventSchema = z.object({
                codClient: z.number(handleZod.params('CodClient', 'número')),
                codService: z.number(handleZod.params('CodService', 'número')),
                codStatus: z.number(handleZod.params('CodStatus', 'número')),
                dateVirtual: handleZod.date(),
                startTime: handleZod.time('Tempo inicial'),
                endTime: handleZod.time('Tempo final'),
                codPayment: z.number(handleZod.params('CodPayment', 'número')),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            EventSchema.parse(newEvent);

            const { codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codVirtual, codCompany } = newEvent;
            const db = await createConnection();
            const sql = `UPDATE VirtualLine SET
                            codClient = ?,
                            codService = ?,
                            codStatus = ?,
                            dateVirtual = ?,
                            startTime = ?,
                            endTime = ?,
                            codPayment = ?
                        WHERE codVirtual = ?
                        AND codCompany = ?;`;
            const [result] = await db.query(sql, [codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codVirtual, codCompany]);
    
            if((result as ResultSetHeader).affectedRows === 0) {
                throw 'Houve algo erro, nenhum resultado(s) inserido(s)';
            };

            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },
    async deleteEvent(newEvent: IParamsDeleteEvent): Promise<IResponseDB> {
        try {
            const EventSchema = z.object({            
                codClient: z.number(handleZod.params('CodClient', 'número')),
                dateVirtual: handleZod.date(),
                startTime: handleZod.time('Tempo inicial'),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            EventSchema.parse(newEvent);

            const { codClient, dateVirtual, startTime, codCompany } = newEvent;

            const db = await createConnection();
            const sql = `DELETE FROM VirtualLine 
                        WHERE codClient = ?
                        AND dateVirtual = ?
                        AND startTime = ?
                        AND codCompany = ?;`;
            const [result] = await db.query(sql, [codClient, dateVirtual, startTime, codCompany]);
    
            if((result as ResultSetHeader).affectedRows === 0) {
                throw 'Houve algo erro, nenhum resultado(s) inserido(s)';
            };
            
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },
    async deleteIn(newEvent: IParamsDeleteInEvent): Promise<IResponseDB> {
        try {
            const EventSchema = z.object({            
                codVirtual: z.number(handleZod.params('CodVirtual', 'array de número')).array(),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            EventSchema.parse(newEvent);

            const { codCompany, codVirtual } = newEvent;
            const db = await createConnection();
            const sql = `DELETE FROM VirtualLine 
                        WHERE codVirtual in(${codVirtual.join(',')})
                        AND codCompany = ${codCompany};`;
            const [result] = await db.query(sql);
    
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },
};

interface IParamsGetEvent {
    date: string,
    codCompany: number,
};

interface IParamsGetEventByClient {
    codClient: number,
    codCompany: number,
};

interface IParamsGetEventByMonth {
    codMonth: number,
    codCompany: number,
};

interface IParamsCreateEvent {
    codClient: number,
    codService: number,
    codStatus: number,
    codPayment: number,
    dateVirtual: string,
    startTime: string,
    endTime: string,
    codCompany: number,
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
    codCompany: number,
};

interface IParamsDeleteEvent {
    codClient: number,
    dateVirtual: string,
    startTime: string,
    codCompany: number,
};

interface IParamsDeleteInEvent {
    codVirtual: number[],
    codCompany: number,
};