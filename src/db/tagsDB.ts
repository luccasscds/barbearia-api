import { connectionToDatabase } from './createConnection';

export const tagsDB = {
    async getAll(): Promise<IResponseTags[]> {
        try {
            const sql = `select codStatus, name
                        from Status;`
            const result = await connectionToDatabase(sql);
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
    async insertData() {
        try {
            const sql = `   INSERT INTO Status (codStatus, codCompany, name) VALUES
                            (1, 'Nenhum'),
                            (2, 'Confirmado'),
                            (3, 'Não confirmou'),
                            (4, 'Atrasou'),
                            (5, 'Cancelado'),
                            (6, 'Não comparecimento'),
                            (7, 'Pagou a taxa'),
                            (8, 'Pago');`;
            const result = await connectionToDatabase(sql);
        
            return result as any;
        } catch (error) {
            throw error as any;
        };
    }
}

interface IResponseTags {
    codStatus: number,
    name: string,
}