import { Request, Response } from "express";
import { eventDB } from "../../../db/eventDB";
import { clientDB } from "../../../db/clientDB";
import { handleError } from "../../../tools/handleError";

export const eventController = {
    async get(req: Request, res: Response) {
        try {
            const response = await eventDB.getEvent(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getEventByClient(req: Request, res: Response) {
        try {
            const response = await eventDB.getEventByClient(req.body);
            
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getEventByMonth(req: Request, res: Response) {
        try {
            const response = await eventDB.getEventByMonth(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async create(req: Request, res: Response) {
        try {
            const client = await clientDB.get(req.body.codClient) as any;
            if(client && client.blocked) throw 'BLOCKED_CLIENT';
    
            const response = await eventDB.createEvent(req.body);
    
            res.status(201).json({ message: `Registro criado ID: ${response.lastInsertRowid}` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async update(req: Request, res: Response) {
        try {   
            const response = await eventDB.updateEvent(req.body);
    
            res.status(200).json({ message: `Registro atualizado ID: ${response.rowsAffected}` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async delete(req: Request, res: Response) {
        try {    
            const response = await eventDB.deleteEvent(req.body);
            
            res.status(200).json({ message: `${response.rowsAffected} registro(s) deletado(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async deleteIn(req: Request, res: Response) {
        try {
            const response = await eventDB.deleteIn(req.body);
            
            res.status(200).json({ message: `${response.rowsAffected} registro(s) deletado(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
};