import { IErrorSQL } from '../routes/controllers/types';
import { createConnection } from './createConnection';

export const tagsDB = {
    async getAll(): Promise<IResponseTags[] | IErrorSQL> {
        try {            
            const db = await createConnection();
            const sql = `select codStatus, name
                        from Status;`
            const [result] = await db.query(sql);
    
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        }
    },
    async insertData() {
        try {
            const db = await createConnection();
            const sql = `   INSERT INTO Status (codStatus, codCompany, name) VALUES
                            (1, 'Nenhum'),
                            (2, 'Confirmado'),
                            (3, 'Não confirmou'),
                            (4, 'Atrasou'),
                            (5, 'Cancelado'),
                            (6, 'Não comparecimento'),
                            (7, 'Pagou a taxa'),
                            (8, 'Pago');`;
            const [result] = await db.query(sql);
        
            db.commit();
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            return error as any;
        };
    }
}

interface IResponseTags {
    codStatus: number,
    name: string,
}