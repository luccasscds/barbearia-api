import { z } from "zod";
import { handleZod } from "../tools/handleZod";
import { connectionToDatabase } from "./createConnection";

export const financeDB = {
    async financialBalance(options: IParamsPerformance): Promise<any> {
        try {
            const { dateStart, dateEnd, codCompany } = options;
            const newEventSchema = z.object({
                dateStart: handleZod.date('Data início'),
                dateEnd: handleZod.date('Data fim'),
                codCompany: handleZod.number('CodCompany'),
            });
            newEventSchema.parse(options);

            const sql = `SELECT 
                            SUM(revenue) Receita,
                            expense Despesa,
                            MAX(SUM(revenue) - expense, 0) Lucro
                        FROM (
                            SELECT (
                                SELECT SUM(price) from Service where codService = vl.codService
                            ) revenue
                            FROM VirtualLine vl
                            WHERE vl.dateVirtual between ? and ?
                            AND vl.codCompany = ?
                        ), (
                            select 0 expense -- modificar depois qnd criar a tabela Expense
                        );`;
            const [result] = await connectionToDatabase(sql, [dateStart, dateEnd, codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async financialResume(options: IParamsPerformance): Promise<any> {
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
                                DISTINCT vl.dateVirtual,
                                vl.codVirtual,
                                vl.codClient,
                                vl.startTime,
                                vl.endTime
                            FROM VirtualLine vl
                            WHERE vl.dateVirtual BETWEEN ? AND ?
                            AND vl.codCompany = ?
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
}

interface IParamsPerformance {
    dateStart: string,
    dateEnd: string,
    codCompany: number,
};