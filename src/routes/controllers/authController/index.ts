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
import { toolsSQL } from "../../../tools/toolsSQL";
import lodash from 'lodash';

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

            const selectedClient = await clientDB.getByEmail({email, codCompany});

            if(!selectedClient || !selectedClient?.passwordClient) throw EmailOrPasswdMessageError;
            if(selectedClient.blocked) throw 'BLOCKED_CLIENT';
            
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
            const { name, email, password, numberPhone, slug, birthdayDate } = req.body;
    
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

            const isExist = await toolsSQL.isExist({
                table: 'Client',
                field: 'emailClient',
                value: email,
                condition: `codCompany = ${codCompany}`,
            });
            if(isExist) throw 'Esse Email já está cadastrado em nosso sistema.';
            
            let selectedClient = await clientDB.getByEmail({email, codCompany});

            if(!selectedClient) {
                const newPassword = tools.encrypt(password);
                await clientDB.new({
                    name,
                    email,
                    password: newPassword,
                    numberPhone,
                    codCompany,
                    birthdayDate,
                });
                
                selectedClient = await clientDB.getByEmail({email, codCompany});
                if(!selectedClient) throw 'Aconteceu algo de errado, o usuário não encontrado';
            };
            
            const newToken = await tools.token.generate();
            
            const client = {
                ...selectedClient,
                passwordClient: undefined,
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
    async googleSignIn(req: Request, res: Response) {
        try {
            const { token, slug, } = req.body;
    
            if(!slug) throw 'Você precisa de um link de algum estabelecimento para fazer Login';

            const UserSchema = z.object({
                token: handleZod.string('Token'),
                slug: handleZod.string('URL'),
            });
            UserSchema.parse(req.body);
            
            const codCompany = await companyDB.getBySlug(slug);
            if(!codCompany) throw 'Link está com algum problema, por favor entre em contato com seu estabelecimento.';

            const userInfo = await Google.getUserInfo(token);
            console.log(userInfo)
            
            let selectedClient = await clientDB.getByEmail({
                email: userInfo.email,
                codCompany,
            });

            if(selectedClient) {
                await clientDB.update({
                    codClient: selectedClient.codClient,
                    emailClient: selectedClient.emailClient,
                    nameClient: userInfo.name,
                    blocked: !!selectedClient.blocked,
                    birthdayDate: userInfo.birthday,
                    numberPhone: userInfo.phoneNumber,
                    photo: userInfo.picture,
                });
            } else {
                await clientDB.new({
                    name: userInfo.name,
                    email: userInfo.email,
                    numberPhone: userInfo.phoneNumber ?? '',
                    birthdayDate: userInfo.birthday,
                    codCompany,
                    photo: userInfo.picture,
                });
                
                selectedClient = await clientDB.getByEmail({
                    email: userInfo.email,
                    codCompany,
                });
                if(!selectedClient) throw 'Aconteceu algo de errado, o usuário não encontrado';
            };
            
            const newToken = await tools.token.generate();
            
            const client = {
                ...selectedClient,
                passwordClient: undefined,
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
            const { email, slug } = req.body;
    
            const UserSchema = z.object({
                email: handleZod.email(),
                slug: handleZod.string('URL').optional(),
            });
            UserSchema.parse(req.body);
            
            let codCompany;
            if(slug) {
                codCompany = await companyDB.getBySlug(slug);
                if(!codCompany) throw 'Link está com algum problema, por favor entre em contato com seu estabelecimento.';
            };

            const client: any = codCompany 
                ? await clientDB.getByEmail({email, codCompany})
                : await companyDB.getByEmail(email)
            ;
            if(!client) throw 'Não existe email cadastrado';
            
            await Email.send({
                accessToken: await Google.getAccessToken(),
                client: {
                    email,
                    name: client.name ?? client.nameClient,
                    codCompany,
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
            
            if(!lodash.isNumber(data.client.codCompany)) {
                const result: any = await companyDB.getByEmail(data.client.email);
                await companyDB.update({
                    ...result,
                    password: await tools.encrypt(password),
                });
            } else {
                const result = await clientDB.getByEmail({
                    email: data.client.email,
                    codCompany: data.client.codCompany,
                });
                await clientDB.update({
                    ...result!,
                    blocked: !!result?.blocked,
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