import { z } from 'zod';
import { connectionToDatabase } from './createConnection';
import { handleZod } from '../tools/handleZod';
import { ResultSet } from '@libsql/client/.';

export const categoryDB = {
    async getAll(codCompany: number): Promise<IResponseCategory[]> {
        try {
            const codCompanySchema = handleZod.number('CodCompany');
            codCompanySchema.parse(codCompany);

            const sql = `select
                            codCategory, nameCategory
                        from Category
                        where codCompany = ?;`
            const result = await connectionToDatabase(sql, [codCompany] );
    
            return result as any;
        } catch (error) {
            throw error as any;
        }
    },
    
    async new(newCategory: IParamsCreate): Promise<ResultSet> {
        try {
            const { codCompany, nameCategory } = newCategory;

            const CategorySchema = z.object({
                codCompany: handleZod.number('codCompany'),
                nameCategory: handleZod.string('Nome', {min: 2}),
            });
            CategorySchema.parse(newCategory);
            
            const sql = `INSERT INTO Category
                            (codCompany, nameCategory) 
                        VALUES
                            (?, ?);
            `;
            const result = await connectionToDatabase(sql, [codCompany, nameCategory] ) as ResultSet;
            // @ts-ignore
            result.lastInsertRowid = Number(result.lastInsertRowid);

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
    
    async update(newCategory: IParamsUpdate): Promise<ResultSet> {
        try {
            const { nameCategory, codCategory, codCompany } = newCategory;

            const CategorySchema = z.object({
                codCompany: handleZod.number('codCompany'),
                codCategory: handleZod.number('codCategory'),
                nameCategory: handleZod.string('Nome', {min: 2}),
            });
            CategorySchema.parse(newCategory);

            const sql = `UPDATE Category SET 
                            nameCategory = ?
                        WHERE codCategory = ?
                        AND codCompany = ?;`
            const result = await connectionToDatabase(sql, [nameCategory, codCategory, codCompany] );

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
    
    async delete(newCategory: IParamsDelete): Promise<ResultSet> {
        try {
            const { codCategory } = newCategory;
            const UserSchema = z.object({
                codCategory: handleZod.number('codCategory'),
            });
            UserSchema.parse(newCategory);

            const sql = `DELETE FROM Category WHERE codCategory = ?;`
            const result = await connectionToDatabase(sql, [codCategory] );

            return result as any;
        } catch (error) {
            throw error as any;
        };
    },
}

interface IResponseCategory {
    codCategory: number,
    nameCategory?: string,
}

interface IParamsCreate {
    codCompany: number,
    nameCategory: string,
}

interface IParamsUpdate {
    codCategory: number,
    codCompany: number,
    nameCategory: string,
}

interface IParamsDelete {
    codCategory: number,
}