import { Request, Response } from "express";
import { serviceDB } from "../../../db/serviceDB";
import { IErrorSQL } from "../types";

export const serviceController = {
    async getAll(req: Request, res: Response) {
        const response = await serviceDB.getAll();

        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async getAllActive(req: Request, res: Response) {
        const response = await serviceDB.getAllActive();

        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async get(req: Request, res: Response) {
        const { id } = req.params;
        const response = await serviceDB.get(id);

        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async create(req: Request, res: Response) {
        const {nameService, price, durationMin } = req.body;
        const response = await serviceDB.create(nameService, price, durationMin);
    
        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
    },
    async update(req: Request, res: Response) {
        const { codService, nameService, price, durationMin, active } = req.body;
        const response = await serviceDB.update(codService, nameService, price, durationMin, active);
    
        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
    },
    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const response = await serviceDB.delete(Number(id));

        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
    },
};