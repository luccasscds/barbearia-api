import { Request, Response } from "express";
import { tagsDB } from "../../../db/tagsDB";
import { IErrorSQL } from "../types";

export const tagsController = {
    async getAll(req: Request, res: Response) {
        try {
            const response = await tagsDB.getAll();
            
            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
};