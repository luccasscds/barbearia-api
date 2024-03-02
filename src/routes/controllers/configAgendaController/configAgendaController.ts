import { Request, Response } from "express";
import { IErrorSQL } from "../types";
import { configAgendaDB } from "../../../db/configAgendaDB";

export const configAgendaController = {
    async getAll(req: Request, res: Response) {
        try {
            const response = await configAgendaDB.getAll();
    
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
            
            const response = await configAgendaDB.get(id);
    
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
    async update(req: Request, res: Response) {
        try {
            const response = await configAgendaDB.update(req.body);
        
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
        } catch (error) {
            res.json({error});
        }
    },
};