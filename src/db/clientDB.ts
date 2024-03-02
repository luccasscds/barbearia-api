import { ZodError, z } from 'zod';
import { IErrorSQL, IResponseDB } from '../routes/controllers/types';
import { createConnection } from './createConnection';
import { ResultSetHeader } from 'mysql2';

export const clientDB = {
    async getAll(): Promise<IResponseClient[] | IErrorSQL> {
        try {
            const db = await createConnection();
            const sql = `select codClient, nameClient, emailClient, numberPhone, blocked
                        from Client 
                        where isADM = false
                        and blocked = false;`
            const [result] = await db.query(sql);
    
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },

    async getBlockedOrNo(blocked: boolean): Promise<IResponseClient[] | IErrorSQL> {
        try {
            const db = await createConnection();
            const sql = `select codClient, nameClient, emailClient, numberPhone, blocked
                        from Client 
                        where blocked = ?
                        and isADM = false;`
            const [result] = await db.query(sql, [blocked]);
    
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },

    async get(id: number): Promise<IResponseClient[] | IErrorSQL> {
        try {
            const idSchema = z.number();
            idSchema.parse(id);

            const db = await createConnection();
            const sql = `   select codClient, nameClient, emailClient, numberPhone, blocked
                            from Client where codClient = ?;`
            const [result] = await db.query(sql, [id]) as any[];
    
            db.end();
            return result.length ? result[0] : null;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error;
        }
    },

    async getByEmail(email: string): Promise<IResponseClientByEmail> {
        try {
            const EmailSchema = z.string({
                required_error: 'Campo Email não pode ser vazio'
            }).email('Email inválido');
            EmailSchema.parse(email);

            const db = await createConnection();
            const sql = `select codClient, nameClient, emailClient, passwordClient, isADM, blocked
                            from Client where emailClient = ?;`
            const [result] = await db.query(sql, [email]) as any[];
    
            db.end();
            return result.length ? result[0] : null;
        } catch (error) {
            const errorZod = (error as unknown as ZodError);
            if(errorZod?.issues.length) error = errorZod.issues[0];
            throw error as any;
        }
    },
    
    async new(newClient: IParamsNewClient): Promise<IResponseDB> {
        try {
            const { email, name, password, isADM, numberPhone, blocked } = newClient;

            const UserSchema = z.object({
                name: z.string({ required_error: 'Campo Nome não pode ser vazio' }).min(2, { message: 'O campo Nome deve conter pelo menos 2 caractere(s)' }),
                email: z.string().email('Email inválido').or(z.string().max(0)),
                password: z.string().min(1, 'O campo Senha deve conter pelo menos 1 caractere(s)').optional().nullable(),
                isADM: z.boolean().optional().nullable(),
                numberPhone: z.string().min(11, {message: 'O campo Telefone deve conter pelo menos 11 caractere(s)'}).max(14, {message: 'O campo Telefone deve conter máximo 14 caractere(s)'}).or(z.string().max(0)),
                blocked: z.boolean().optional().nullable(),
            });
            UserSchema.parse(newClient);
            
            const db = await createConnection();
            const sql = `INSERT INTO Client 
                            (nameClient, emailClient, passwordClient, isADM, numberPhone, blocked) 
                        VALUES 
                            (?, ?, ?, ?, ?, ?);
            `;
            const [result] = await db.query(sql, [name, email, (password ?? ''), (isADM ?? false), (numberPhone ?? ''), (blocked ?? false)]);

            db.commit();
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        };
    },
    
    async update(newClient: IParamsUpdateClient): Promise<IResponseDB> {
        try {
            const { id, name, email, blocked, password } = newClient;

            const UserSchema = z.object({
                id: z.number({invalid_type_error: 'Campo ID precisa ser número'}),
                name: z.string({ required_error: 'Campo Nome não pode ser vazio', invalid_type_error: 'Campo Nome precisa ser texto' }).min(2, { message: 'O campo Nome deve conter pelo menos 2 caractere(s)' }),
                email: z.string().email('Email inválido'),
                blocked: z.boolean({invalid_type_error: 'Campo Bloqueado precisa ser boolean'}),
                password: z.string().optional(),
            });
            UserSchema.parse(newClient);

            const db = await createConnection();
            let sql = '';
            let result;

            if(password) {
                sql = `   UPDATE Client SET 
                                nameClient = ?,
                                emailClient = ?,
                                passwordClient = ?,
                                blocked = ?
                                WHERE codClient = ?;`
                result = await db.query(sql, [name, email, password, blocked, id]);
            } else {
                sql = `   UPDATE Client SET 
                                nameClient = ?,
                                emailClient = ?,
                                blocked = ?
                                WHERE codClient = ?;`
                result = await db.query(sql, [name, email, blocked, id]);
            };

            if((result[0] as ResultSetHeader).affectedRows === 0) {
                throw 'Houve algo erro, nenhum resultado(s) inserido(s)';
            };

            db.commit();
            db.end();
            return result[0] as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        };
    },
    
    async delete(id: number): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `DELETE FROM Client WHERE codClient = ?;`
            const [result] = await db.query(sql, [id]);
        
            db.commit();
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
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
}

interface IParamsNewClient {
    name: string,
    email: string,
    password?: string,
    isADM?: boolean,
    numberPhone?: string,
    blocked?: boolean,
}

interface IParamsUpdateClient {
    id: number,
    name: string,
    email: string,
    blocked: boolean,
    password?: string,
}