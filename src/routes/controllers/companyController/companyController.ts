import { Request, Response } from "express";
import { companyDB } from "../../../db/companyDB";
import { handleError } from "../../../tools/handleError";

export const companyController = {
    async get(req: Request, res: Response) {
        try {    
            const response = await companyDB.get(req.params.id);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },

    async update(req: Request, res: Response) {
        try {
            const response = await companyDB.update(req.body);
        
            res.status(200).json({ message: `${response.rowsAffected} registro(s) atualizado(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
};