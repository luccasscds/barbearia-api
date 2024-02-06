import { Request, Response } from "express";
import { IErrorSQL } from "../types";
import { companyDB } from "../../../db/companyDB";

export const companyController = {
    async get(req: Request, res: Response) {
        const { id } = req.params;

        const response = await companyDB.get(id);

        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },

    async update(req: Request, res: Response) {
        try {
            const { name, photo, numberWhatsApp, nameInstagram, address, codCompany } = req.body;
            const response = await companyDB.update({name, photo, numberWhatsApp, nameInstagram, address, codCompany});
        
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