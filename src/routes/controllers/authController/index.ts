import { Request, Response } from "express";
import { z } from "zod";
import { clientDB } from "../../../db/clientDB";
import { tools } from "../../../tools";
import moment from "moment";

export const authController = {
    async signIn(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const EmailOrPasswdMessageError = 'Email ou Senha estão incorretos';

            const selectedClient = await clientDB.getByEmail(email);

            if(!selectedClient || !selectedClient?.passwordClient) throw EmailOrPasswdMessageError;
            const decryptPassword = tools.decrypt(selectedClient.passwordClient);
            if(password !== decryptPassword) throw EmailOrPasswdMessageError;
            const newToken = await tools.generateToken();

            selectedClient.passwordClient = undefined;
            selectedClient.isADM = !!selectedClient.isADM;

            const client = {
                ...selectedClient,
                expirationTimeInMinute: 60, // minute
                dateCreated: moment().toJSON(),
            }
            const encryptClient = await tools.encrypt(JSON.stringify(client));
            
            res.json({ token: newToken, client: encryptClient });
        } catch (error) {
            res.json({error});
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
            await clientDB.new({
                name, email, 
                password: newPassword,
            });

            res.json({status: true});
        } catch(error) {
            res.json({error});
        };
    },
};