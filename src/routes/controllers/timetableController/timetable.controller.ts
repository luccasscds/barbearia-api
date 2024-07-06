import { Request, Response } from "express";
import { timetableDB } from "../../../db/timetableDB";
import { handleError } from "../../../tools/handleError";

export const timetableController = {
    async getAll(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const response = await timetableDB.getAll(Number(id));
    
            res.json(response);
            
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async get(req: Request, res: Response) {
        try {
            const response = await timetableDB.get(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getActiveOrInactive(req: Request, res: Response) {
        try {
            const response = await timetableDB.getActiveOrInactive(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async update(req: Request, res: Response) {
        try {
            const response = await timetableDB.updateTimetable(req.body);

            res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async create(req: Request, res: Response) {
        try {
            await timetableDB.create(req.body.codCompany);

            res.status(200).json({ message: `Registro(s) inserido(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getTimetableEmployee(req: Request, res: Response) {
        try {
            const response = await timetableDB.getTimetableEmployee(req.body);

            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getByDayTimetableEmployee(req: Request, res: Response) {
        try {
            const response = await timetableDB.getByDayTimetableEmployee(req.body);

            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async createTimetableEmployee(req: Request, res: Response) {
        try {
            await timetableDB.createTimetableEmployee(req.body);

           res.status(200).json({ message: `Registro(s) inserido(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async updateTimetableEmployee(req: Request, res: Response) {
        try {
            await timetableDB.updateTimetableEmployee(req.body);

            res.status(200).json({ message: `Registro(s) atualizado(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
}