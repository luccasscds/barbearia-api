import { Request, Response } from "express";
import { handleError } from "../../../tools/handleError";
import { categoryDB } from "../../../db/categoryDB";

export const categoryController = {
    async getAll(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const response = await categoryDB.getAll(Number(id));
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async create(req: Request, res: Response) {
        try {
            const response = await categoryDB.new(req.body);
            
            res.status(201).json({
                id: response.lastInsertRowid,
                message: 'Registro criado',
            });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async update(req: Request, res: Response) {
        try {
            const response = await categoryDB.update(req.body);
        
            res.status(200).json({ message: `${response.rowsAffected} registro(s) atualizado(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async delete(req: Request, res: Response) {
        try {
            const response = await categoryDB.delete(req.body);
        
            res.status(200).json({ message: `${response.rowsAffected} registro(s) deletado(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
};