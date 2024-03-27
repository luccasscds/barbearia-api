import { Request, Response } from "express";
import { z } from "zod";
import { clientDB } from "../../../db/clientDB";
import { tools } from "../../../tools";
import moment from "moment";
import { Email } from "./Email";
import { Google } from "./Google";
import { companyDB } from "../../../db/companyDB";
import { handleZod } from "../../../tools/handleZod";
import { handleError } from "../../../tools/handleError";

export const authController = {
    async clientSignIn(req: Request, res: Response) {
        try {
            const { email, password, slug } = req.body;
            const EmailOrPasswdMessageError = 'Email ou Senha estão incorretos';

            if(!slug) throw 'Você precisa de um link de algum estabelecimento para fazer Login';

            const UserSchema = z.object({
                email: handleZod.email(),
                password: handleZod.string('Senha', { min: 1 }),
                slug: handleZod.string('URL'),
            });
            UserSchema.parse(req.body);

            const codCompany = await companyDB.getBySlug(slug);
            if(!codCompany) throw 'Link está com problema, por favor entre em contato com seu estabelecimento.';

            const selectedClient = await clientDB.getByEmail(email);

            if(!selectedClient || !selectedClient?.passwordClient) throw EmailOrPasswdMessageError;
            if(selectedClient.blocked) throw 'BLOCKED_CLIENT';

            const isExist = await clientDB.isExistEmailOnCompanyClient(email, codCompany);
            if(!isExist) await clientDB.createCompanyClient({
                codClient: selectedClient!.codClient,
                codCompany,
            });
            
            const decryptPassword = tools.decrypt(selectedClient.passwordClient);
            if(password !== decryptPassword) throw EmailOrPasswdMessageError;
            const newToken = await tools.token.generate();

            
            const client = {
                ...selectedClient,
                codCompany,
                passwordClient: undefined,
                expirationTimeInMinute: tools.expirationTimeInMinute,
                dateCreated: moment().add(tools.expirationTimeInMinute, 'minute').format('YYYY-MM-DD HH:mm'),
            }
            const encryptClient = await tools.encrypt(JSON.stringify(client));
            
            res.json({ token: newToken, client: encryptClient });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async clientSignUp(req: Request, res: Response) {
        try {
            const { name, email, password, numberPhone, slug } = req.body;
    
            if(!slug) throw 'Você precisa de um link de algum estabelecimento para fazer Login';

            const UserSchema = z.object({
                name: handleZod.string('Nome', {min: 1}),
                email: handleZod.email(),
                numberPhone: handleZod.string('Telefone', {min: 11, max: 11}),
                password: handleZod.string('Senha', { min: 1 }),
                slug: handleZod.string('URL'),
            });
            UserSchema.parse(req.body);
            
            const codCompany = await companyDB.getBySlug(slug);
            if(!codCompany) throw 'Link está com algum problema, por favor entre em contato com seu estabelecimento.';

            let selectedClient = await clientDB.getByEmail(email);
            if(!selectedClient) {
                const newPassword = tools.encrypt(password);
                await clientDB.new({
                    name,
                    email,
                    password: newPassword,
                    numberPhone,
                    codCompany,
                });
                
                selectedClient = await clientDB.getByEmail(email);
                if(!selectedClient) throw 'Aconteceu algo de errado, o usuário não encontrado';
            };
            
            const isExist = await clientDB.isExistEmailOnCompanyClient(email, codCompany);
            if(isExist) throw 'Esse Email já está cadastrado em nosso sistema.';

            await clientDB.createCompanyClient({ codClient: selectedClient!.codClient, codCompany });
            
            const newToken = await tools.token.generate();

            selectedClient.passwordClient = undefined;
            
            const client = {
                ...selectedClient,
                codCompany,
                expirationTimeInMinute: tools.expirationTimeInMinute,
                dateCreated: moment().add(tools.expirationTimeInMinute, 'minute').format('YYYY-MM-DD HH:mm'),
            }
            const encryptClient = await tools.encrypt(JSON.stringify(client));

            res.json({ token: newToken, client: encryptClient });
        } catch(error) {
            res.json({error: handleError(error)});
        };
    },

    async companySignIn(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const EmailOrPasswdMessageError = 'Email ou Senha estão incorretos';

            const UserSchema = z.object({
                email: handleZod.email(),
                password: handleZod.string('Senha', { min: 1 }),
            });
            UserSchema.parse(req.body);

            const selectedCompany = await companyDB.getByEmail(email);

            if(!selectedCompany || !selectedCompany?.password) throw EmailOrPasswdMessageError;
            if(selectedCompany.blocked) throw 'BLOCKED_CLIENT';
            
            const decryptPassword = tools.decrypt(selectedCompany.password);
            if(password !== decryptPassword) throw EmailOrPasswdMessageError;
            const newToken = await tools.token.generate();
            
            const company = {
                codCompany: selectedCompany.codCompany,
                name: selectedCompany.name,
                blocked: selectedCompany.blocked,
                emailCompany: selectedCompany.emailCompany,

                expirationTimeInMinute: tools.expirationTimeInMinute,
                dateCreated: moment().add(tools.expirationTimeInMinute, 'minute').format('YYYY-MM-DD HH:mm'),
            };
            const encryptClient = await tools.encrypt(JSON.stringify(company));
            
            res.json({ token: newToken, company: encryptClient });
        } catch (error) {
            res.json({error: handleError(error)});
        }
    },
    async companySignUp(req: Request, res: Response) {
        try {
            const { password, emailCompany } = req.body;
    
            const UserSchema = z.object({
                name: handleZod.string('Nome', {min: 1}),
                emailCompany: handleZod.email(),
                numberWhatsApp: handleZod.string('Telefone', {min: 11, max: 11}),
                password: handleZod.string('Senha', { min: 1 }),
            });
            UserSchema.parse(req.body);
            
            const newPassword = tools.encrypt(password);
            await companyDB.create({
                ...req.body,
                password: newPassword,
            });

            const selectedCompany = await companyDB.getByEmail(emailCompany.toLowerCase());
            if(!selectedCompany) throw 'Aconteceu algo de errado, o usuário não encontrado';
            const newToken = await tools.token.generate();

            const company = {
                codCompany: selectedCompany.codCompany,
                name: selectedCompany.name,
                blocked: selectedCompany.blocked,
                emailCompany: selectedCompany.emailCompany,

                expirationTimeInMinute: tools.expirationTimeInMinute,
                dateCreated: moment().add(tools.expirationTimeInMinute, 'minute').format('YYYY-MM-DD HH:mm'),
            }
            const encryptClient = await tools.encrypt(JSON.stringify(company));
            
            res.json({ token: newToken, company: encryptClient });
        } catch(error) {
            res.json({error: handleError(error)});
        };
    },

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email, isCompany } = req.body;
    
            const UserSchema = z.object({
                email: handleZod.email(),
                isCompany: handleZod.boolean('isCompany'),
            });
            UserSchema.parse(req.body);
            
            const client: any = isCompany 
                ? await companyDB.getByEmail(email)
                : await clientDB.getByEmail(email)
            ;
            if(!client) throw 'Não existe email cadastrado';
            
            await Email.send({
                accessToken: await Google.getAccessToken(),
                client: {
                    email,
                    name: client.name ?? client.nameClient,
                    isCompany,
                },
            });

            res.json({status: true});
        } catch(error) {
            res.json({error: handleError(error)});
        };
    },

    async createPassword(req: Request, res: Response) {
        try {
            const { token, password, confirmPassword } = req.body;
            const data = JSON.parse(await tools.decrypt(token) ?? '{}');

            if(password !== confirmPassword) throw 'As senhas precisam ser iguais.';
            
            const PasswordsSchema = z.object({
                password: handleZod.string('Senha', { min: 1 }),
                confirmPassword: handleZod.string('Confirma Senha', { min: 1 }),
            });
            PasswordsSchema.parse(req.body);
            
            await tools.token.verify(data.token);
            
            if(data.client.isCompany) {
                const result: any = await companyDB.getByEmail(data.client.email);
                await companyDB.update({
                    ...result,
                    password: await tools.encrypt(password),
                });
            } else {
                const result: any = await clientDB.getByEmail(data.client.email);
                await clientDB.update({
                    ...result,
                    id: result!.codClient,
                    password: await tools.encrypt(password),
                });
            }

            res.json({status: true});
        } catch(error) {
            if((error as any).code === 'ERR_JWT_EXPIRED') error = 'Sua seção expirou, por favor tente gerar outro link';
            
            res.json({error: handleError(error)});
        };
    },
};