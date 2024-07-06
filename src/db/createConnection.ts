import { Client, ResultSet, Transaction, createClient } from "@libsql/client";
import { handleError } from "../tools/handleError";

export async function connectionToDatabase(sql: string, args: any[] = [], executeMultiple = false) {
    let DB: Client | undefined;
    try {
        if (!process.env.DATABASE_URL || !process.env.DATABASE_TOKEN) throw 'Não está configurado a variável DATABASE_URL ou DATABASE_TOKEN.';
        
        DB = createClient({
            url: process.env.DATABASE_URL,
            authToken: process.env.DATABASE_TOKEN,
        });
    
        const result = executeMultiple ? 
            await DB.executeMultiple(sql)
            : await DB.execute({ sql, args })
        ;
        
        if(executeMultiple) {
            return [];
        } else if(/insert|update|delete/gi.test(sql)) {
            if((result as ResultSet).rowsAffected === 0) {
                throw 'Houve algo erro, nenhum resultado(s) inserido(s)';
            };
            return result;
        } else {
            return result?.rows;
        }
    } catch (error) {
        throw handleError(error);
    } finally {
        if(DB) DB.close();
    }
};

export async function transactionToDatabase(executeMultiple: (transaction: Transaction) => Promise<void>) {
    let DB: Client | undefined;
    let transaction: Transaction | undefined;
    try {
        if (!process.env.DATABASE_URL || !process.env.DATABASE_TOKEN) throw 'Não está configurado a variável DATABASE_URL ou DATABASE_TOKEN.';
        
        DB = createClient({
            url: process.env.DATABASE_URL,
            authToken: process.env.DATABASE_TOKEN,
        });
    
        transaction = await DB.transaction('write');
        await executeMultiple(transaction);
        await transaction.commit();
    } catch (error) {
        await transaction?.rollback();
        throw handleError(error);
    } finally {
        if(DB) DB.close();
    }
};