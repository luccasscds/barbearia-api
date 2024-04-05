import { z } from 'zod';
import { connectionToDatabase } from './createConnection';
import { handleZod } from '../tools/handleZod';
import { ResultSet } from '@libsql/client/.';
import { toolsSQL } from '../tools/toolsSQL';

export const clientDB = {
    async getAll(codCompany: number): Promise<IResponseClient[]> {
        try {
            const codCompanySchema = handleZod.number('CodCompany');
            codCompanySchema.parse(codCompany);

            const sql = `select c.codClient, c.nameClient, c.emailClient, c.numberPhone, c.blocked
                        from Client c, CompanyClient cc
                        WHERE c.blocked = false
                        AND c.codClient = cc.codClient
                        AND cc.codCompany = ?;`
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
                        from Client c, CompanyClient cc
                        where c.blocked = ?
                        AND c.codClient = cc.codClient
                        AND cc.codCompany = ?;`
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

            const sql = `   select codClient, nameClient, emailClient, numberPhone, blocked, dateCreated
                            from Client 
                            where codClient = ?;`
            const [result] = await connectionToDatabase(sql, [id] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async getByEmail(email: string): Promise<IResponseClientByEmail | undefined> {
        try {
            const EmailSchema = handleZod.email();
            EmailSchema.parse(email);

            const sql = `select codClient, nameClient, emailClient, passwordClient, blocked
                            FROM Client
                            WHERE emailClient = ?;`
            const [result] = await connectionToDatabase(sql, [email.toLowerCase()] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    
    async new(newClient: IParamsNewClient): Promise<ResultSet> {
        try {
            const { email, name, password, numberPhone, blocked, codCompany } = newClient;

            const UserSchema = z.object({
                name: handleZod.string('Nome', {min: 2}),
                email: handleZod.email().or(z.string().max(0)),
                password: handleZod.string('Senha', {min: 1}).optional().nullable(),
                numberPhone: handleZod.string('Número de Telefone', {min: 11, max: 14}).or(handleZod.string('Número de Telefone', {max: 0})),
                blocked: handleZod.boolean('Bloqueado').optional().nullable(),
                codCompany: handleZod.number('codCompany'),
            });
            UserSchema.parse(newClient);

            const isExist = await toolsSQL.isExist({
                field: 'emailClient',
                value: email,
                table: 'Client',
            });
            if(isExist) throw 'O Email inserido já está cadastrado. Tente outro por favor';
            
            const sql = `INSERT INTO Client 
                            (nameClient, emailClient, passwordClient, numberPhone, blocked, dateCreated) 
                        VALUES 
                            (?, ?, ?, ?, ?, datetime('now', '-3 hours'));
            `;
            const result = await connectionToDatabase(sql, [name, email.toLowerCase(), (password ?? ''), (numberPhone ?? ''), (blocked ?? false)] ) as ResultSet;
            // @ts-ignore
            result.lastInsertRowid = Number(result.lastInsertRowid);
            await clientDB.createCompanyClient({
                // @ts-ignore
                codClient: result.lastInsertRowid!,
                codCompany
            });

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
    
    async update(newClient: IParamsUpdateClient): Promise<ResultSet> {
        try {
            const { id, name, email, blocked, password } = newClient;

            const UserSchema = z.object({
                id: handleZod.number('codClient'),
                name: handleZod.string('Nome', { min: 2 }),
                email: handleZod.email(),
                blocked: handleZod.boolean('Bloqueado'),
                password: handleZod.string('Senha').optional(),
            });
            UserSchema.parse(newClient);

            let sql = '';
            let result;

            // depois fazer uma verificação se o update vai atualizar email já existente

            if(password) {
                sql = `   UPDATE Client SET 
                                nameClient = ?,
                                emailClient = ?,
                                passwordClient = ?,
                                blocked = ?
                                WHERE codClient = ?;`
                result = await connectionToDatabase(sql, [name, email, password, blocked, id] );
            } else {
                sql = `   UPDATE Client SET 
                                nameClient = ?,
                                emailClient = ?,
                                blocked = ?
                                WHERE codClient = ?;`
                result = await connectionToDatabase(sql, [name, email, blocked, id] );
            };

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
    
    async delete(newClient: IParamsDelete): Promise<ResultSet> {
        try {
            const { codClient, codCompany } = newClient;
            const UserSchema = z.object({
                codClient: handleZod.number('codClient'),
                codCompany: handleZod.number('codCompany'),
            });
            UserSchema.parse(newClient);

            // const sql = `DELETE FROM Client 
            //             WHERE codClient = ?;`
            // const result = await connectionToDatabase(sql, [codClient] );

            const result = await connectionToDatabase(`
                DELETE FROM CompanyClient 
                WHERE codClient = ?
                AND codCompany = ?;`,
                [codClient, codCompany]
            );

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },

    async isExistEmailOnCompanyClient(email: string, codCompany: number) {
        try {
            const UserSchema = z.object({
                email: handleZod.email(),
                codCompany: handleZod.number('codCompany'),
            });
            UserSchema.parse({ email, codCompany });
    
            const [existEmail] = await connectionToDatabase(`
                select count(c.codClient) exist
                from Client c, CompanyClient cc
                WHERE c.codClient = cc.codClient
                AND c.emailClient = ?
                AND cc.codCompany = ?;
            `, [ email.toLowerCase(), codCompany ]) as any;
    
            return !!existEmail.exist;
        } catch (error) {
            throw error as any;
        }
    },

    async createCompanyClient(values: { codClient: number, codCompany: number }) {
        try {
            const { codClient, codCompany } = values;
            const UserSchema = z.object({
                codClient: handleZod.number('codClient').or(handleZod.bigint('codClient')),
                codCompany: handleZod.number('codCompany'),
            });
            UserSchema.parse(values);

            const sql = `INSERT INTO CompanyClient 
                            (codClient, codCompany)
                        VALUES 
                            (?, ?);`;
            await connectionToDatabase(sql, [codClient, codCompany] );
        } catch (error) {
            throw error as any;
        }
    }
}

interface IResponseClient {
    codClient: number,
    nameClient: string,
    emailClient: string,
    blocked: boolean,
    dateCreated: string,
}

export interface IResponseClientByEmail {
    codClient: number,
    nameClient: string,
    emailClient: string,
    passwordClient?: string,
    blocked: boolean,
}

interface IParamsNewClient {
    name: string,
    email: string,
    password?: string,
    numberPhone?: string,
    blocked?: boolean,
    codCompany: number,
}

interface IParamsUpdateClient {
    id: number,
    name: string,
    email: string,
    blocked: boolean,
    password?: string,
}

interface IParamsGetBlockedOrNo {
    blocked: boolean,
    codCompany: number,
}

interface IParamsDelete {
    codClient: number,
    codCompany: number,
}