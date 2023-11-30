import { Request, Response } from "express";
import { timetableDB } from "../../../db/timetableDB";

export const timetableController = {
    async getAll(req: Request, res: Response) {
        const response = await timetableDB.getAll();
        res.json(response);
    },
    async get(req: Request, res: Response) {
        const {id} = req.params;
        const response = await timetableDB.get(Number(id));
        res.json(response);
    },
    async update(req: Request, res: Response) {
        const { codTime, active, time01, time02, time03, time04 } = req.body;
        const response = await timetableDB.updateTimetable(codTime, active, time01, time02, time03, time04);
    
        if (typeof response.insertId === "number") {
            res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
        } else {
            res.status(400).json({ erroMessage: response });
        }
    },
}