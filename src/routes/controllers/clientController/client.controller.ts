import { Request, Response } from "express";
import { clientDB } from '../../../db/clientDB';

export const clientController = {
    async getAll(req: Request, res: Response) {
        const response = await clientDB.getAll();
        res.json(response);
    },
    async get(req: Request, res: Response) {
        const { id } = req.params;
        const response = await clientDB.get(Number(id));
        res.json(response);
    },
    async create(req: Request, res: Response) {
        const { name, email } = req.body;
        const response = await clientDB.new(name, email);
    
        if (typeof response.insertId === "number") {
            res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
        } else {
            res.status(400).json({ error: response });
        }
    },
    async update(req: Request, res: Response) {
        const { id, name, email } = req.body;
        const response = await clientDB.update(id, name, email);
    
        if (typeof response.insertId === "number") {
            res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
        } else {
            res.status(400).json({ error: response });
        }
    },
    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const response = await clientDB.delete(Number(id));
    
        console.log(response)
        if (typeof response.insertId === "number") {
            res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
        } else {
            res.status(400).json({ error: response });
        }
    },
};