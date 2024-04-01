import { Request, Response } from "express";
import { financeDB } from "../../../db/financeDB";
import { handleError } from "../../../tools/handleError";

export const financeController = {
    async performance(req: Request, res: Response) {
        try {
            const balance = await financeDB.financialBalance(req.body);
            const resume = await financeDB.financialResume(req.body);
    
            res.json({ balance, resume });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
};