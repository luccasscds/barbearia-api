import { z } from "zod";
import { connectionToDatabase } from "./createConnection";
import { handleZod } from "../tools/handleZod";

export const timetableDB = {
    async getAll(codCompany: number) {
        try {
            const codCompanySchema = handleZod.number('CodCompany');
            codCompanySchema.parse(codCompany);

            const sql = `select 
                            codTime, day, active, time01, time02, time03, time04, codCompany
                        from Timetable
                        where codCompany = ?;`;
            const result = await connectionToDatabase(sql, [codCompany] );
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async get(newTime: IParamsGetTime) {
        try {
            const { codTime, codCompany } = newTime;
            const newTimeSchema = z.object({
                codTime: handleZod.number('CodTime'),
                codCompany: handleZod.number('CodCompany'),
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
            throw error as any;
        }
    },
    async getActiveOrInactive(newTime: IParamsGetActiveOrInactiveTime) {
        try {
            const { active, codCompany, codTime } = newTime;

            const newTimeSchema = z.object({
                codTime: handleZod.number('CodTime'),
                active: handleZod.boolean('Ativo'),
                codCompany: handleZod.number('CodCompany'),
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
            throw error as any;
        }
    },

    async updateTimetable(newTime: IParamsUpdateTime) {
        try {
            const { active, time01, time02, time03, time04, codTime, codCompany } = newTime;
            const newTimeSchema = z.object({
                codTime: handleZod.number('CodTime'),
                active: handleZod.boolean('Ativo'),
                time01: handleZod.string('time01').nullable(),
                time02: handleZod.string('time02').nullable(),
                time03: handleZod.string('time03').nullable(),
                time04: handleZod.string('time04').nullable(),
                codCompany: handleZod.number('CodCompany'),
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

    async create(codCompany: number) {
        try {
            const codCompanySchema = handleZod.number('CodCompany');
            codCompanySchema.parse(codCompany);

            const sql = `   INSERT INTO Timetable (day, codCompany, active, time01, time02, time03, time04) VALUES
                            ('Segunda-feira',   ${codCompany}, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Terça-feira',     ${codCompany}, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Quarta-feira',    ${codCompany}, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Quinta-feira',    ${codCompany}, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Sexta-feira',     ${codCompany}, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Sábado',          ${codCompany}, true, '09:00:00',    '17:00:00', '',         ''),
                            ('Domingo',         ${codCompany}, false, '',           '',         '',         '');`;
            const result = await connectionToDatabase(sql, undefined, true);
        
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