import { Request, Response } from "express";
import { timetableDB } from "../../../db/timetableDB";
import { IErrorSQL } from "../types";

export const timetableController = {
    async getAll(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const response = await timetableDB.getAll(Number(id));
    
            if((response as any).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
            
        } catch (error) {
            res.json({error});
        }
    },
    async get(req: Request, res: Response) {
        try {
            const response = await timetableDB.get(req.body);
    
            if((response as any).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
    async getActiveOrInactive(req: Request, res: Response) {
        try {
            const response = await timetableDB.getActiveOrInactive(req.body);
    
            if((response as any).errno) {
                res.json({ error: response });
                return;
            };
            res.json(response);
        } catch (error) {
            res.json({error});
        }
    },
    async update(req: Request, res: Response) {
        try {
            const response = await timetableDB.updateTimetable(req.body);

            if((response as IErrorSQL).errno) {
                res.json({ error: response });
                return;
            };
            res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
        } catch (error) {
            res.json({error});
        }
    },
}