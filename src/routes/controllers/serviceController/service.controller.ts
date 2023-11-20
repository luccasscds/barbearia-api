import { Request, Response } from "express";
import { serviceDB } from "../../../db/serviceDB";

export const serviceController = {
    async getAll(req: Request, res: Response) {
        const response = await serviceDB.getAll();
        res.json(response);
    }
};