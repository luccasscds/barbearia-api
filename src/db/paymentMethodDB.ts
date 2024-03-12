import { createConnection } from "./createConnection";

export const paymentMethodDB = {
    async getAll() {
        try {
            const db = await createConnection();
            const sql = `select codPay, name from PaymentMethod;`;
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
            const sql = `   INSERT INTO PaymentMethod (name) VALUES
                            ('Nenhum'),
                            ('Dinheiro'),
                            ('Transferência/PIX'),
                            ('Cartão de Crédito'),
                            ('Cartão de Débito'),
                            ('Cheque'),
                            ('Cortesia');`;
            const [result] = await db.query(sql);
        
            db.commit();
            db.end();
            return result as any;
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            throw error as any;
        };
    }
}