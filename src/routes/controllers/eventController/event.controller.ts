import { Request, Response } from "express";
import { eventDB } from "../../../db/eventDB";

export const eventController = {
    async get(req: Request, res: Response) {
        const { date } = req.params;
        const response = await eventDB.getEvent(date);
        res.json(response);
    },
    async create(req: Request, res: Response) {
        const { codClient, codService, dateVirtual, startTime, endTime } = req.body;
        const response = await eventDB.createEvent(codClient, codService, dateVirtual, startTime, endTime);
        if (typeof response.insertId === "number") {
            res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
        } else {
            res.status(400).json({ erroMessage: response });
        }
    },
    async delete(req: Request, res: Response) {
        const { codClient, dateVirtual } = req.body;
        const response = await eventDB.deleteEvent(codClient, dateVirtual);
    
        console.log(response);
        if (typeof response.insertId === "number") {
            res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
        } else {
            res.status(400).json({ erroMessage: response });
        }
    },
};