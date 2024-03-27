import { handleError } from "./handleError";
import { connectionToDatabase } from "../db/createConnection";

export const toolsSQL = {
    async isExist(options: { field: string, value: string, table: string }) {
        try {
            if(!options.field || !options.value || !options.table) return;

            const sql = `SELECT count(*) counts from ${options.table}
                        WHERE ? = ?`;
            const result = await connectionToDatabase(sql, [options.field, options.value] ) as any[];
            
            return result[0].counts as number;
        } catch (error) {
            throw handleError(error);
        };
    },
}