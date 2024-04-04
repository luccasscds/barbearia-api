import { Request, Response } from "express";
import { financeDB } from "../../../db/financeDB";
import { handleError } from "../../../tools/handleError";

export const financeController = {
    async performance(req: Request, res: Response) {
        try {
            const balance = await financeDB.financialBalance(req.body);
            const resume = await financeDB.financialResume(req.body);
    
            res.json({ balance, resume });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },

    async resume(req: Request, res: Response) {
        try {
            const topFiveRevenue = await financeDB.topFiveRevenuePerServices(req.body);
            const listPaymentMethod = await financeDB.listPaymentMethod(req.body);
            const balance = await financeDB.financialBalance(req.body);
     
            res.json({ topFiveRevenue, listPaymentMethod, balance });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },

    async cashFlow(req: Request, res: Response) {
        try {
            const response = await financeDB.cashFlow(req.body);
     
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },

    async detailsCashFlow(req: Request, res: Response) {
        try {
            const response = await financeDB.detailsCashFlow(req.body);
     
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },

    async revenue(req: Request, res: Response) {
        try {
            const monthsOrYearRevenue = await financeDB.monthsOrYearRevenue(req.body);
            const calcRevenue = await financeDB.calcRevenue(req.body);
     
            res.json({ monthsOrYearRevenue, calcRevenue });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
};