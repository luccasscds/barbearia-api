import { Request, Response } from "express";
import { z } from "zod";
import { clientDB } from "../../../db/clientDB";
import { tools } from "../../../tools";

export const authController = {
    async signIn(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
    
            const token = await tools.verifyToken(password);
            
            const newToken = await tools.generateToken();
            res.json({token});
        } catch (error) {
            res.json(error)
        }
    },
    async signUp(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;
    
            const UserSchema = z.object({
                name: z.string().min(1, 'O campo Nome deve conter pelo menos 1 caractere(s)'),
                email: z.string().email('Email inválido'),
                password: z.string().min(1, 'O campo Senha deve conter pelo menos 1 caractere(s)'),
            });
            UserSchema.parse({ name, email, password });
            
            const newPassword = tools.encrypt(password);
            await clientDB.new(name, email, newPassword);

            res.json(true);
        } catch(error) {
            res.json(error);
        };
    },
};