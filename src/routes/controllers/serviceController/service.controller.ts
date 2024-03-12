import { Request, Response } from "express";
import { serviceDB } from "../../../db/serviceDB";
import { z } from "zod";

export const serviceController = {
    async getAll(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const response = await serviceDB.getAll(Number(id));
    
            if((response as any).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
    async getAllActive(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const response = await serviceDB.getAllActive(Number(id));
    
            if((response as any).errno) {
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
            const response = await serviceDB.get(req.body);
    
            if((response as any).errno) {
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
            const response = await serviceDB.create(req.body);
        
            if((response as any).errno) {
                res.json({ error: response });
                return;
            };
            res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
        } catch (error) {
            res.json({error});
        }
    },
    async update(req: Request, res: Response) {
        try {
            const response = await serviceDB.update(req.body);
        
            if((response as any).errno) {
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
            const response = await serviceDB.delete(req.body);
    
            if((response as any).errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
        } catch (error) {
            res.json({error});
        }
    },
};