import { z } from "zod";
import { connectionToDatabase, transactionToDatabase } from "./createConnection";
import { handleZod } from "../tools/handleZod";
import { toolsSQL } from "../tools/toolsSQL";
import lodash from 'lodash';

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

            const isExist = await toolsSQL.isExist({ table: 'Timetable', field: 'codCompany', value: `${codCompany}` });
            if(isExist && isExist > 0) return;

            const sql = `   INSERT INTO Timetable (day, codCompany, active, time01, time02, time03, time04) VALUES
                            ('Domingo',         ${codCompany}, false, '',           '',         '',         ''),
                            ('Segunda-feira',   ${codCompany}, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Terça-feira',     ${codCompany}, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Quarta-feira',    ${codCompany}, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Quinta-feira',    ${codCompany}, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Sexta-feira',     ${codCompany}, true, '09:00:00',    '12:00:00', '15:00:00', '19:00:00'),
                            ('Sábado',          ${codCompany}, true, '09:00:00',    '17:00:00', '',         '')`;
            const result = await connectionToDatabase(sql, undefined, true);
        
            return result as any;
        } catch (error) {
            throw error as any;
        };
    },

    async getTimetableEmployee(newData: { codEmployee: number }): Promise<IResponseGetTimetableEmployee[]> {
        try {
            const { codEmployee } = newData;
            const newSchema = z.object({
                codEmployee: handleZod.number('codEmployee'),
            });
            newSchema.parse(newData);

            const sql = `select 
                            codTime,
                            day,
                            active,
                            time01,
                            time02,
                            time03,
                            time04,
                            codEmployee
                        from TimetableEmployee
                        where codEmployee = ?`;
            const result = await connectionToDatabase(sql, [codEmployee,] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async getByDayTimetableEmployee(newData: { codEmployee: number, dayName: string, }): Promise<IResponseGetTimetableEmployee> {
        try {
            const { codEmployee, dayName } = newData;
            const newSchema = z.object({
                codEmployee: handleZod.number('codEmployee'),
                dayName: handleZod.string('Dia da semana'),
            });
            newSchema.parse(newData);

            const sql = `select 
                            codTime,
                            day,
                            active,
                            time01,
                            time02,
                            time03,
                            time04,
                            codEmployee
                        from TimetableEmployee
                        where codEmployee = ?
                        and LOWER(day) = LOWER(?);`;
            const result = await connectionToDatabase(sql, [codEmployee, dayName] ) as any;
    
            return result[0];
        } catch (error) {
            throw error as any;
        }
    },

    async getActiveOrInactive(newTime: IParamsGetActiveOrInactiveTime) {
        try {
            const { active, codEmployee } = newTime;

            const newTimeSchema = z.object({
                active: handleZod.boolean('Ativo'),
                codEmployee: handleZod.number('codEmployee'),
            });
            newTimeSchema.parse(newTime);

            const sql = `select 
                            codTime, day, active, time01, time02, time03, time04
                        from TimetableEmployee
                        where active = ?
                        and codEmployee = ?;`;
            const result = await connectionToDatabase(sql, [active, codEmployee] );
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async createTimetableEmployee(newData: IParamsCreateTimetableEmployee[]): Promise<void> {
        try {
            const newSchema = z.array(z.object({
                codTime: handleZod.number('codTime'),
                day: handleZod.string('dia'),
                codEmployee: handleZod.number('codEmployee'),
                active: handleZod.boolean('ativo'),
                time01: handleZod.time('Inicio 1').nullable(),
                time02: handleZod.time('Fim 1').nullable(),
                time03: handleZod.time('Inicio 2').nullable(),
                time04: handleZod.time('Fim 2').nullable(),
            }));
            newSchema.parse(newData);

            await transactionToDatabase(async (transaction) => {
                for( const item of newData ) {
                    await transaction.execute({
                        sql: `  INSERT INTO TimetableEmployee (day, codEmployee, active, time01, time02, time03, time04) VALUES
                                ('${item.day}', ${item.codEmployee}, ${item.active}, ${item.time01 ? `'${item.time01}'` : null}, ${item.time02 ? `'${item.time02}'` : null}, ${item.time03 ? `'${item.time03}'` : null}, ${item.time04 ? `'${item.time04}'` : null})`,
                        args: [],
                    });
                };
            });
        } catch (error) {
            throw error as any;
        }
    },

    async updateTimetableEmployee(newData: IParamsCreateTimetableEmployee[]): Promise<void> {
        try {
            const newSchema = z.array(z.object({
                codTime: handleZod.number('codTime'),
                day: handleZod.string('dia'),
                codEmployee: handleZod.number('codEmployee'),
                active: handleZod.boolean('ativo'),
                time01: handleZod.time('time01').nullable(),
                time02: handleZod.time('time02').nullable(),
                time03: handleZod.time('time03').nullable(),
                time04: handleZod.time('time04').nullable(),
            }));
            newSchema.parse(newData);

            await transactionToDatabase(async (transaction) => {
                for( const item of newData ) {
                    await transaction.execute({
                        sql: `  UPDATE TimetableEmployee SET
                                    ${lodash.isString(item.time01) ? `time01 = '${item.time01}',` : ''}
                                    ${lodash.isString(item.time02) ? `time02 = '${item.time02}',` : ''}
                                    ${lodash.isString(item.time03) ? `time03 = '${item.time03}',` : ''}
                                    ${lodash.isString(item.time04) ? `time04 = '${item.time04}',` : ''}
                                    active = ${item.active}
                                WHERE codTime = ${item.codTime}
                                AND codEmployee = ${item.codEmployee};`,
                        args: [],
                    });
                };
            });
        } catch (error) {
            throw error as any;
        }
    },
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
    codEmployee: number,
    active: boolean,
}

interface IParamsCreateTimetableEmployee {
    codTime: number,
    day: string,
    codEmployee: number,
    active: boolean,
    time01?: string,
    time02?: string,
    time03?: string,
    time04?: string,
};

interface IResponseGetTimetableEmployee {
    codTime: number,
    day: string,
    active: boolean,
    time01?: string,
    time02?: string,
    time03?: string,
    time04?: string,
    codEmployee: number,
};