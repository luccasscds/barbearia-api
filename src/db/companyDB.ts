import { z } from 'zod';
import { IErrorSQL, IResponseDB } from '../routes/controllers/types';
import { createConnection } from './createConnection';
import { ResultSetHeader } from 'mysql2';
import { handleZod } from '../tools/handleZod';

export const companyDB = {
    async get(id: string | number): Promise<IResponse[] | IErrorSQL> {
        try {
            const idSchema = z.number(handleZod.params('ID', 'número'));
            idSchema.parse(Number(id || 'a'));

            const db = await createConnection();
            const sql = `select codCompany, name, photo, numberWhatsApp, nameInstagram, address from Company
                        where codCompany = ?;`
            const [result] = await db.query(sql, [id]) as any[];
    
            db.end();
            return result.length ? result[0] : null;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },

    async getByEmail(email: string): Promise<IResponseGetEmailCompany> {
        try {
            const EmailSchema = handleZod.email();
            EmailSchema.parse(email);

            const db = await createConnection();
            const sql = `select codCompany, name, blocked, emailCompany, password
                            from Company where emailCompany = ?;`
            const [result] = await db.query(sql, [email]) as any[];
    
            db.end();
            return result.length ? result[0] : null;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },

    async create(newCompany: IResponseCreateCompany) {
        try {
            const { name, photo, numberWhatsApp, nameInstagram, address, blocked, emailCompany, password } = newCompany;

            const newCompanySchema = z.object({
                name: z.string(handleZod.params('Nome', 'texto')),
                photo: z.string(handleZod.params('Foto', 'texto')).optional(),
                numberWhatsApp: z.string(handleZod.params('Número de WhatsApp', 'texto')),
                nameInstagram: z.string(handleZod.params('User do Instagram', 'texto')).optional(),
                address: z.string(handleZod.params('Endereço', 'texto')).optional(),
                blocked: z.boolean(handleZod.params('Bloqueio', 'boolean')).optional(),
                emailCompany: handleZod.email(),
                password: z.string(handleZod.params('Senha', 'texto')).min(1, 'O campo Senha deve conter pelo menos 1 caractere(s)'),
            });
            newCompanySchema.parse({ newCompany });

            const db = await createConnection();
            const sql = `   INSERT INTO Client 
                                (name, photo, numberWhatsApp, nameInstagram, address, blocked, emailCompany, password) 
                            VALUES 
                                (?, ?, ?, ?, ?, ?, ?, ?);`
            const [result] = await db.query(sql, [name, (photo ?? ''), numberWhatsApp, (nameInstagram ?? ''), (address ?? ''), (blocked ?? false), emailCompany, password]);
        
            db.commit();
            db.end();
            
            if((result as ResultSetHeader).affectedRows === 0) {
                throw 'Houve algo erro, nenhum resultado(s) inserido(s)';
            };

            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        };
    },
    async update(newCompany: IResponse): Promise<IResponseDB> {
        try {
            const { name, photo, numberWhatsApp, nameInstagram, address, codCompany } = newCompany;

            const newCompanySchema = z.object({
                codCompany: z.number(handleZod.params('codCompany', 'número')),
                name: z.string(handleZod.params('Nome', 'texto')),
                photo: z.string(handleZod.params('Foto', 'texto')),
                numberWhatsApp: z.string(handleZod.params('Número de WhatsApp', 'texto')),
                nameInstagram: z.string(handleZod.params('User do Instagram', 'texto')),
                address: z.string(handleZod.params('Endereço', 'texto')),
            });
            newCompanySchema.parse({
                ...newCompany,
                codCompany: Number(codCompany || 'a'),
            });

            const db = await createConnection();
            const sql = `   UPDATE Company SET 
                            name = ?,
                            photo = ?,
                            numberWhatsApp = ?,
                            nameInstagram = ?,
                            address = ?
                            WHERE codCompany = ?;`
            const [result] = await db.query(sql, [name, photo, numberWhatsApp, nameInstagram, address, codCompany]);
        
            db.commit();
            db.end();
            
            if((result as ResultSetHeader).affectedRows === 0) {
                throw 'Houve algo erro, nenhum resultado(s) inserido(s)';
            };

            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        };
    },
}

interface IResponse {
    codCompany: number,
    name: string,
    photo: string,
    numberWhatsApp: string,
    nameInstagram: string,
    address: string,
}

interface IResponseGetEmailCompany {
    codCompany: number,
    name: string,
    blocked: boolean,
    password?: string,
    emailCompany: string,
}

interface IResponseCreateCompany {
    name: string,
    emailCompany: string,
    password?: string,
    numberWhatsApp?: string,

    blocked?: boolean,
    photo?: string,
    nameInstagram?: string,
    address?: string,
}