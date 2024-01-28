import { Request, Response } from "express";
import { timetableDB } from "../../../db/timetableDB";
import { IErrorSQL } from "../types";

export const timetableController = {
    async getAll(req: Request, res: Response) {
        const response = await timetableDB.getAll();

        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async get(req: Request, res: Response) {
        const {id} = req.params;
        const response = await timetableDB.get(Number(id));

        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async getActiveOrInactive(req: Request, res: Response) {
        const {id} = req.params;
        const response = await timetableDB.getActiveOrInactive(id.toLowerCase() === 'true');

        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.json(response);
    },
    async update(req: Request, res: Response) {
        const { codTime, active, time01, time02, time03, time04 } = req.body;
        const response = await timetableDB.updateTimetable(codTime, active, time01, time02, time03, time04);
    
        if((response as IErrorSQL).errno) {
            res.json({ error: response });
            return;
        };
        res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
    },
}