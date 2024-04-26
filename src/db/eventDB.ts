import { z } from "zod";
import { connectionToDatabase } from "./createConnection";
import { handleZod } from "../tools/handleZod";
import { ResultSet } from "@libsql/client/.";

export const eventDB = {
    async getEvent(newEvent: IParamsGetEvent): Promise<any> {
        try {
            const newEventSchema = z.object({
                codCompany: handleZod.number('CodCompany'),
                date: handleZod.date(),
            });
            newEventSchema.parse(newEvent);

            const { codCompany, date } = newEvent;
            const sql = `select 
                            distinct vl.dateVirtual, vl.startTime, vl.endTime, vl.codStatus, vl.typeVirtual, vl.description,
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
            const result = await connectionToDatabase(sql, [date, codCompany] );
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async getEventByClient(newEvent: IParamsGetEventByClient): Promise<any> {
        try {
            const { codClient, codCompany } = newEvent;
            const newEventSchema = z.object({
                codClient: handleZod.number('CodClient'),
                codCompany: handleZod.number('CodCompany'),
            });
            newEventSchema.parse(newEvent);

            const defaultDay = 15;

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
                    and vl.dateVirtual >= date('now', '-${defaultDay} day')
                    and codCompany = ?
                    order by vl.dateVirtual desc, vl.startTime desc;`;
            const result = await connectionToDatabase(sql, [codClient, codCompany] );
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async getEventByMonth(newEvent: IParamsGetEventByMonth): Promise<any> {
        try {
            const { codMonth, codCompany } = newEvent;
            const newEventSchema = z.object({
                codMonth: handleZod.number('codMonth'),
                codCompany: handleZod.number('CodCompany'),
            });
            newEventSchema.parse(newEvent);

            const sql = `SELECT DISTINCT dateVirtual 
                        FROM VirtualLine 
                        WHERE cast(strftime('%m', dateVirtual) as number) = ?
                        AND codCompany = ?;`;
            const result = await connectionToDatabase(sql, [codMonth, codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async createEvent(newEvent: IParamsCreateEvent): Promise<ResultSet> {
        try {
            const EventSchema = z.object({
                codClient: handleZod.number('CodClient'),
                codService: handleZod.number('CodService'),
                codStatus: handleZod.number('CodStatus'),
                dateVirtual: handleZod.date(),
                startTime: handleZod.time('Tempo inicial'),
                endTime: handleZod.time('Tempo final'),
                codPayment: handleZod.number('CodPayment'),
                codCompany: handleZod.number('CodCompany'),
                typeVirtual: handleZod.string('Tipo da agendamento').optional(),
                description: handleZod.string('Descrição').optional(),
            });
            EventSchema.parse(newEvent);

            const { codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codCompany, typeVirtual, description } = newEvent;
            const sql = `INSERT INTO VirtualLine 
                            (codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codCompany, typeVirtual, description)
                        VALUES 
                            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
            const result = await connectionToDatabase(sql, [codClient, codService, (codStatus ?? 1), dateVirtual, startTime, endTime, codPayment, codCompany, (typeVirtual ?? 'normal'), (description ?? '')] );

            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
    async updateEvent(newEvent: IParamsUpdateEvent): Promise<ResultSet> {
        try {
            const EventSchema = z.object({
                codClient: handleZod.number('CodClient'),
                codService: handleZod.number('CodService'),
                codStatus: handleZod.number('CodStatus'),
                dateVirtual: handleZod.date(),
                startTime: handleZod.time('Tempo inicial'),
                endTime: handleZod.time('Tempo final'),
                codPayment: handleZod.number('CodPayment'),
                codCompany: handleZod.number('CodCompany'),
                description: handleZod.string('Descrição').optional(),
            });
            EventSchema.parse(newEvent);

            const { codClient, codService, codStatus, dateVirtual, startTime, endTime, description, codPayment, codVirtual, codCompany } = newEvent;
            const sql = `UPDATE VirtualLine SET
                            codClient = ?,
                            codService = ?,
                            codStatus = ?,
                            dateVirtual = ?,
                            startTime = ?,
                            endTime = ?,
                            ${description ? `description = '${description}',` : ''}
                            codPayment = ?
                        WHERE codVirtual = ?
                        AND codCompany = ?;`;
            const result = await connectionToDatabase(sql, [codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codVirtual, codCompany] );

            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
    async deleteEvent(newEvent: IParamsDeleteEvent): Promise<ResultSet> {
        try {
            const EventSchema = z.object({            
                codClient: handleZod.number('CodClient'),
                dateVirtual: handleZod.date(),
                startTime: handleZod.time('Tempo inicial'),
                codCompany: handleZod.number('CodCompany'),
            });
            EventSchema.parse(newEvent);

            const { codClient, dateVirtual, startTime, codCompany } = newEvent;

            const sql = `DELETE FROM VirtualLine 
                        WHERE codClient = ?
                        AND dateVirtual = ?
                        AND startTime = ?
                        AND codCompany = ?;`;
            const result = await connectionToDatabase(sql, [codClient, dateVirtual, startTime, codCompany] );
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
    async deleteIn(newEvent: IParamsDeleteInEvent): Promise<ResultSet> {
        try {
            const EventSchema = z.object({            
                codVirtual: z.number(handleZod.params('CodVirtual', 'array de número')).array(),
                codCompany: handleZod.number('CodCompany'),
            });
            EventSchema.parse(newEvent);

            const { codCompany, codVirtual } = newEvent;
            const sql = `DELETE FROM VirtualLine 
                        WHERE codVirtual in(${codVirtual.join(',')})
                        AND codCompany = ${codCompany};`;
            const result = await connectionToDatabase(sql);
    
            return result as any;
        } catch (error) {
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
    typeVirtual?: 'normal' | 'lock',
    description?: string,
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
    description?: string,
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