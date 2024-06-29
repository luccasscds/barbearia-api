import { z } from 'zod';
import { connectionToDatabase } from './createConnection';
import { ResultSet } from '@libsql/client/.';
import { handleZod } from '../tools/handleZod';
import { toolsSQL } from '../tools/toolsSQL';

export const companyDB = {
    async get(id: string | number): Promise<IResponse> {
        try {
            const idSchema = handleZod.number('ID');
            idSchema.parse(Number(id || 'a'));

            const sql = `select codCompany, name, photo, numberWhatsApp, nameInstagram, address, slug, nameSecund
                        from Company
                        where codCompany = ?;`
            const [result] = await connectionToDatabase(sql, [id]) as any;
            
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async getBySlug(slug: string): Promise<number | null> {
        try {
            const idSchema = handleZod.string('slug');
            idSchema.parse(slug);

            const sql = `select codCompany
                        from Company where slug = ?;`;
            const [result] = await connectionToDatabase(sql, [slug]) as any;
            
            return result?.codCompany;
        } catch (error) {
            throw error as any;
        }
    },

    async getByEmail(email: string): Promise<IResponseGetEmailCompany> {
        try {
            const EmailSchema = handleZod.email();
            EmailSchema.parse(email);

            const sql = `select codCompany, 
                                name,
                                blocked,
                                emailCompany,
                                password,
                                photo,
                                numberWhatsApp,
                                nameInstagram,
                                address,
                                slug,
                                nameSecund
                            from Company where emailCompany = ?;`;
            const [result] = await connectionToDatabase(sql, [email]) as any;
                        
            return result;
        } catch (error) {
            throw error as any;
        }
    },

    async create(newCompany: IResponseCreateCompany) {
        try {
            const { name, photo, numberWhatsApp, nameInstagram, address, blocked, emailCompany, password } = newCompany;

            const newCompanySchema = z.object({
                name: handleZod.string('Nome'),
                photo: handleZod.string('Foto').optional(),
                numberWhatsApp: handleZod.string('Número de WhatsApp'),
                nameInstagram: handleZod.string('User do Instagram').optional(),
                address: handleZod.string('Endereço').optional(),
                blocked: handleZod.boolean('Bloqueio').optional(),
                emailCompany: handleZod.email(),
                password: handleZod.string('Senha', {min: 1}),
            });
            newCompanySchema.parse(newCompany);

            const sql = `   INSERT INTO Company 
                                (name, photo, numberWhatsApp, nameInstagram, address, blocked, emailCompany, password) 
                            VALUES 
                                (?, ?, ?, ?, ?, ?, ?, ?);`;
            const result = await connectionToDatabase(sql, [name, (photo ?? ''), numberWhatsApp, (nameInstagram ?? ''), (address ?? ''), (blocked ?? false), emailCompany.toLowerCase(), password]) as ResultSet;

            return result;
        } catch (error) {
            throw error as any;
        };
    },
    async update(newCompany: IResponse): Promise<ResultSet> {
        try {
            const { name, photo, numberWhatsApp, nameInstagram, address, codCompany, slug, nameSecund, password } = newCompany;

            const newCompanySchema = z.object({
                codCompany: handleZod.number('codCompany'),
                name: handleZod.string('Nome'),
                photo: handleZod.string('Foto'),
                numberWhatsApp: handleZod.string('Número de WhatsApp'),
                nameInstagram: handleZod.string('User do Instagram'),
                address: handleZod.string('Endereço'),
                slug: handleZod.string('Slug').optional().nullable(),
                nameSecund: handleZod.string('NameSecund').optional().nullable(),
                password: handleZod.string('Senha').optional(),
            });
            newCompanySchema.parse({
                ...newCompany,
                codCompany: Number(codCompany || 'a'),
            });

            const isExist = await toolsSQL.isExist({ field: 'slug', value: slug!, table: 'Company'});
            if(isExist && isExist > 1) throw 'O Caminho para o site (campo slug) já existe, por favor escolha outro';

            const sql = `   UPDATE Company SET 
                            name = ?,
                            photo = ?,
                            numberWhatsApp = ?,
                            nameInstagram = ?,
                            address = ?,
                            slug = ?,
                            ${password ? `password = '${password}',` : ''}
                            nameSecund = ?
                            WHERE codCompany = ?;`
            const result = await connectionToDatabase(sql, [name, photo, numberWhatsApp, nameInstagram, address, slug, nameSecund, codCompany]) as ResultSet;

            return result;
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
    slug?: string,
    nameSecund?: string,
    password?: string,
}

interface IResponseGetEmailCompany {
    codCompany: number,
    name: string,
    blocked: boolean,
    password?: string,
    emailCompany: string,
    photo: string,
    numberWhatsApp: string,
    nameInstagram: string,
    address: string,
    slug: string,
    nameSecund: string,
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