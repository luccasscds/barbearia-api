import { z } from "zod";
import { connectionToDatabase } from "./createConnection";
import { handleZod } from "../tools/handleZod";

export const timetableDB = {
    async getAll(codCompany: number) {
        try {
            const codCompanySchema = z.number(handleZod.params('CodCompany', 'número'));
            codCompanySchema.parse(codCompany);

            const sql = `select 
                            codTime, day, active, time01, time02, time03, time04, codCompany
                        from Timetable
                        where codCompany = ?;`;
            const result = await connectionToDatabase(sql, [codCompany] );
    
            return result;
        } catch (error) {
            throw error;
        }
    },
    async get(newTime: IParamsGetTime) {
        try {
            const { codTime, codCompany } = newTime;
            const newTimeSchema = z.object({
                codTime: z.number(handleZod.params('CodTime', 'número')),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            newTimeSchema.parse(newTime);

            const sql = `select 
                            codTime, day, active, time01, time02, time03, time04
                        from Timetable 
                        where codTime = ?
                        and codCompany = ?;`;
            const result = await connectionToDatabase(sql, [codTime, codCompany] );
    
            return result;
        } catch (error) {
            throw error;
        }
    },
    async getActiveOrInactive(newTime: IParamsGetActiveOrInactiveTime) {
        try {
            const { active, codCompany, codTime } = newTime;

            const newTimeSchema = z.object({
                codTime: z.number(handleZod.params('CodTime', 'número')),
                active: z.boolean(handleZod.params('Ativo', 'boolean')),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            newTimeSchema.parse(newTime);

            const sql = `select 
                            codTime, day, active, time01, time02, time03, time04
                        from Timetable 
                        where active = ?
                        and codCompany = ?
                        and codTime = ?;`;
            const result = await connectionToDatabase(sql, [active, codCompany, codTime] );
    
            return result;
        } catch (error) {
            throw error;
        }
    },

    async updateTimetable(newTime: IParamsUpdateTime) {
        try {
            const { active, time01, time02, time03, time04, codTime, codCompany } = newTime;
            const newTimeSchema = z.object({
                codTime: z.number(handleZod.params('CodTime', 'número')),
                active: z.boolean(handleZod.params('Ativo', 'boolean')),
                time01: z.string(handleZod.params('time01', 'texto')).nullable(),
                time02: z.string(handleZod.params('time02', 'texto')).nullable(),
                time03: z.string(handleZod.params('time03', 'texto')).nullable(),
                time04: z.string(handleZod.params('time04', 'texto')).nullable(),
                codCompany: z.number(handleZod.params('CodCompany', 'número')),
            });
            newTimeSchema.parse(newTime);

            const sql = `   UPDATE Timetable SET
                                active = ?,
                                time01 = ?,
                                time02 = ?,
                                time03 = ?,
                                time04 = ?
                            WHERE codTime = ?
                            AND codCompany = ?;`;
            const result = await connectionToDatabase(sql, [active, time01, time02, time03, time04, codTime, codCompany] );
            
            return result as any;
        } catch (error) {
            throw error as any;
        };
    },

    async insertData(codCompany: number) {
        try {
            const codCompanySchema = z.number(handleZod.params('CodCompany', 'número'));
            codCompanySchema.parse(codCompany);

            const sql = `   INSERT INTO Timetable (day, codCompany, active, time01, time02, time03, time04) VALUES
                            ('Segunda-feira',   ?, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Terça-feira',     ?, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Quarta-feira',    ?, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Quinta-feira',    ?, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Sexta-feira',     ?, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Sábado',          ?, true, '09:00:00',    '17:00:00', '',         ''),
                            ('Domingo',         ?, false, '',           '',         '',         '');`;
            const result = await connectionToDatabase(sql, [codCompany] );
        
            return result as any;
        } catch (error) {
            throw error as any;
        };
    }
};

interface IParamsUpdateTime {
    codTime: number,
    active: boolean,
    time01: string | null,
    time02: string | null,
    time03: string | null,
    time04: string | null,
    codCompany: number,
}

interface IParamsGetTime {
    codTime: number,
    codCompany: number,
}

interface IParamsGetActiveOrInactiveTime {
    codTime: number,
    codCompany: number,
    active: boolean,
}