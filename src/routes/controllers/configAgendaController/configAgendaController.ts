import { Request, Response } from "express";
import { IErrorSQL } from "../types";
import { configAgendaDB } from "../../../db/configAgendaDB";

export const configAgendaController = {
    async getAll(req: Request, res: Response) {
        const response = await configAgendaDB.getAll();

        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async get(req: Request, res: Response) {
        const { id } = req.params;

        const newValue = id.replace(/\s/g, '').split(',').map((key) => `"${key}"`);
        const response = await configAgendaDB.get(newValue.join(','));

        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async update(req: Request, res: Response) {
        const { keyConfig, valueConfig } = req.body;
        const response = await configAgendaDB.update(keyConfig, valueConfig);
    
        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
    },
};