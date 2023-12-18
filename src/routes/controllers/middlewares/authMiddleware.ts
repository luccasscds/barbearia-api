import { Request, Response, NextFunction } from "express";
import { tools } from "../../../tools";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.headers;
        
        if(!token) {
            res.json({error: 'Sem token'});
            return;
        };
    
        const parts = (token as string).split('.');
        if(parts.length < 3) {
            res.json({error: 'Token error'});
            return;
        };
    
        await tools.verifyToken((token as string))
        
        next();
    } catch (error) {
        res.json({error});
    };
}