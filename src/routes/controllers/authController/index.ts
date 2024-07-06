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
import { employeeDB } from "../../../db/employeeDB";
import { transactionToDatabase } from "../../../db/createConnection";

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

            const selectedEmployee = await employeeDB.getByEmail({email});

            if(!selectedEmployee || !selectedEmployee?.password) throw EmailOrPasswdMessageError;
            
            const decryptPassword = tools.decrypt(selectedEmployee.password);
            if(password !== decryptPassword) throw EmailOrPasswdMessageError;
            const newToken = await tools.token.generate();
            
            const company = {
                codCompany: selectedEmployee.codCompany,
                codEmployee: selectedEmployee.codEmployee,
                name: selectedEmployee.nameEmployee,
                email: selectedEmployee.emailEmployee,

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
            const { password, emailCompany, name, numberWhatsApp } = req.body;
    
            const UserSchema = z.object({
                name: handleZod.string('Nome', {min: 1}),
                emailCompany: handleZod.email(),
                numberWhatsApp: handleZod.string('Telefone', {min: 11, max: 11}),
                password: handleZod.string('Senha', { min: 1 }),
            });
            UserSchema.parse(req.body);
            
            await transactionToDatabase(async (transaction) => {
                const { lastInsertRowid: codCompany } = await transaction.execute({
                    sql: `  INSERT INTO Company
                                (nameCompany, numberWhatsApp)
                            VALUES
                                (?, ?);`,
                    args: [name, numberWhatsApp],
                });

                await transaction.execute({
                    sql: `  INSERT INTO Timetable (day, codCompany, active, time01, time02, time03, time04) VALUES
                            ('Domingo',         ${codCompany}, false, '',           '',         '',         ''),
                            ('Segunda-feira',   ${codCompany}, true, '08:00:00',    '12:00:00', '13:00:00', '18:00:00'),
                            ('Terça-feira',     ${codCompany}, true, '08:00:00',    '12:00:00', '13:00:00', '18:00:00'),
                            ('Quarta-feira',    ${codCompany}, true, '08:00:00',    '12:00:00', '13:00:00', '18:00:00'),
                            ('Quinta-feira',    ${codCompany}, true, '08:00:00',    '12:00:00', '13:00:00', '18:00:00'),
                            ('Sexta-feira',     ${codCompany}, true, '08:00:00',    '12:00:00', '13:00:00', '18:00:00'),
                            ('Sábado',          ${codCompany}, false, '',            '',         '',         '');`,
                    args: [],
                });

                await transaction.execute({
                    sql: `  INSERT INTO ConfigSchedule (codCompany, keyConfig, valueConfig) values 
                            (${codCompany}, 'timeIntervalMin', '15'),
                            (${codCompany}, 'maxDay', '15'),
                            (${codCompany}, 'cancelHoursBefore', '2'),
                            (${codCompany}, 'textCancellationPolicy', 'Caso o cancelamento não seja feito 2h antes, será cobrado 50% do valor do serviço como multa por não comprimento com a as normas do estabelecimento'),
                            (${codCompany}, 'allowCancellation', 'true'),
                            (${codCompany}, 'textToClient', ''),
                            (${codCompany}, 'pixRatePercentage', '50'),
                            (${codCompany}, 'keyPix', ''),
                            (${codCompany}, 'allowSchedulingHolidays', 'false');`,
                    args: [],
                });

                const { lastInsertRowid: codEmployee } = await transaction.execute({
                    sql: `  INSERT INTO Employee 
                                (codCompany, nameEmployee, emailEmployee, password, isMaster, canSchedule, dateCreated)
                            VALUES 
                                (?, ?, ?, ?, ?, ?, datetime());`,
                    args: [codCompany, name, emailCompany.toLowerCase(), tools.encrypt(password), true, true],
                });

                await transaction.execute({
                    sql: `  INSERT INTO TimetableEmployee (day, codEmployee, active, time01, time02, time03, time04) VALUES
                            ('Domingo',         ${codEmployee}, false, '',           '',         '',         ''),
                            ('Segunda-feira',   ${codEmployee}, true, '08:00:00',    '12:00:00', '13:00:00', '18:00:00'),
                            ('Terça-feira',     ${codEmployee}, true, '08:00:00',    '12:00:00', '13:00:00', '18:00:00'),
                            ('Quarta-feira',    ${codEmployee}, true, '08:00:00',    '12:00:00', '13:00:00', '18:00:00'),
                            ('Quinta-feira',    ${codEmployee}, true, '08:00:00',    '12:00:00', '13:00:00', '18:00:00'),
                            ('Sexta-feira',     ${codEmployee}, true, '08:00:00',    '12:00:00', '13:00:00', '18:00:00'),
                            ('Sábado',          ${codEmployee}, false, '',            '',         '',         '');`,
                    args: [],
                });
            });

            const selectedEmployee = await employeeDB.getByEmail({email: emailCompany.toLowerCase()});
            if(!selectedEmployee) throw 'Aconteceu algo de errado, o usuário não encontrado';

            const company = {
                codCompany: selectedEmployee.codCompany,
                codEmployee: selectedEmployee.codEmployee,
                name: selectedEmployee.nameEmployee,
                emailCompany: selectedEmployee.emailEmployee,

                expirationTimeInMinute: tools.expirationTimeInMinute,
                dateCreated: moment().add(tools.expirationTimeInMinute, 'minute').format('YYYY-MM-DD HH:mm'),
            }
            const encryptClient = await tools.encrypt(JSON.stringify(company));
            
            res.json({
                token: await tools.token.generate(),
                company: encryptClient,
            });
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
                : await employeeDB.getByEmail({ email })
            ;
            if(!client) throw 'Não existe email cadastrado';
            
            await Email.send({
                accessToken: await Google.getAccessToken(),
                client: {
                    email,
                    name: client.nameEmployee ?? client.nameClient,
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
                const result: any = await employeeDB.getByEmail({ email: data.client.email });
                await employeeDB.update({ 
                    ...result,
                    canSchedule: !!result.canSchedule,
                    password: password,
                });
            } else {
                const result = await clientDB.getByEmail({
                    email: data.client.email,
                    codCompany: data.client.codCompany,
                });
                await clientDB.update({
                    ...result!,
                    blocked: !!result?.blocked,
                    password: password,
                });
            }

            res.json({status: true});
        } catch(error) {
            if((error as any).code === 'ERR_JWT_EXPIRED') error = 'Sua seção expirou, por favor tente gerar outro link';
            
            res.json({error: handleError(error)});
        };
    },
};