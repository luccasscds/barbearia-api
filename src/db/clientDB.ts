import { z } from 'zod';
import { connectionToDatabase } from './createConnection';
import { handleZod } from '../tools/handleZod';
import { ResultSet } from '@libsql/client/.';

export const clientDB = {
    async getAll(codCompany: number): Promise<IResponseClient[]> {
        try {
            const codCompanySchema = z.number(handleZod.params('CodCompany', 'número'));
            codCompanySchema.parse(codCompany);

            const sql = `select codClient, nameClient, emailClient, numberPhone, blocked
                        from Client 
                        where isADM = false
                        and blocked = false
                        AND codCompany = ?;`
            const result = await connectionToDatabase(sql, [codCompany] );
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },

    async getBlockedOrNo(newClient: IParamsGetBlockedOrNo): Promise<IResponseClient[]> {
        try {
            const UserSchema = z.object({
                blocked: z.boolean(handleZod.params('Bloqueado', 'boolean')),
                codCompany: z.number(handleZod.params('codCompany', 'número')),
            });
            UserSchema.parse(newClient);

            const { blocked, codCompany } = newClient;
            const sql = `select codClient, nameClient, emailClient, numberPhone, blocked
                        from Client 
                        where blocked = ?
                        AND codCompany = ?;`
            const result = await connectionToDatabase(sql, [blocked, codCompany] );
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },

    async get(id: number): Promise<IResponseClient[]> {
        try {
            const idSchema = z.number();
            idSchema.parse(id);

            const sql = `   select codClient, nameClient, emailClient, numberPhone, blocked
                            from Client 
                            where codClient = ?;`
            const result = await connectionToDatabase(sql, [id] );
    
            return result[0] ?? result;
        } catch (error) {
            throw error;
        }
    },

    async getByEmail(email: string): Promise<IResponseClientByEmail> {
        try {
            const EmailSchema = handleZod.email();
            EmailSchema.parse(email);

            const sql = `select codClient, nameClient, emailClient, passwordClient, isADM, blocked, codCompany
                            FROM Client
                            WHERE emailClient = ?;`
            const result = await connectionToDatabase(sql, [email] );
    
            return result[0] ?? result;
        } catch (error) {
            throw error as any;
        }
    },
    
    async new(newClient: IParamsNewClient): Promise<ResultSet> {
        try {
            const { email, name, password, isADM, numberPhone, blocked, codCompany } = newClient;

            const UserSchema = z.object({
                name: z.string(handleZod.params('Nome', 'texto')).min(2, { message: 'O campo Nome deve conter pelo menos 2 caractere(s)' }),
                email: handleZod.email().or(z.string().max(0)),
                password: z.string(handleZod.params('Senha', 'texto')).min(1, 'O campo Senha deve conter pelo menos 1 caractere(s)').optional().nullable(),
                isADM: z.boolean(handleZod.params('isADM', 'boolean')).optional().nullable(),
                numberPhone: z.string(handleZod.params('Número de Telefone', 'texto')).min(11, {message: 'O campo Telefone deve conter pelo menos 11 caractere(s)'}).max(14, {message: 'O campo Telefone deve conter máximo 14 caractere(s)'}).or(z.string().max(0)),
                blocked: z.boolean(handleZod.params('Bloqueado', 'boolean')).optional().nullable(),
                codCompany: z.number(handleZod.params('codCompany', 'número')),
            });
            UserSchema.parse(newClient);

            if(await clientDB.isExist(email)) throw 'O Email inserido já está cadastrado';
            
            const sql = `INSERT INTO Client 
                            (nameClient, emailClient, passwordClient, isADM, numberPhone, blocked, codCompany) 
                        VALUES 
                            (?, ?, ?, ?, ?, ?, ?);
            `;
            const result = await connectionToDatabase(sql, [name, email, (password ?? ''), (isADM ?? false), (numberPhone ?? ''), (blocked ?? false), codCompany] );

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
    
    async update(newClient: IParamsUpdateClient): Promise<ResultSet> {
        try {
            const { id, name, email, blocked, password, codCompany } = newClient;

            const UserSchema = z.object({
                id: z.number(handleZod.params('ID', 'número')),
                name: z.string(handleZod.params('Nome', 'texto')).min(2, { message: 'O campo Nome deve conter pelo menos 2 caractere(s)' }),
                email: handleZod.email(),
                blocked: z.boolean(handleZod.params('Bloqueado', 'boolean')),
                password: z.string(handleZod.params('Senha', 'texto')).optional(),
                codCompany: z.number(handleZod.params('codCompany', 'número')),
            });
            UserSchema.parse(newClient);

            let sql = '';
            let result;

            if(password) {
                sql = `   UPDATE Client SET 
                                nameClient = ?,
                                emailClient = ?,
                                passwordClient = ?,
                                blocked = ?
                                WHERE codClient = ?
                                AND codCompany = ?;`
                result = await connectionToDatabase(sql, [name, email, password, blocked, id, codCompany] );
            } else {
                sql = `   UPDATE Client SET 
                                nameClient = ?,
                                emailClient = ?,
                                blocked = ?
                                WHERE codClient = ?
                                AND codCompany = ?;`
                result = await connectionToDatabase(sql, [name, email, blocked, id, codCompany] );
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
                codClient: z.number(handleZod.params('codClient', 'número')),
                codCompany: z.number(handleZod.params('codCompany', 'número')),
            });
            UserSchema.parse(newClient);

            const sql = `DELETE FROM Client 
                        WHERE codClient = ?
                        AND codCompany = ?;`
            const result = await connectionToDatabase(sql, [codClient, codCompany] );

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },

    async isExist(email: string): Promise<number|undefined> {
        try {
            if(!email) return;

            const sql = `SELECT 1 FROM Client
                        WHERE emailClient = ?`;
            const result = await connectionToDatabase(sql, [email] );
        
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
}

export interface IResponseClientByEmail {
    codClient: number,
    nameClient: string,
    emailClient: string,
    passwordClient?: string,
    isADM: boolean,
    blocked: boolean,
    codCompany: number,
}

interface IParamsNewClient {
    name: string,
    email: string,
    password?: string,
    isADM?: boolean,
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
    codCompany: number,
}

interface IParamsGetBlockedOrNo {
    blocked: boolean,
    codCompany: number,
}

interface IParamsDelete {
    codClient: number,
    codCompany: number,
}