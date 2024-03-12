import { Request, Response } from "express";
import { clientDB } from '../../../db/clientDB';
import { IErrorSQL } from "../types";

export const clientController = {
    async getAll(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const response = await clientDB.getAll(Number(id));
    
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
    async getBlockedOrNo(req: Request, res: Response) {
        try {
            const response = await clientDB.getBlockedOrNo(req.body);
    
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
    async get(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const response = await clientDB.get(Number(id));
    
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
    async create(req: Request, res: Response) {
        try {
            const response = await clientDB.new(req.body);
            
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.status(201).json({
                id: response.insertId,
                message: 'Registro criado',
            });
        } catch (error) {
            res.json({error});
        }
    },
    async update(req: Request, res: Response) {
        try {
            const response = await clientDB.update(req.body);
        
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
        } catch (error) {
            res.json({error});
        }
    },
    async delete(req: Request, res: Response) {
        try {
            const response = await clientDB.delete(req.body);
        
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
        } catch (error) {
            res.json({error});
        }
    },
};