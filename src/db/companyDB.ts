import { z } from 'zod';
import { connectionToDatabase } from './createConnection';
import { ResultSet } from '@libsql/client/.';
import { handleZod } from '../tools/handleZod';

export const companyDB = {
    async get(id: string | number): Promise<IResponse[]> {
        try {
            const idSchema = z.number(handleZod.params('ID', 'número'));
            idSchema.parse(Number(id || 'a'));

            const sql = `select codCompany, name, photo, numberWhatsApp, nameInstagram, address 
                        from Company
                        where codCompany = ?;`
            const result = await connectionToDatabase(sql, [id]);
            
            return result[0] ?? result;
        } catch (error) {
            throw error as any;
        }
    },

    async getByEmail(email: string): Promise<IResponseGetEmailCompany> {
        try {
            const EmailSchema = handleZod.email();
            EmailSchema.parse(email);

            const sql = `select codCompany, name, blocked, emailCompany, password
                            from Company where emailCompany = ?;`;
            const result = await connectionToDatabase(sql, [email]);
            
            return result[0] ?? result;
        } catch (error) {
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

            const sql = `   INSERT INTO Company 
                                (name, photo, numberWhatsApp, nameInstagram, address, blocked, emailCompany, password) 
                            VALUES 
                                (?, ?, ?, ?, ?, ?, ?, ?);`;
            const result = await connectionToDatabase(sql, [name, (photo ?? ''), numberWhatsApp, (nameInstagram ?? ''), (address ?? ''), (blocked ?? false), emailCompany, password]);

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
    async update(newCompany: IResponse): Promise<ResultSet> {
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

            const sql = `   UPDATE Company SET 
                            name = ?,
                            photo = ?,
                            numberWhatsApp = ?,
                            nameInstagram = ?,
                            address = ?
                            WHERE codCompany = ?;`
            const result = await connectionToDatabase(sql, [name, photo, numberWhatsApp, nameInstagram, address, codCompany]);

            return result as any;
        } catch (error) {
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