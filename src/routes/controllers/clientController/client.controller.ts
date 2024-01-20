import { Request, Response } from "express";
import { clientDB } from '../../../db/clientDB';
import { IErrorSQL } from "../types";

export const clientController = {
    async getAll(req: Request, res: Response) {
        const response = await clientDB.getAll();

        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async get(req: Request, res: Response) {
        const { id } = req.params;
        const response = await clientDB.get(Number(id));

        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async create(req: Request, res: Response) {
        const { name, email, numberPhone } = req.body;
        const response = await clientDB.new({
            name, email, numberPhone
        });
    
        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.status(201).json({
            id: response.insertId,
            message: 'Registro criado',
        });
    },
    async update(req: Request, res: Response) {
        const { id, name, email } = req.body;
        const response = await clientDB.update(id, name, email);
    
        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
    },
    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const response = await clientDB.delete(Number(id));
    
        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
    },
};