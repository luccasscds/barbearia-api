import { Request, Response } from "express";
import { serviceDB } from "../../../db/serviceDB";
import { handleError } from "../../../tools/handleError";

export const serviceController = {
    async getAll(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const response = await serviceDB.getAll(Number(id));
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getAllActive(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const response = await serviceDB.getAllActive(Number(id));
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async get(req: Request, res: Response) {
        try {
            const response = await serviceDB.get(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async create(req: Request, res: Response) {
        try {
            await serviceDB.create(req.body);
        
            res.status(201).json({ message: `Registro criado com sucesso` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async update(req: Request, res: Response) {
        try {
            await serviceDB.update(req.body);
        
            res.status(200).json({ message: `O(s) serviço(s) foi(ram) atualizado(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async delete(req: Request, res: Response) {
        try {
            await serviceDB.delete(req.body);
    
            res.status(200).json({ message: `O(s) serviço(s) foi(ram) removido(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
};