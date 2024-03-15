import { Request, Response } from "express";
import { configAgendaDB } from "../../../db/configAgendaDB";

export const configAgendaController = {
    async getAll(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const response = await configAgendaDB.getAll(Number(id));
    
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
    async get(req: Request, res: Response) {
        try {
            const response = await configAgendaDB.get(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
    async update(req: Request, res: Response) {
        try {
            const response = await configAgendaDB.update(req.body);
        
            res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
        } catch (error) {
            res.json({error});
        }
    },
};