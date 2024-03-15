import { Client, ResultSet, createClient } from "@libsql/client";
// import mysql from 'mysql2/promise';

// export async function createConnection(): Promise<mysql.Connection> {
//     if (!process.env.DATABASE_URL) {
//         const message = 'não está configurado a variável DATABASE_URL.';
//         console.error(message);
//         throw message;
//     };

//     return await mysql.createConnection(process.env.DATABASE_URL!);
// };

export async function connectionToDatabase(sql: string, args: any[] = []) {
    let client: Client | undefined;
    try {
        if (!process.env.DATABASE_URL || !process.env.DATABASE_TOKEN) throw 'Não está configurado a variável DATABASE_URL ou DATABASE_TOKEN.';
        
        client = createClient({
            url: process.env.DATABASE_URL,
            authToken: process.env.DATABASE_TOKEN,
        });
    
        const result = await client.execute({ sql, args });
        
        if(/insert|update|delete/gi.test(sql)) {
            if((result as ResultSet).rowsAffected === 0) {
                throw 'Houve algo erro, nenhum resultado(s) inserido(s)';
            };
            return result;
        } else {
            return handleData(result);
        }
    } catch (error) {
        console.error(error); // temp
        throw error;
    } finally {
        if(client) client.close();
    }
}

function handleData(data: any) {
    try {
        if (!data.columns || !data.rows) return data;
      
        const { columns, rows } = data;
        const formattedData: any[] = [];
      
        for (const row of rows) {
            const rowData: any = {};
            for (let i = 0; i < columns.length; i++) {
                rowData[columns[i]] = row[i];
            }
            
            formattedData.push(rowData);
        }
      
        return formattedData;
    } catch (error) {
        throw error;
    }
}