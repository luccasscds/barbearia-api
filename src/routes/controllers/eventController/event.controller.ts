import { Request, Response } from "express";
import { eventDB } from "../../../db/eventDB";

export const eventController = {
    async get(req: Request, res: Response) {
        const { date } = req.params;
        const response = await eventDB.getEvent(date);
        res.json(response);
    },
    async getEventByClient(req: Request, res: Response) {
        const { id } = req.params;
        const response = await eventDB.getEventByClient(Number(id));
        res.json(response);
    },
    async getEventByMonth(req: Request, res: Response) {
        const { id } = req.params;
        const response = await eventDB.getEventByMonth(Number(id));
        res.json(response);
    },
    async create(req: Request, res: Response) {
        const { codClient, codService, dateVirtual, startTime, endTime } = req.body;
        const response = await eventDB.createEvent(codClient, codService, dateVirtual, startTime, endTime);
        if (typeof response.insertId === "number") {
            res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
        } else {
            res.status(400).json({ error: response });
        }
    },
    async delete(req: Request, res: Response) {
        const { codClient, dateVirtual, startTime } = req.body;
        const response = await eventDB.deleteEvent(codClient, dateVirtual, startTime);
    
        if (typeof response.insertId === "number") {
            res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
        } else {
            res.status(400).json({ error: response });
        }
    },
};