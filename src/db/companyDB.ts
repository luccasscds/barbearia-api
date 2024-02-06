import { IErrorSQL, IResponseDB } from '../routes/controllers/types';
import { createConnection } from './createConnection';

export const companyDB = {
    async get(id: string): Promise<IResponse[] | IErrorSQL> {
        try {
            const db = await createConnection();
            const sql = `select codCompany, name, photo, numberWhatsApp, nameInstagram, address from Company
                        where codCompany = ?;`
            const [result] = await db.query(sql, [id]);
    
            db.end();
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },

    async update(newCompany: IResponse): Promise<IResponseDB> {
        try {
            const { name, photo, numberWhatsApp, nameInstagram, address, codCompany } = newCompany;
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