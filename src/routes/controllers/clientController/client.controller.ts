import { Request, Response } from "express";
import { clientDB } from '../../../db/clientDB';
import { handleError } from "../../../tools/handleError";

export const clientController = {
    async getAll(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const response = await clientDB.getAll(Number(id));
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getBlockedOrNo(req: Request, res: Response) {
        try {
            const response = await clientDB.getBlockedOrNo(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async get(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const response = await clientDB.get(Number(id));
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async missing(req: Request, res: Response) {
        try {
            const response = await clientDB.missing(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async birthday(req: Request, res: Response) {
        try {
            const response = await clientDB.birthday(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async create(req: Request, res: Response) {
        try {
            const response = await clientDB.new(req.body);
            
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
            const response = await clientDB.update(req.body);
        
            res.status(200).json({ message: `${response.rowsAffected} registro(s) atualizado(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async delete(req: Request, res: Response) {
        try {
            const response = await clientDB.delete(req.body);
        
            res.status(200).json({ message: `${response.rowsAffected} registro(s) deletado(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
};