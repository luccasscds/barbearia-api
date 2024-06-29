import { connectionToDatabase } from "./createConnection";

export const paymentMethodDB = {
    async getAll() {
        try {
            const sql = `select codPay, name from PaymentMethod;`;
            const result = await connectionToDatabase(sql);
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
    async insertData() {
        try {
            const sql = `   INSERT INTO PaymentMethod (name) VALUES
                            ('Nenhum'),
                            ('Dinheiro'),
                            ('Transferência/PIX'),
                            ('Cartão de Crédito'),
                            ('Cartão de Débito'),
                            ('Cheque'),
                            ('Cortesia');`;
            const result = await connectionToDatabase(sql);
        
            return result as any;
        } catch (error) {
            throw error as any;
        };
    }
}