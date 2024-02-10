import { Request, Response } from "express";
import { z } from "zod";
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
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        }
    }
}