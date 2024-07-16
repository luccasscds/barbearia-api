import { z } from "zod";
import { handleZod } from "../tools/handleZod";
import { connectionToDatabase } from "./createConnection";
import moment from "moment";
import lodash from "lodash";

export const financeDB = {
    async financialBalance(options: IParamsPerformance): Promise<any> {
        try {
            const { dateStart, dateEnd, codCompany, codEmployee } = options;
            const newEventSchema = z.object({
                dateStart: handleZod.date('Data início'),
                dateEnd: handleZod.date('Data fim'),
                codCompany: handleZod.number('CodCompany'),
                codEmployee: handleZod.number('CodEmployee').nullable().optional(),
            });
            newEventSchema.parse(options);

            const sql = `WITH VirtualLineTemp AS (
                            SELECT
                                s.price
                            FROM VirtualLine vl
                            INNER JOIN Service s ON s.codService = vl.codService
                            INNER JOIN Employee e ON e.codEmployee = vl.codEmployee
                            WHERE vl.dateVirtual BETWEEN ? AND ?
                            AND vl.codCompany = ?
                            ${lodash.isNumber(codEmployee) ? `AND vl.codEmployee = ${codEmployee}` : ''}
                            AND vl.typeVirtual = 'normal'
                            AND e.isOutsourced = false
                        ), ExpenseTemp AS (
                            select 0 expense -- modificar depois qnd criar a tabela Expense
                        )
                        SELECT 
                            COALESCE(SUM(vl.price), 0) Receita,
                            COALESCE((select SUM(expense) from ExpenseTemp), 0) Despesa,
                            COALESCE(MAX(SUM(vl.price) - (select SUM(expense) from ExpenseTemp), 0), 0) Lucro
                        FROM VirtualLineTemp vl;`;
            const [result] = await connectionToDatabase(sql, [dateStart, dateEnd, codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async financialResume(options: IParamsPerformance): Promise<any> {
        try {
            const { dateStart, dateEnd, codCompany, codEmployee } = options;
            const newEventSchema = z.object({
                dateStart: handleZod.date('Data início'),
                dateEnd: handleZod.date('Data fim'),
                codCompany: handleZod.number('CodCompany'),
                codEmployee: handleZod.number('CodEmployee').nullable().optional(),
            });
            newEventSchema.parse(options);

            const sql = `WITH VirtualLineTemp AS (
                            SELECT 
                                DISTINCT vl.dateVirtual,
                                vl.codVirtual,
                                vl.codClient,
                                vl.startTime,
                                vl.endTime
                            FROM VirtualLine vl
                            INNER JOIN Employee e ON e.codEmployee = vl.codEmployee
                            WHERE vl.dateVirtual BETWEEN ? AND ?
                            AND vl.codCompany = ?
                            ${lodash.isNumber(codEmployee) ? `AND vl.codEmployee = ${codEmployee}` : ''}
                            AND vl.typeVirtual = 'normal'
                            AND e.isOutsourced = false
                        )
                        SELECT
                            count(DISTINCT dateVirtual) countDay,
                            count(codVirtual) countAttendances,
                            count(DISTINCT codClient) countClient,
                            (
                                SELECT sum(durationMin) from (
                                    SELECT
                                        v.codClient,
                                        ABS(STRFTIME ('%s', v.startTime) - STRFTIME ('%s', v.endTime)) / 60 durationMin
                                    FROM VirtualLineTemp v
                                )
                            ) countMinutes
                        FROM VirtualLineTemp;`;
            const [result] = await connectionToDatabase(sql, [dateStart, dateEnd, codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async topFiveRevenuePerServices(options: IParamsPerformance): Promise<IResponseTopFiveRevenuePerServices[]> {
        try {
            const { dateStart, dateEnd, codCompany } = options;
            const newEventSchema = z.object({
                dateStart: handleZod.date('Data início'),
                dateEnd: handleZod.date('Data fim'),
                codCompany: handleZod.number('CodCompany'),
            });
            newEventSchema.parse(options);

            const sql = `WITH VirtualTemp as (
                            SELECT 
                                vl.dateVirtual,
                                vl.codVirtual,
                                vl.codClient,
                                vl.startTime,
                                vl.endTime,
                                vl.codService,
                                s.nameService,
                                s.price,
                                s.durationMin,
                                s.identificationColor
                            FROM VirtualLine vl
                            INNER JOIN Service s ON s.codService = vl.codService
                            INNER JOIN Employee e ON e.codEmployee = vl.codEmployee
                            WHERE vl.dateVirtual BETWEEN ? AND ?
                            AND vl.codCompany = s.codCompany
                            AND vl.codCompany = ?
                            AND vl.typeVirtual = 'normal'
                            AND e.isOutsourced = false
                        )
                        SELECT
                            v.nameService,
                            COUNT(v.codService) countService,
                            COALESCE(SUM(v.price), 0) value,
                            v.identificationColor
                        from VirtualTemp v
                        group by v.codService;`;
            const result = await connectionToDatabase(sql, [dateStart, dateEnd, codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async listPaymentMethod(options: IParamsPerformance): Promise<IResponseListPaymentMethod[]> {
        try {
            const { dateStart, dateEnd, codCompany } = options;
            const newEventSchema = z.object({
                dateStart: handleZod.date('Data início'),
                dateEnd: handleZod.date('Data fim'),
                codCompany: handleZod.number('CodCompany'),
            });
            newEventSchema.parse(options);

            const sql = `WITH VirtualTemp as (
                            SELECT 
                                vl.dateVirtual,
                                vl.codVirtual,
                                vl.codClient,
                                vl.startTime,
                                vl.endTime,
                                vl.codService,
                                s.nameService,
                                s.price,
                                s.identificationColor,
                                vl.codPayment
                            FROM VirtualLine vl
                            INNER JOIN Service s ON s.codService = vl.codService
                            INNER JOIN Employee e ON e.codEmployee = vl.codEmployee
                            WHERE vl.dateVirtual BETWEEN ? AND ?
                            AND vl.codCompany = s.codCompany
                            AND vl.codCompany = ?
                            AND vl.typeVirtual = 'normal'
                            AND e.isOutsourced = false
                        )
                        select
                            p.name,
                            (
                                select COALESCE(SUM(vl.price), 0) 
                                from VirtualTemp vl where p.codPay = vl.codPayment
                            ) total,
                            COALESCE(
                                ROUND(
                                    ( select COALESCE(SUM(vl.price), 0) * 100 from VirtualTemp vl where p.codPay = vl.codPayment )
                                    /
                                    (select sum(v.price) from VirtualTemp v)
                                , 1)
                            , 0) percentage
                        from PaymentMethod p;`;
            const result = await connectionToDatabase(sql, [dateStart, dateEnd, codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async cashFlow(options: IParamsPerformance): Promise<IResponseCashFlow[]> {
        try {
            const { dateStart, dateEnd, codCompany } = options;
            const newEventSchema = z.object({
                dateStart: handleZod.date('Data início'),
                dateEnd: handleZod.date('Data fim'),
                codCompany: handleZod.number('CodCompany'),
            });
            newEventSchema.parse(options);

            const sql = `WITH VirtualTemp as (
                SELECT 
                    vl.dateVirtual,
                    vl.codVirtual,
                    vl.codClient,
                    vl.startTime,
                    vl.endTime,
                    vl.codService,
                    s.nameService,
                    s.price,
                    s.identificationColor,
                    vl.codPayment
                FROM VirtualLine vl
                INNER JOIN Service s ON s.codService = vl.codService
                INNER JOIN Employee e ON e.codEmployee = vl.codEmployee
                WHERE vl.dateVirtual BETWEEN ? AND ?
                AND vl.codCompany = s.codCompany
                AND vl.codCompany = ?
                AND vl.typeVirtual = 'normal'
                AND e.isOutsourced = false
            ),
            expenseTemp as (
                select 0 codExpense -- colocar depois a tabela Expense
            )
            select
                STRFTIME('%d', vl.dateVirtual) day,
                vl.dateVirtual,
                SUM(vl.price) revenue,
                e.codExpense expense,
                SUM(vl.price) - e.codExpense result
            from VirtualTemp vl, expenseTemp e
            group by vl.dateVirtual;`;
            const result = await connectionToDatabase(sql, [dateStart, dateEnd, codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async detailsCashFlow(options: IParamsDetailsCashFlow): Promise<IResponseDetailsCashFlow[]> {
        try {
            const { dateStart, codCompany } = options;
            const newEventSchema = z.object({
                dateStart: handleZod.date(),
                codCompany: handleZod.number('CodCompany'),
            });
            newEventSchema.parse(options);

            const sql = `SELECT
                            vl.dateVirtual,
                            c.nameClient,
                            s.nameService,
                            s.price,
                            p.name
                        FROM VirtualLine vl
                        INNER JOIN Service s ON s.codService = vl.codService
                        INNER JOIN Client c ON c.codClient = vl.codClient
                        INNER JOIN PaymentMethod p ON p.codPay = vl.codPayment
                        INNER JOIN Employee e ON e.codEmployee = vl.codEmployee
                        WHERE vl.dateVirtual = ?
                        AND vl.codCompany = s.codCompany
                        AND vl.codCompany = ?
                        AND vl.typeVirtual = 'normal'
                        AND e.isOutsourced = false;`;
            const result = await connectionToDatabase(sql, [dateStart, codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async monthsOrYearRevenue(options: IParamsPerformance): Promise<IResponseMonthsOrYearRevenue[]> {
        try {
            const { dateStart, dateEnd, codCompany } = options;
            const newEventSchema = z.object({
                dateStart: handleZod.date('Data início'),
                dateEnd: handleZod.date('Data fim'),
                codCompany: handleZod.number('CodCompany'),
            });
            newEventSchema.parse(options);

            const isSameYear = moment(dateStart, 'YYYY-MM-DD').year() === moment(dateEnd, 'YYYY-MM-DD').year();

            const sql = `WITH VirtualTemp as (
                SELECT 
                    vl.dateVirtual,
                    (STRFTIME('%m', vl.dateVirtual)) month,
                    vl.codVirtual,
                    vl.codClient,
                    vl.startTime,
                    vl.endTime,
                    vl.codService,
                    s.nameService,
                    s.price,
                    s.identificationColor,
                    vl.codPayment
                FROM VirtualLine vl
                INNER JOIN Service s ON s.codService = vl.codService
                INNER JOIN Employee e ON e.codEmployee = vl.codEmployee
                WHERE vl.dateVirtual BETWEEN ? AND ?
                AND vl.codCompany = s.codCompany
                AND vl.codCompany = ?
                AND vl.typeVirtual = 'normal'
                AND e.isOutsourced = false
            )
            select
                (
                    CASE WHEN ${isSameYear} THEN
                            CASE vl.month
                                WHEN '01' THEN 'Jan'
                                WHEN '02' THEN 'Fev'
                                WHEN '03' THEN 'Mar'
                                WHEN '04' THEN 'Abr'
                                WHEN '05' THEN 'Mai'
                                WHEN '06' THEN 'Jun'
                                WHEN '07' THEN 'Jul'
                                WHEN '08' THEN 'Ago'
                                WHEN '09' THEN 'Set'
                                WHEN '10' THEN 'Out'
                                WHEN '11' THEN 'Nov'
                                WHEN '12' THEN 'Dez'
                            END
                        ELSE
                            CASE vl.month
                                WHEN '01' THEN 'Jan' || '/' || SUBSTR(STRFTIME('%Y', vl.dateVirtual), 3, 4)
                                WHEN '02' THEN 'Fev' || '/' || SUBSTR(STRFTIME('%Y', vl.dateVirtual), 3, 4)
                                WHEN '03' THEN 'Mar' || '/' || SUBSTR(STRFTIME('%Y', vl.dateVirtual), 3, 4)
                                WHEN '04' THEN 'Abr' || '/' || SUBSTR(STRFTIME('%Y', vl.dateVirtual), 3, 4)
                                WHEN '05' THEN 'Mai' || '/' || SUBSTR(STRFTIME('%Y', vl.dateVirtual), 3, 4)
                                WHEN '06' THEN 'Jun' || '/' || SUBSTR(STRFTIME('%Y', vl.dateVirtual), 3, 4)
                                WHEN '07' THEN 'Jul' || '/' || SUBSTR(STRFTIME('%Y', vl.dateVirtual), 3, 4)
                                WHEN '08' THEN 'Ago' || '/' || SUBSTR(STRFTIME('%Y', vl.dateVirtual), 3, 4)
                                WHEN '09' THEN 'Set' || '/' || SUBSTR(STRFTIME('%Y', vl.dateVirtual), 3, 4)
                                WHEN '10' THEN 'Out' || '/' || SUBSTR(STRFTIME('%Y', vl.dateVirtual), 3, 4)
                                WHEN '11' THEN 'Nov' || '/' || SUBSTR(STRFTIME('%Y', vl.dateVirtual), 3, 4)
                                WHEN '12' THEN 'Dez' || '/' || SUBSTR(STRFTIME('%Y', vl.dateVirtual), 3, 4)
                            END
                    END
                ) nameMonth,
                sum(vl.price) value
            from VirtualTemp vl
            group by vl.month
            order by vl.dateVirtual;`;
            const result = await connectionToDatabase(sql, [dateStart, dateEnd, codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async calcRevenue(options: IParamsPerformance): Promise<IResponseCalcRevenue> {
        try {
            const { dateStart, dateEnd, codCompany } = options;
            const newEventSchema = z.object({
                dateStart: handleZod.date('Data início'),
                dateEnd: handleZod.date('Data fim'),
                codCompany: handleZod.number('CodCompany'),
            });
            newEventSchema.parse(options);

            const sql = `WITH VirtualTemp as (
                            SELECT 
                                vl.dateVirtual,
                                (STRFTIME('%m', vl.dateVirtual)) month,
                                vl.codVirtual,
                                vl.codClient,
                                vl.startTime,
                                vl.endTime,
                                vl.codService,
                                s.nameService,
                                s.price,
                                s.identificationColor,
                                vl.codPayment
                            FROM VirtualLine vl
                            INNER JOIN Service s ON s.codService = vl.codService
                            INNER JOIN Employee e ON e.codEmployee = vl.codEmployee
                            WHERE vl.dateVirtual BETWEEN ? AND ?
                            AND vl.codCompany = s.codCompany
                            AND vl.codCompany = ?
                            AND vl.typeVirtual = 'normal'
                            AND e.isOutsourced = false
                        ),
                        calcBase as (
                            select
                                sum(vl.price) value
                            from VirtualTemp vl
                            group by vl.month
                        )
                        select 
                            COALESCE(MAX(c.value), 0) max,
                            COALESCE(MIN(c.value), 0) min,
                            COALESCE(AVG(c.value), 0) avg
                        from calcBase c`;
            const [result] = await connectionToDatabase(sql, [dateStart, dateEnd, codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async bestClients(options: IParamsPerformance): Promise<IResponseBestClients[]> {
        try {
            const { dateStart, dateEnd, codCompany } = options;
            const newEventSchema = z.object({
                dateStart: handleZod.date('Data início'),
                dateEnd: handleZod.date('Data fim'),
                codCompany: handleZod.number('CodCompany'),
            });
            newEventSchema.parse(options);

            const sql = `WITH VirtualLineTemp AS (
                            SELECT
                                vl.codVirtual,
                                c.codClient,
                                c.nameClient,
                                s.price
                            FROM VirtualLine vl
                            INNER JOIN Client c ON c.codClient = vl.codClient
                            INNER JOIN Service s ON s.codService = vl.codService
                            INNER JOIN Employee e ON e.codEmployee = vl.codEmployee
                            WHERE vl.dateVirtual BETWEEN ? AND ?
                            AND vl.codCompany = ?
                            AND vl.typeVirtual = 'normal'
                            AND e.isOutsourced = false
                        )
                        SELECT
                            vl.codClient,
                            vl.nameClient,
                            COALESCE(SUM(vl.price), 0) revenue,
                            COUNT(vl.codVirtual) countAttendances
                        FROM VirtualLineTemp vl
                        GROUP BY vl.codClient
                        LIMIT 30;`;
            const result = await connectionToDatabase(sql, [dateStart, dateEnd, codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async detailsClients(options: IParamsPerformance): Promise<IResponseDetailsClients> {
        try {
            const { dateStart, dateEnd, codCompany } = options;
            const newEventSchema = z.object({
                dateStart: handleZod.date('Data início'),
                dateEnd: handleZod.date('Data fim'),
                codCompany: handleZod.number('CodCompany'),
            });
            newEventSchema.parse(options);

            const sql = `WITH ClientTemp AS (
                            SELECT
                                c.codClient,
                                c.dateCreated
                            FROM Client c
                            WHERE c.codCompany = ?
                        )
                        SELECT
                            COUNT(c.codClient) total,
                            (
                                SELECT COUNT(t.codClient) FROM ClientTemp t
                                WHERE STRFTIME('%Y-%m-%d', t.dateCreated) BETWEEN ? AND ?
                            ) countNewClient
                        FROM ClientTemp c;`;
            const [result] = await connectionToDatabase(sql, [codCompany, dateStart, dateEnd] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
}

interface IParamsPerformance {
    dateStart: string,
    dateEnd: string,
    codCompany: number,
    codEmployee?: number,
};

interface IResponseTopFiveRevenuePerServices {
    nameService: string,
    countService: number,
    value: number,
    identificationColor?: string,
}

interface IResponseListPaymentMethod {
    name: string,
    total: number,
    percentage: number,
}

interface IResponseCashFlow {
    day: number,
    dateVirtual: string,
    revenue: number,
    expense: number,
    result: number,
}

interface IParamsDetailsCashFlow {
    dateStart: string,
    codCompany: number,
}

interface IResponseDetailsCashFlow {
    dateVirtual: string,
    nameClient: string,
    nameService: string,
    price: number,
    name: string
}

interface IResponseMonthsOrYearRevenue {
    nameMonth: string,
    value: number,
}

interface IResponseCalcRevenue {
    max: number,
    min: number,
    avg: number,
}

interface IResponseBestClients {
    codClient: number,
    nameClient: string,
    revenue: number,
    countAttendances: number,
}

interface IResponseDetailsClients {
    total: number,
    countNewClient: number,
}