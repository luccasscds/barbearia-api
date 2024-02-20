import { Request, Response } from "express";
import { serviceDB } from "../../../db/serviceDB";
import { IErrorSQL } from "../types";
import { z } from "zod";

export const serviceController = {
    async getAll(req: Request, res: Response) {
        try {
            const response = await serviceDB.getAll();
    
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        }
    },
    async getAllActive(req: Request, res: Response) {
        try {
            const response = await serviceDB.getAllActive();
    
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        }
    },
    async get(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const response = await serviceDB.get(id);
    
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        }
    },
    async create(req: Request, res: Response) {
        try {
            const newServiceSchema = z.object({
                nameService: z.string().min(2, 'O campo Nome Serviço deve conter pelo menos 2 caractere(s)'),
                price: z.number(),
                durationMin: z.number(),
                identificationColor: z.string().nullable(),
            });
            newServiceSchema.parse(req.body);
    
            const response = await serviceDB.create(req.body);
        
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        }
    },
    async update(req: Request, res: Response) {
        try {
            const newServiceSchema = z.object({
                codService: z.number(),
                nameService: z.string().min(2, 'O campo Nome Serviço deve conter pelo menos 2 caractere(s)'),
                price: z.number(),
                durationMin: z.number(),
                active: z.boolean(),
                identificationColor: z.string().nullable(),
            });
            newServiceSchema.parse(req.body);
    
            const response = await serviceDB.update(req.body);
        
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        }
    },
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const newServiceSchema = z.string().regex(/^\d{1,}$/g, 'O campo ID precisa ser numérico');
            newServiceSchema.parse(id);

            const response = await serviceDB.delete(Number(id));
    
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        }
    },
};