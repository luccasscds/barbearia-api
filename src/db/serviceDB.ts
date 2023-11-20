import { createConnection } from "./createConnection";

export const serviceDB = {
    async getAll() {
        try {
            const db = await createConnection();
            const sql = `select 
                            codService, nameService, price, durationMin 
                        from Service;`;
            const [result] = await db.query(sql);
    
            db.end();
            return result;
        } catch (error) {
            return error;
        }
    }
};