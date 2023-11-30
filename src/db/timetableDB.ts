import { createConnection } from "./createConnection";

export const timetableDB = {
    async getAll() {
        try {
            const db = await createConnection();
            const sql = `select 
                            codTime, day, active, time01, time02, time03, time04
                        from Timetable;`;
            const [result] = await db.query(sql);
    
            db.end();
            return result;
        } catch (error) {
            return error;
        }
    },
    async get(codTime: number) {
        try {
            const db = await createConnection();
            const sql = `select 
                            codTime, day, active, time01, time02, time03, time04
                        from Timetable where codTime = ?;`;
            const [result] = await db.query(sql, [codTime]);
    
            db.end();
            return result;
        } catch (error) {
            return error;
        }
    },
    async updateTimetable(codTime: number, active: boolean, time01: string | null, time02: string | null, time03: string | null, time04: string | null) {
        try {
            const db = await createConnection();
            const sql = `   UPDATE Timetable SET
                                active = ?,
                                time01 = ?,
                                time02 = ?,
                                time03 = ?,
                                time04 = ?
                            WHERE codTime = ?;`;
            const [result] = await db.query(sql, [active, time01, time02, time03, time04, codTime]);
        
            db.commit();
            db.end();
            return result as any;
        } catch (error) {
            return error as any;
        };
    }
};