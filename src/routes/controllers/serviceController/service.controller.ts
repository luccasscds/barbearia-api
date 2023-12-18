import { Request, Response } from "express";
import { serviceDB } from "../../../db/serviceDB";

export const serviceController = {
    async getAll(req: Request, res: Response) {
        const response = await serviceDB.getAll();
        res.json(response);
    },
    async get(req: Request, res: Response) {
        const { id } = req.params;
        const response = await serviceDB.get(Number(id));
        res.json(response);
    },
    async create(req: Request, res: Response) {
        const {nameService, price, durationMin } = req.body;
        const response = await serviceDB.create(nameService, price, durationMin);
    
        if (typeof response.insertId === "number") {
            res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
        } else {
            res.status(400).json({ error: response });
        };
    },
    async update(req: Request, res: Response) {
        const { codService, nameService, price, durationMin } = req.body;
        const response = await serviceDB.update(codService, nameService, price, durationMin);
    
        if (typeof response.insertId === "number") {
            res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
        } else {
            res.status(400).json({ error: response });
        };
    },
    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const response = await serviceDB.delete(Number(id));

        if (typeof response.insertId === "number") {
            res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
        } else {
            res.status(400).json({ error: response });
        };
    },
};