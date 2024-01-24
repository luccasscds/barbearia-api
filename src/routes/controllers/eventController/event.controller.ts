import { Request, Response } from "express";
import { eventDB } from "../../../db/eventDB";

export const eventController = {
    async get(req: Request, res: Response) {
        const { date } = req.params;
        const response = await eventDB.getEvent(date);

        if(response.errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async getEventByClient(req: Request, res: Response) {
        const { id } = req.params;
        const response = await eventDB.getEventByClient(Number(id));

        if(response.errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async getEventByMonth(req: Request, res: Response) {
        const { id } = req.params;
        const response = await eventDB.getEventByMonth(Number(id));

        if(response.errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async create(req: Request, res: Response) {
        const { codClient, codService, codStatus, dateVirtual, startTime, endTime } = req.body;
        
        const response = await eventDB.createEvent({
            codClient, codService, codStatus, dateVirtual, startTime, endTime
        });

        if(response.errno) {
            res.json({ error: response });
            return;
        };
        res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
    },
    async update(req: Request, res: Response) {
        const { codClient, codService, codStatus, dateVirtual, startTime, endTime, codVirtual } = req.body;
        const response = await eventDB.updateEvent({
            codClient, codService, codStatus, dateVirtual, startTime, endTime, codVirtual
        });
        
        if(response.errno) {
            res.json({ error: response });
            return;
        };
        res.status(200).json({ message: `Registro atualizado ID: ${response.affectedRows}` });
    },
    async delete(req: Request, res: Response) {
        const { codClient, dateVirtual, startTime } = req.body;
        const response = await eventDB.deleteEvent(codClient, dateVirtual, startTime);
        
        if(response.errno) {
            res.json({ error: response });
            return;
        };
        res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
    },
    async deleteIn(req: Request, res: Response) {
        const { codVirtual } = req.body;
        const response = await eventDB.deleteIn(codVirtual);
        
        if(response.errno) {
            res.json({ error: response });
            return;
        };
        res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
    },
};