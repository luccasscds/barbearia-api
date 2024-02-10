import { Request, Response } from "express";
import { eventDB } from "../../../db/eventDB";
import { z } from "zod";

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
        try {
            const EventSchema = z.object({            
                codClient: z.number(),
                codService: z.number(),
                codStatus: z.number(),
                dateVirtual: z.string().regex(/^\d{4}-\d{2}-\d{2}$/g, 'O formato Data esperado é YYYY-MM-DD'),
                startTime: z.string().regex(/^(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2})$/, 'O formato Hora esperado é HH:mm ou HH:mm:ss'),
                endTime: z.string().regex(/^(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2})$/, 'O formato Hora esperado é HH:mm ou HH:mm:ss'),
                codPayment: z.number(),
            });
            EventSchema.parse(req.body);
    
            const response = await eventDB.createEvent(req.body);
    
            if(response.errno) {
                res.json({ error: response });
                return;
            };
            res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        }
    },
    async update(req: Request, res: Response) {
        try {
            const EventSchema = z.object({            
                codClient: z.number(),
                codService: z.number(),
                codStatus: z.number(),
                dateVirtual: z.string().regex(/^\d{4}-\d{2}-\d{2}$/g, 'O formato Data esperado é YYYY-MM-DD'),
                startTime: z.string().regex(/^(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2})$/, 'O formato Hora esperado é HH:mm ou HH:mm:ss'),
                endTime: z.string().regex(/^(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2})$/, 'O formato Hora esperado é HH:mm ou HH:mm:ss'),
                codVirtual: z.number(),
                codPayment: z.number(),
            });
            EventSchema.parse(req.body);
    
            const response = await eventDB.updateEvent(req.body);
    
            if(response.errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `Registro atualizado ID: ${response.affectedRows}` });
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        }
    },
    async delete(req: Request, res: Response) {
        try {    
            const EventSchema = z.object({            
                codClient: z.number(),
                dateVirtual: z.string().regex(/^\d{4}-\d{2}-\d{2}$/g, 'O formato Data esperado é YYYY-MM-DD'),
                startTime: z.string().regex(/^(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2})$/, 'O formato Hora esperado é HH:mm ou HH:mm:ss'),
            });
            EventSchema.parse(req.body);
    
            const response = await eventDB.deleteEvent(req.body);
            
            if(response.errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        }
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