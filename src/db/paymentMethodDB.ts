import { createConnection } from "./createConnection";

export const paymentMethodDB = {
    async getAll() {
        try {
            const db = await createConnection();
            const sql = `select codPay, name from PaymentMethod;`;
            const [result] = await db.query(sql, []);
    
            db.end();
            return result as any;
        } catch (error) {
            return error as any;
        }
    },
}