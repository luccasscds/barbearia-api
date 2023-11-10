import { Request, Response } from "express";
import { deleteClient, getClient, newClient, updateClient } from '../../../db';

export const clientController = {
    async get(req: Request, res: Response) {
        const { id } = req.params;
        const response = await getClient(Number(id));
        res.json(response);
    },
    async create(req: Request, res: Response) {
        const { name, email } = req.body;
        const response = await newClient(name, email);
    
        if (typeof response.insertId === "number") {
            res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
        } else {
            res.status(400).json({ erroMessage: response });
        }
    },
    async update(req: Request, res: Response) {
        const { id, name, email } = req.body;
        const response = await updateClient(id, name, email);
    
        if (typeof response.insertId === "number") {
            res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
        } else {
            res.status(400).json({ erroMessage: response });
        }
    },
    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const response = await deleteClient(Number(id));
    
        console.log(response)
        if (typeof response.insertId === "number") {
            res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
        } else {
            res.status(400).json({ erroMessage: response });
        }
    },
};