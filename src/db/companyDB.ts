import { z } from 'zod';
import { IErrorSQL, IResponseDB } from '../routes/controllers/types';
import { createConnection } from './createConnection';
import { ResultSetHeader } from 'mysql2';

export const companyDB = {
    async get(id: string): Promise<IResponse[] | IErrorSQL> {
        try {
            const idSchema = z.number({ invalid_type_error: 'O campo ID precisa ser número' });
            idSchema.parse(Number(id || 'a'));

            const db = await createConnection();
            const sql = `select codCompany, name, photo, numberWhatsApp, nameInstagram, address from Company
                        where codCompany = ?;`
            const [result] = await db.query(sql, [id]);
    
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },

    async update(newCompany: IResponse): Promise<IResponseDB> {
        try {
            const { name, photo, numberWhatsApp, nameInstagram, address, codCompany } = newCompany;

            const newCompanySchema = z.object({
                codCompany: z.number({ invalid_type_error: 'O campo CodCompany precisa ser número' }),
                name: z.string(),
                photo: z.string(),
                numberWhatsApp: z.string(),
                nameInstagram: z.string(),
                address: z.string(),
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