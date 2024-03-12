import { Request, Response } from "express";
import { z } from "zod";
import { clientDB } from "../../../db/clientDB";
import { tools } from "../../../tools";
import moment from "moment";
import { Email } from "./Email";
import { Google } from "./Google";
import { companyDB } from "../../../db/companyDB";
import { handleZod } from "../../../tools/handleZod";

export const authController = {
    async clientSignIn(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const EmailOrPasswdMessageError = 'Email ou Senha estão incorretos';

            const UserSchema = z.object({
                email: handleZod.email(),
                password: z.string().min(1, 'O campo Senha deve conter pelo menos 1 caractere(s)'),
            });
            UserSchema.parse(req.body);

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
    async clientSignUp(req: Request, res: Response) {
        try {
            const { name, email, password, numberPhone, codCompany } = req.body;
    
            const UserSchema = z.object({
                name: z.string().min(1, 'O campo Nome deve conter pelo menos 1 caractere(s)'),
                email: handleZod.email(),
                numberPhone: z.string().min(11, 'O campo Telefone deve conter pelo menos 11 caractere(s)').max(11, 'O campo Telefone deve conter no máximo 11 caractere(s)'),
                password: z.string().min(1, 'O campo Senha deve conter pelo menos 1 caractere(s)'),
                codCompany: z.number(handleZod.params('codCompany', 'número')),
            });
            UserSchema.parse(req.body);
            
            const newPassword = tools.encrypt(password);
            await clientDB.new({
                name,
                email,
                password: newPassword,
                numberPhone,
                codCompany,
            });

            res.json({status: true});
        } catch(error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        };
    },

    async companySignIn(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const EmailOrPasswdMessageError = 'Email ou Senha estão incorretos';

            const UserSchema = z.object({
                email: handleZod.email(),
                password: z.string().min(1, 'O campo Senha deve conter pelo menos 1 caractere(s)'),
            });
            UserSchema.parse(req.body);

            const selectedCompany = await companyDB.getByEmail(email);

            if(!selectedCompany || !selectedCompany?.password) throw EmailOrPasswdMessageError;
            if(selectedCompany.blocked) throw 'BLOCKED_CLIENT';
            
            const decryptPassword = tools.decrypt(selectedCompany.password);
            if(password !== decryptPassword) throw EmailOrPasswdMessageError;
            const newToken = await tools.token.generate();

            selectedCompany.password = undefined;

            const company = {
                ...selectedCompany,
                expirationTimeInMinute: tools.expirationTimeInMinute,
                dateCreated: moment().add(tools.expirationTimeInMinute, 'minute').format('YYYY-MM-DD HH:mm'),
            }
            const encryptClient = await tools.encrypt(JSON.stringify(company));
            
            res.json({ token: newToken, company: encryptClient });
        } catch (error) {
            if((error as any)?.issues) error = (error as any).issues[0];
            res.json({error});
        }
    },
    async companySignUp(req: Request, res: Response) {
        try {
            const { password } = req.body;
    
            const UserSchema = z.object({
                name: z.string().min(1, 'O campo Nome deve conter pelo menos 1 caractere(s)'),
                emailCompany: handleZod.email(),
                numberWhatsApp: z.string().min(11, 'O campo Telefone deve conter pelo menos 11 caractere(s)').max(11, 'O campo Telefone deve conter no máximo 11 caractere(s)'),
                password: z.string().min(1, 'O campo Senha deve conter pelo menos 1 caractere(s)'),
            });
            UserSchema.parse(req.body);
            
            const newPassword = tools.encrypt(password);
            await companyDB.create({
                ...req.body,
                password: newPassword,
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
                email: handleZod.email(),
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
                codCompany: data.client.codCompany,
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