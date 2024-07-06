import { Request, Response } from "express";
import { handleError } from "../../../tools/handleError";
import { employeeDB } from "../../../db/employeeDB";

export const employeeController = {
    async get(req: Request, res: Response) {
        try {
            const response = await employeeDB.get(req.body);
            
            res.json({
                ...response,
                password: undefined,
            });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getByCompany(req: Request, res: Response) {
        try {
            const response = await employeeDB.getByCompany(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getByEmail(req: Request, res: Response) {
        try {
            const response = await employeeDB.getByEmail(req.body);
            
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getPermissionsByDefault(req: Request, res: Response) {
        try {
            const response = await employeeDB.getPermissionsByDefault(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getPermissions(req: Request, res: Response) {
        try {
            const response = await employeeDB.getPermissions(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async create(req: Request, res: Response) {
        try {
            await employeeDB.create(req.body);
    
            res.status(201).json({ message: `Registro criado com sucesso` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async update(req: Request, res: Response) {
        try {   
            await employeeDB.update(req.body);
    
            res.status(200).json({ message: `Registro atualizado` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async delete(req: Request, res: Response) {
        try {
            await employeeDB.delete(req.body);
            
            res.status(200).json({ message: `registro(s) deletado(s)` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getServiceByEmployee(req: Request, res: Response) {
        try {
            const response = await employeeDB.getServiceByEmployee(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async getService(req: Request, res: Response) {
        try {
            const response = await employeeDB.getService(req.body);
    
            res.json(response);
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async createService(req: Request, res: Response) {
        try {
            await employeeDB.createService(req.body);
    
            res.status(201).json({ message: `Serviço(s) adicionado(s) com sucesso` });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
};