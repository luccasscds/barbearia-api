import { ZodError, z } from 'zod';
import { IErrorSQL, IResponseDB } from '../routes/controllers/types';
import { createConnection } from './createConnection';

export const clientDB = {
    async getAll(): Promise<IResponseClient[] | IErrorSQL> {
        try {
            const db = await createConnection();
            const sql = `select codClient, nameClient, emailClient, numberPhone
                        from Client where isADM = false;`
            const [result] = await db.query(sql);
    
            db.end();
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },

    async get(id: number): Promise<IResponseClient[] | IErrorSQL> {
        try {
            const db = await createConnection();
            const sql = `   select codClient, nameClient, emailClient, numberPhone
                            from Client where codClient = ?;`
            const [result] = await db.query(sql, [id]);
    
            db.end();
            return result as any;
        } catch (error) {
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
            const sql = `select codClient, nameClient, passwordClient, isADM
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
            const { email, name, password, isADM, numberPhone } = newClient;
            const db = await createConnection();
            const sql = `INSERT INTO Client 
                            (nameClient, emailClient, passwordClient, isADM, numberPhone) 
                        VALUES 
                            (?, ?, ?, ?, ?);
            `;
            const [result] = await db.query(sql, [name, email, (password ?? ''), (isADM ?? false), (numberPhone ?? '')]);

            db.commit();
            db.end();
            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
    
    async update(id: number, name: string, email: string): Promise<IResponseDB> {
        try {
            const db = await createConnection();
            const sql = `   UPDATE Client SET 
                            nameClient = ?,
                            emailClient = ?
                            WHERE codClient = ?;`
            const [result] = await db.query(sql, [name, email, id]);
        
            db.commit();
            db.end();
            return result as any;
        } catch (error) {
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
            throw error as any;
        };
    },
}

interface IResponseClient {
    codClient: number,
    nameClient: string,
    emailClient: string,
}

interface IResponseClientByEmail {
    codClient: number,
    nameClient: string,
    passwordClient?: string,
    isADM: boolean,
}

interface IParamsNewClient {
    name: string,
    email: string,
    password?: string,
    isADM?: boolean,
    numberPhone?: string,
}