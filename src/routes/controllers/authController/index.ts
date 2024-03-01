import { Request, Response } from "express";
import { z } from "zod";
import { clientDB } from "../../../db/clientDB";
import { tools } from "../../../tools";
import moment from "moment";
import { Email } from "./Email";
import { Google } from "./Google";

export const authController = {
    async signIn(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const EmailOrPasswdMessageError = 'Email ou Senha estão incorretos';

            const UserSchema = z.object({
                email: z.string().email('Email inválido'),
                password: z.string().min(1, 'O campo Senha deve conter pelo menos 1 caractere(s)'),
            });
            UserSchema.parse({ email, password });

            const selectedClient = await clientDB.getByEmail(email);

            if(!selectedClient || !selectedClient?.passwordClient) throw EmailOrPasswdMessageError;
            if(selectedClient.blocked) throw 'BLOCKED_CLIENT';
            
            const decryptPassword = tools.decrypt(selectedClient.passwordClient);
            if(password !== decryptPassword) throw EmailOrPasswdMessageError;
            const newToken = await tools.token.generate();

            selectedClient.passwordClient = undefined;
            selectedClient.isADM = !!selectedClient.isADM;

            const client = {
                ...selectedClient,
                expirationTimeInMinute: tools.expirationTimeInMinute,
                dateCreated: moment().add(tools.expirationTimeInMinute, 'minute').format('YYYY-MM-DD HH:mm'),
            }
            const encryptClient = await tools.encrypt(JSON.stringify(client));
            
            res.json({ token: newToken, client: encryptClient });
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        }
    },
    async signUp(req: Request, res: Response) {
        try {
            const { name, email, password, numberPhone } = req.body;
    
            const UserSchema = z.object({
                name: z.string().min(1, 'O campo Nome deve conter pelo menos 1 caractere(s)'),
                email: z.string().email('Email inválido'),
                numberPhone: z.string().min(11, 'O campo Telefone deve conter pelo menos 11 caractere(s)').max(11, 'O campo Telefone deve conter no máximo 11 caractere(s)'),
                password: z.string().min(1, 'O campo Senha deve conter pelo menos 1 caractere(s)'),
            });
            UserSchema.parse({ name, email, password, numberPhone });
            
            const newPassword = tools.encrypt(password);
            await clientDB.new({
                name,
                email,
                password: newPassword,
                numberPhone,
            });

            res.json({status: true});
        } catch(error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        };
    },

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
    
            const UserSchema = z.object({
                email: z.string().email('Email inválido'),
            });
            UserSchema.parse(req.body);
            
            const client = await clientDB.getByEmail(email);
            if(!client) throw 'Não existe email cadastrado';
            client.passwordClient = undefined;

            await Email.send({
                accessToken: await Google.getAccessToken(),
                client,
            });


            res.json({status: true});
        } catch(error) {
            console.error(error)
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        };
    },

    async createPassword(req: Request, res: Response) {
        try {
            const { token, password, confirmPassword } = req.body;
            const data = JSON.parse(await tools.decrypt(token) ?? '{}');

            if(password !== confirmPassword) throw 'As senhas precisam ser iguais.';

            const PasswordsSchema = z.object({
                password: z.string().min(1, 'O campo Senha deve conter pelo menos 1 caractere(s)'),
                confirmPassword: z.string().min(1, 'O outro campo Senha deve conter pelo menos 1 caractere(s)'),
            });
            PasswordsSchema.parse(req.body);

            await tools.token.verify(data.token);

            await clientDB.update({
                id: data.client.codClient,
                email: data.client.emailClient,
                password: await tools.encrypt(password),
                name: data.client.nameClient,
                blocked: !!data.client.blocked,
            });

            res.json({status: true});
        } catch(error) {
            console.error(error);
            if((error as any).code === 'ERR_JWT_EXPIRED') error = 'Sua seção expirou, por favor tente gerar outro link';
            
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        };
    },
};