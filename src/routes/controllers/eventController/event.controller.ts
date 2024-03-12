import { Request, Response } from "express";
import { eventDB } from "../../../db/eventDB";
import { clientDB } from "../../../db/clientDB";

export const eventController = {
    async get(req: Request, res: Response) {
        try {
            const response = await eventDB.getEvent(req.body);
    
            if(response.errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
    async getEventByClient(req: Request, res: Response) {
        try {
            const response = await eventDB.getEventByClient(req.body);
            
            if(response.errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
    async getEventByMonth(req: Request, res: Response) {
        try {
            const response = await eventDB.getEventByMonth(req.body);
    
            if(response.errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
    async create(req: Request, res: Response) {
        try {
            const client = await clientDB.get(req.body.codClient) as any;
            if(client.blocked) throw 'BLOCKED_CLIENT';
    
            const response = await eventDB.createEvent(req.body);
    
            if(response.errno) {
                res.json({ error: response });
                return;
            };
            res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
        } catch (error) {
            res.json({error});
        }
    },
    async update(req: Request, res: Response) {
        try {   
            const response = await eventDB.updateEvent(req.body);
    
            if(response.errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `Registro atualizado ID: ${response.affectedRows}` });
        } catch (error) {
            res.json({error});
        }
    },
    async delete(req: Request, res: Response) {
        try {    
            const response = await eventDB.deleteEvent(req.body);
            
            if(response.errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
        } catch (error) {
            res.json({error});
        }
    },
    async deleteIn(req: Request, res: Response) {
        try {
            const response = await eventDB.deleteIn(req.body);
            
            if(response.errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
        } catch (error) {
            res.json({error});
        }
    },
};