import { Request, Response } from "express";
import { handleError } from "../../../tools/handleError";
import { holidaysDB } from "../../../db/holidaysDB";

export const holidaysController = {
    async get(req: Request, res: Response) {
        try {
            const response = await holidaysDB.get();
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
}