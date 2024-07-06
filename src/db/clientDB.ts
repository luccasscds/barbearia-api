import { z } from 'zod';
import { connectionToDatabase } from './createConnection';
import { handleZod } from '../tools/handleZod';
import { ResultSet } from '@libsql/client/.';
import { toolsSQL } from '../tools/toolsSQL';
import { tools } from '../tools';
import lodash from 'lodash';

export const clientDB = {
    async getAll(codCompany: number): Promise<IResponseClient[]> {
        try {
            const codCompanySchema = handleZod.number('CodCompany');
            codCompanySchema.parse(codCompany);

            const sql = `select c.codClient, c.nameClient, c.emailClient, c.numberPhone, c.blocked
                        from Client c
                        WHERE c.blocked = false
                        AND c.codCompany = ?;`
            const result = await connectionToDatabase(sql, [codCompany] );
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },

    async getBlockedOrNo(newClient: IParamsGetBlockedOrNo): Promise<IResponseClient[]> {
        try {
            const UserSchema = z.object({
                blocked: handleZod.boolean('Bloqueado'),
                codCompany: handleZod.number('codCompany'),
            });
            UserSchema.parse(newClient);

            const { blocked, codCompany } = newClient;
            const sql = `select c.codClient, c.nameClient, c.emailClient, c.numberPhone, c.blocked
                        from Client c
                        where c.blocked = ?
                        AND c.codCompany = ?;`
            const result = await connectionToDatabase(sql, [blocked, codCompany] );
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },

    async get(id: number): Promise<IResponseClient> {
        try {
            const idSchema = handleZod.number('codClient');
            idSchema.parse(id);

            const sql = `   select 
                                c.codClient,c.nameClient, c.emailClient, c.numberPhone, c.blocked, c.dateCreated, c.birthdayDate, photo,
                                max(v.dateVirtual) lastDayAttendance
                            from Client c
                            INNER JOIN VirtualLine v ON v.codClient = c.codClient
                            where c.codClient = ?;`
            const [result] = await connectionToDatabase(sql, [id] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async getByEmail(newClient: IParamsClientByEmail): Promise<IResponseClientByEmail | undefined> {
        try {
            const { email, codCompany } = newClient;

            const UserSchema = z.object({
                email: handleZod.email(),
                codCompany: handleZod.number('codCompany'),
            });
            UserSchema.parse(newClient);

            const sql = `select codClient, nameClient, emailClient, passwordClient, blocked, photo
                        FROM Client
                        WHERE emailClient = ?
                        AND codCompany = ?;`
            const [result] = await connectionToDatabase(sql, [email.toLowerCase(), codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async missing(options: IParamsMissing): Promise<IResponseMissing[]> {
        try {
            const { codCompany, countDayLast, countAttendance } = options;
            const optionsSchema = z.object({
                codCompany: handleZod.number('CodCompany'),
                countDayLast: handleZod.number('Quantidade de dias de atendimento'),
                countAttendance: handleZod.number('Quantidade atendimento'),
            });
            optionsSchema.parse(options);

            const sql = `WITH VirtualTemp AS (
                            SELECT
                                v.codVirtual,
                                v.dateVirtual,
                                v.startTime,
                                v.endTime,
                                c.codClient,
                                c.nameClient
                            FROM
                            VirtualLine v
                            INNER JOIN Client c ON c.codClient = v.codClient
                            WHERE v.codCompany = ?
                        ),
                        listMissing AS (
                            SELECT
                                v.codClient,
                                v.nameClient,
                                MAX(v.dateVirtual) dateVirtual,
                                COUNT(v.codVirtual) countAttendance,
                                (((ABS(STRFTIME('%s', 'now') - STRFTIME('%s', v.dateVirtual)) /60) /60) /24) countDayLast
                            FROM VirtualTemp v
                            GROUP BY v.codClient
                        )
                        SELECT
                            m.codClient,
                            m.nameClient,
                            m.dateVirtual,
                            m.countAttendance,
                            m.countDayLast
                        FROM listMissing m
                        WHERE m.countDayLast >= ?
                        AND m.countAttendance >= ?;`
            const result = await connectionToDatabase(sql, [codCompany, countDayLast, countAttendance] );
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },

    async birthday(options: IParamsBirthday): Promise<IResponseClient[]> {
        try {
            const { codCompany, month } = options;
            const optionsSchema = z.object({
                codCompany: handleZod.number('CodCompany'),
                month: handleZod.number('Número do mês'),
            });
            optionsSchema.parse(options);

            const sql = `select 
                            c.codClient,c.nameClient, c.emailClient, c.numberPhone, c.blocked, c.dateCreated, c.birthdayDate
                        from Client c
                        where CAST(STRFTIME('%m', c.birthdayDate) AS number) = ?
                        and c.codCompany = ?;`
            const result = await connectionToDatabase(sql, [month, codCompany] );
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
    
    async new(newClient: IParamsNewClient): Promise<ResultSet> {
        try {
            const { email, name, password, numberPhone, blocked, codCompany, birthdayDate, photo } = newClient;

            const UserSchema = z.object({
                name: handleZod.string('Nome', {min: 2}),
                email: handleZod.email().or(z.string().max(0)),
                password: handleZod.string('Senha', {min: 1}).optional().nullable(),
                numberPhone: handleZod.string('Número de Telefone', {min: 11, max: 14}).or(handleZod.string('Número de Telefone', {max: 0})),
                blocked: handleZod.boolean('Bloqueado').optional().nullable(),
                codCompany: handleZod.number('codCompany'),
                birthdayDate: handleZod.date('Data de nascimento').optional(),
                photo: handleZod.string('Foto').optional(),
            });
            UserSchema.parse(newClient);

            const isExist = await toolsSQL.isExist({
                table: 'Client',
                field: 'emailClient',
                value: email,
                condition: `codCompany = ${codCompany}`,
            });
            if(isExist) throw 'O Email inserido já está cadastrado. Tente outro por favor';
            
            const sql = `INSERT INTO Client 
                            (nameClient, emailClient, passwordClient, numberPhone, blocked, dateCreated, codCompany, birthdayDate, photo) 
                        VALUES 
                            (?, ?, ?, ?, ?, datetime('now', '-3 hours'), ?, ?, ?);
            `;
            const result = await connectionToDatabase(sql, [name, email.toLowerCase(), (password ?? ''), (numberPhone ?? ''), (blocked ?? false), codCompany, (birthdayDate ?? ''), (photo ?? '')] ) as ResultSet;
            // @ts-ignore
            result.lastInsertRowid = Number(result.lastInsertRowid);

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
    
    async update(newClient: IParamsUpdateClient): Promise<ResultSet> {
        try {
            const { codClient, nameClient, emailClient, blocked, password, numberPhone, birthdayDate, photo } = newClient;

            const UserSchema = z.object({
                codClient: handleZod.number('codClient'),
                nameClient: handleZod.string('Nome', { min: 2 }),
                emailClient: handleZod.email().or(handleZod.string('Email', {max: 0})),
                blocked: handleZod.boolean('Bloqueado'),
                password: handleZod.string('Senha').optional(),
                numberPhone: handleZod.string('Número de Telefone', {min: 11, max: 14}).or(handleZod.string('Número de Telefone', {max: 0}).optional()),
                birthdayDate: handleZod.date('Data de nascimento').optional(),
                photo: handleZod.string('Foto').optional(),
            });
            UserSchema.parse(newClient);

            // depois fazer uma verificação se o update vai atualizar email já existente

            const sql = `UPDATE Client SET 
                            nameClient = ?,
                            emailClient = ?,
                            ${lodash.isString(password) ? `passwordClient = '${tools.encrypt(password)}',` : ''}
                            ${lodash.isString(numberPhone) ? `numberPhone = '${numberPhone}',` : ''}
                            ${lodash.isString(birthdayDate) ? `birthdayDate = '${birthdayDate}',` : ''}
                            ${lodash.isString(photo) ? `photo = '${photo}',` : ''}
                            blocked = ?
                        WHERE codClient = ?;`
            const result = await connectionToDatabase(sql, [nameClient, emailClient, blocked, codClient] );

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
    
    async delete(newClient: IParamsDelete): Promise<ResultSet> {
        try {
            const { codClient } = newClient;
            const UserSchema = z.object({
                codClient: handleZod.number('codClient'),
            });
            UserSchema.parse(newClient);

            const sql = `DELETE FROM Client WHERE codClient = ?;`
            const result = await connectionToDatabase(sql, [codClient] );

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
}

interface IResponseClient {
    codClient: number,
    nameClient: string,
    emailClient: string,
    blocked: boolean,
    dateCreated: string,
    lastDayAttendance: string,
    birthdayDate?: string,
    photo?: string,
}

interface IParamsClientByEmail {
    email: string,
    codCompany: number,
}
export interface IResponseClientByEmail {
    codClient: number,
    nameClient: string,
    emailClient: string,
    passwordClient?: string,
    blocked: boolean,
    photo?: string,
}

interface IParamsNewClient {
    name: string,
    email: string,
    password?: string,
    numberPhone?: string,
    blocked?: boolean,
    codCompany: number,
    birthdayDate?: string,
    photo?: string,
}

interface IParamsUpdateClient {
    codClient: number,
    nameClient: string,
    emailClient: string,
    blocked: boolean,
    numberPhone?: string,
    password?: string,
    birthdayDate?: string,
    photo?: string,
}

interface IParamsGetBlockedOrNo {
    blocked: boolean,
    codCompany: number,
}

interface IParamsDelete {
    codClient: number,
}

interface IParamsMissing {
    codCompany: number,
    countDayLast: number,
    countAttendance: number,
}
interface IResponseMissing {
    codClient: number,
    nameClient: string,
    dateVirtual: string,
    countAttendance: number,
    countDayLast: number,
}
interface IParamsBirthday {
    codCompany: number,
    month: number,
}