import { Request, Response } from "express";
import { tagsDB } from "../../../db/tagsDB";
import { handleError } from "../../../tools/handleError";

export const tagsController = {
    async getAll(req: Request, res: Response) {
        try {
            const response = await tagsDB.getAll();
            
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
};