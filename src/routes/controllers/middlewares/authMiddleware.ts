import { Request, Response, NextFunction } from "express";
import { tools } from "../../../tools";
import { handleError } from "../../../tools/handleError";
// import { clientDB } from "../../../db/clientDB";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const { token, codclient } = req.headers;
        
        if(!token) {
            res.json({error: 'Sem token'});
            return;
        };
    
        const parts = (token as string).split('.');
        if(parts.length < 3) {
            res.json({error: 'Token error'});
            return;
        };
    
        await tools.token.verify((token as string));

        // const client = await clientDB.get(Number(codclient)) as any;
        // if(client.blocked) throw 'BLOCKED_CLIENT';
        
        next();
    } catch (error) {
        res.json({error: handleError(error)});
    };
}