import { z } from "zod";
import { connectionToDatabase } from "./createConnection";
import { handleZod } from "../tools/handleZod";
import { ResultSet } from "@libsql/client/.";

export const eventDB = {
    async getEvent(newEvent: IParamsGetEvent): Promise<any> {
        try {
            const newEventSchema = z.object({
                codEmployee: handleZod.number('CodEmployee'),
                date: handleZod.date(),
            });
            newEventSchema.parse(newEvent);

            const { codEmployee, date } = newEvent;
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
                            codEmployee
                        from VirtualLine vl
                        where vl.dateVirtual = ?
                        and codEmployee = ?;`;
            const result = await connectionToDatabase(sql, [date, codEmployee] );
    
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

            const sql = `SELECT DISTINCT
                            vl.dateVirtual,
                            vl.startTime,
                            vl.endTime,
                            GROUP_CONCAT(DISTINCT vl.codVirtual) AS codVirtual,
                            GROUP_CONCAT(DISTINCT s.codService) AS codServices,
                            GROUP_CONCAT(DISTINCT s.nameService) AS nameServices,
                            SUM(s.price) AS total,
                            vl.codEmployee,
                            e.nameEmployee
                        FROM
                            VirtualLine vl
                        LEFT JOIN Service s ON s.codService = vl.codService
                        INNER JOIN Employee e ON e.codEmployee = vl.codEmployee
                        WHERE
                            vl.codClient = ?
                            AND vl.dateVirtual >= date('now', '-15 day')
                            AND vl.codCompany = ?
                        GROUP BY
                            vl.dateVirtual,
                            vl.startTime,
                            vl.endTime
                        ORDER BY
                            vl.dateVirtual DESC,
                            vl.startTime DESC;`;
            const result = await connectionToDatabase(sql, [codClient, codCompany] );
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async getEventByMonth(newEvent: IParamsGetEventByMonth): Promise<any> {
        try {
            const { date, codEmployee } = newEvent;
            const newEventSchema = z.object({
                date: handleZod.date('Data'),
                codEmployee: handleZod.number('CodEmployee'),
            });
            newEventSchema.parse(newEvent);

            const sql = `SELECT DISTINCT dateVirtual 
                        FROM VirtualLine 
                        WHERE strftime('%m%Y', dateVirtual) = strftime('%m%Y', ?)
                        AND codEmployee = ?;`;
            const result = await connectionToDatabase(sql, [date, codEmployee] ) as any;
    
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
                codEmployee: handleZod.number('codEmployee'),
                codCompany: handleZod.number('codCompany'),
                typeVirtual: handleZod.string('Tipo da agendamento').optional(),
                description: handleZod.string('Descrição').optional(),
            });
            EventSchema.parse(newEvent);

            const { codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codCompany, codEmployee, typeVirtual, description } = newEvent;
            const sql = `INSERT INTO VirtualLine 
                            (codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codCompany, codEmployee, typeVirtual, description)
                        VALUES 
                            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
            const result = await connectionToDatabase(sql, [codClient, codService, (codStatus ?? 1), dateVirtual, startTime, endTime, codPayment, codCompany, codEmployee, (typeVirtual ?? 'normal'), (description ?? '')] );

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
                codEmployee: handleZod.number('CodEmployee'),
                description: handleZod.string('Descrição').optional(),
            });
            EventSchema.parse(newEvent);

            const { codClient, codService, codStatus, dateVirtual, startTime, endTime, description, codPayment, codVirtual, codEmployee } = newEvent;
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
                        AND codEmployee = ?;`;
            const result = await connectionToDatabase(sql, [codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codVirtual, codEmployee] );

            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
    async deleteIn(newEvent: IParamsDeleteInEvent): Promise<ResultSet> {
        try {
            const EventSchema = z.object({            
                codVirtual: z.number(handleZod.params('CodVirtual', 'array de número')).array(),
            });
            EventSchema.parse(newEvent);

            const { codVirtual } = newEvent;
            const sql = `DELETE FROM VirtualLine WHERE codVirtual in(${codVirtual.join(',')});`;
            const result = await connectionToDatabase(sql);
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
};

interface IParamsGetEvent {
    date: string,
    codEmployee: number,
};

interface IParamsGetEventByClient {
    codClient: number,
    codCompany: number,
};

interface IParamsGetEventByMonth {
    date: string,
    codEmployee: number,
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
    codEmployee: number,
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
    codEmployee: number,
    description?: string,
};

interface IParamsDeleteEvent {
    codClient: number,
    dateVirtual: string,
    startTime: string,
    codEmployee: number,
};

interface IParamsDeleteInEvent {
    codVirtual: number[],
};