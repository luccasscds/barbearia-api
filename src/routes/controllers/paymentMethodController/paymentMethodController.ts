import { Request, Response } from "express";
import { paymentMethodDB } from "../../../db/paymentMethodDB";

export const paymentMethodController = {
    async getALl(req: Request, res: Response) {
        try {
            const response = await paymentMethodDB.getAll();
    
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    }
}