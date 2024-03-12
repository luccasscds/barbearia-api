import { Request, Response } from "express";
import { paymentMethodDB } from "../../../db/paymentMethodDB";

export const paymentMethodController = {
    async getALl(req: Request, res: Response) {
        try {
            const response = await paymentMethodDB.getAll();
    
            if(response.errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    }
}