import { Request, Response } from "express";
import { IErrorSQL } from "../types";
import { companyDB } from "../../../db/companyDB";

export const companyController = {
    async get(req: Request, res: Response) {
        try {
            const { id } = req.params;
    
            const response = await companyDB.get(id);
    
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({ error });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const response = await companyDB.update(req.body);
        
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
        } catch (error) {
            res.json({ error });
        }
    },
};