import { z } from "zod";
import { connectionToDatabase, transactionToDatabase } from "./createConnection";
import { handleZod } from "../tools/handleZod";
import { tools } from "../tools";
import lodash from "lodash";

export const employeeDB = {
    async get(newData: IParamsGet): Promise<IResponseGet> {
        try {
            const { codEmployee } = newData;
            const newEventSchema = z.object({
                codEmployee: handleZod.number('codEmployee'),
            });
            newEventSchema.parse(newData);

            const sql = `select
                            e.codEmployee,
                            e.codCompany,
                            e.nameEmployee,
                            e.emailEmployee,
                            e.password,
                            e.photo,
                            e.CPF,
                            e.CNPJ,
                            e.commissionInPercentage,
                            e.dateCreated,
                            e.isMaster,
                            e.canSchedule
                        from Employee e
                        where e.codEmployee = ?;`;
            const [result] = await connectionToDatabase(sql, [codEmployee] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async getByCompany(newData: {codCompany: number}): Promise<IResponseGetByCompany[]> {
        try {
            const { codCompany } = newData;
            const newEventSchema = z.object({
                codCompany: handleZod.number('codCompany'),
            });
            newEventSchema.parse(newData);

            const sql = `select
                            e.codEmployee,
                            e.codCompany,
                            e.nameEmployee,
                            e.emailEmployee,
                            e.photo,
                            e.CPF,
                            e.CNPJ,
                            e.commissionInPercentage,
                            e.dateCreated,
                            e.isMaster,
                            e.canSchedule,
                            e.isOutsourced,
                            CASE WHEN COALESCE((select 1 from Employee_Service es where es.codEmployee = e.codEmployee), e.isMaster)
                                THEN true
                                ELSE false
                            END AS hasServices,
                            CASE WHEN (select 1 from TimetableEmployee t where t.codEmployee = e.codEmployee and t.active = true)
                                THEN true
                                ELSE false
                            END AS hasTimetable
                        from Employee e
                        where e.codCompany = ?;`;
            const result = await connectionToDatabase(sql, [codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async getByEmail(newData: {email: string}): Promise<IResponseGet> {
        try {
            const { email } = newData;
            const newEventSchema = z.object({
                email: handleZod.email(),
            });
            newEventSchema.parse(newData);

            const sql = `select
                            codEmployee,
                            codCompany,
                            nameEmployee,
                            emailEmployee,
                            password,
                            photo,
                            CPF,
                            CNPJ,
                            commissionInPercentage,
                            dateCreated,
                            isMaster,
                            canSchedule
                        from Employee
                        where lower(emailEmployee) = lower(?);`;
            const [result] = await connectionToDatabase(sql, [email] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async getPermissionsByDefault(newData: IParamsGetPermissionsByDefault): Promise<IResponseGetPermissionsByDefault[]> {
        try {
            const { codAccessProfile } = newData;
            const newEventSchema = z.object({
                codAccessProfile: handleZod.number('codAccessProfile'),
            });
            newEventSchema.parse(newData);

            const sql = `SELECT
                            a.codAccessProfile,
                            p.codPermission,
                            p.name
                        FROM AccessProfile a
                            INNER JOIN AccessProfile_Permissions ap ON ap.codAccessProfile = a.codAccessProfile
                            INNER JOIN Permissions p ON p.codPermission = ap.codPermission
                        WHERE
                            a.codAccessProfile = ?;`;
            const result = await connectionToDatabase(sql, [codAccessProfile] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async getPermissions(newData: IParamsGet): Promise<IResponseGetPermissions[]> {
        try {
            const { codEmployee } = newData;
            const newEventSchema = z.object({
                codEmployee: handleZod.number('codEmployee'),
            });
            newEventSchema.parse(newData);

            const sql = `SELECT
                            ep.codAccessProfile,
                            ep.codPermission,
                            ep.accessGranted,
                            p.name,
                            e.isMaster
                        FROM Employee_Permissions ep
                            RIGHT JOIN Employee e ON e.codEmployee = ep.codEmployee
                            LEFT JOIN Permissions p ON p.codPermission = ep.codPermission
                        WHERE
                            e.codEmployee = ?;`;
            const result = await connectionToDatabase(sql, [codEmployee] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async checkPermission(newData: { codEmployee: number, codPermission: number }) {
        try {
            const { codEmployee, codPermission } = newData;
            const newEventSchema = z.object({
                codEmployee: handleZod.number('codEmployee'),
                codPermission: handleZod.number('codPermission'),
            });
            newEventSchema.parse(newData);

            const sql = `SELECT
                            COALESCE(
                                ( select 1 from Employee_Permissions ep where ep.codEmployee = ${codEmployee} and ep.codPermission = ? ),
                                ( select 1 from Employee e where e.codEmployee = ${codEmployee} and e.isMaster = true )
                            ) isExist;`;
            const result = await connectionToDatabase(sql, [codPermission] ) as any;
    
            const hasPermission = !!result[0]?.isExist === true;
            if(!hasPermission) throw 'Você não tem permissão para acessar esses dados, por favor entre em contato com sua empresa.';
        } catch (error) {
            throw error as any;
        }
    },
    async create(newEvent: IParamsCreate): Promise<void> {
        try {
            const EventSchema = z.object({
                codCompany: handleZod.number('CodCompany'),
                nameEmployee: handleZod.string('Nome do funcionário'),
                emailEmployee: handleZod.email(),
                password: handleZod.string('Senha'),
                photo: handleZod.string('Foto').optional(),
                CPF: handleZod.string('CPF').optional(),
                CNPJ: handleZod.string('CNPJ').optional(),
                commissionInPercentage: handleZod.number('Comissão').optional(),
                permissionsInJSON: z.array(z.object({
                    codAccessProfile: handleZod.number('CodAccessProfile'),
                    codPermission: handleZod.number('CodPermission'),
                    name: handleZod.string('Nome'),
                    checked: handleZod.boolean('Marcado'),
                })),
                isOutsourced: handleZod.boolean('Terceirizado').optional(),
            });
            EventSchema.parse(newEvent);

            const { codCompany, nameEmployee, emailEmployee, password, photo, CPF, CNPJ, commissionInPercentage, permissionsInJSON, isOutsourced } = newEvent;
            
            await transactionToDatabase(async (transaction) => {
                const {lastInsertRowid} = await transaction.execute({
                    sql: `  INSERT INTO Employee 
                                (codCompany, nameEmployee, emailEmployee, password, photo, CPF, CNPJ, commissionInPercentage, isOutsourced, dateCreated)
                            VALUES 
                                (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime());`,
                    args: [codCompany, nameEmployee, emailEmployee, tools.encrypt(password), (photo ?? null), (CPF ?? null), (CNPJ ?? null), (commissionInPercentage ?? null), (isOutsourced ?? false)]
                });
                
                await transaction.executeMultiple(permissionsInJSON.map((item: any) => (
                    `INSERT INTO Employee_Permissions (codEmployee, codPermission, codAccessProfile, accessGranted) VALUES (${lastInsertRowid}, ${item.codPermission}, ${item.codAccessProfile}, ${item.checked});`
                )).join(''));
            });
        } catch (error) {
            throw error as any;
        }
    },
    async update(newEvent: IParamsUpdate): Promise<void> {
        try {
            const EventSchema = z.object({
                codEmployee: handleZod.number('codEmployee'),
                nameEmployee: handleZod.string('Nome do funcionário'),
                emailEmployee: handleZod.email(),
                password: handleZod.string('Senha').optional(),
                photo: handleZod.string('Foto').optional().nullable(),
                CPF: handleZod.string('CPF').optional().nullable(),
                CNPJ: handleZod.string('CNPJ').optional().nullable(),
                commissionInPercentage: handleZod.number('Comissão').optional().nullable(),
                canSchedule: handleZod.boolean('Pode agendar').optional(),
                permissionsInJSON: z.array(z.object({
                    codAccessProfile: handleZod.number('CodAccessProfile'),
                    codPermission: handleZod.number('CodPermission'),
                    name: handleZod.string('Nome'),
                    checked: handleZod.boolean('Marcado'),
                })).optional().nullable(),
            });
            EventSchema.parse(newEvent);

            const { nameEmployee, emailEmployee, password, photo, CPF, CNPJ, commissionInPercentage, canSchedule, permissionsInJSON, codEmployee } = newEvent;
            
            await transactionToDatabase(async (transaction) => {
                await transaction.execute({
                    sql: `  UPDATE Employee SET
                                nameEmployee = ?,
                                ${lodash.isString(password) ? `password = '${tools.encrypt(password)}',` : ''}
                                ${lodash.isString(photo) ? `photo = '${photo}',` : ''}
                                ${lodash.isString(CPF) ? `CPF = '${CPF}',` : ''}
                                ${lodash.isString(CNPJ) ? `CNPJ = '${CNPJ}',` : ''}
                                ${lodash.isBoolean(canSchedule) ? `canSchedule = ${canSchedule},` : ''}
                                ${lodash.isNumber(commissionInPercentage) ? `commissionInPercentage = ${commissionInPercentage},` : ''}
                                emailEmployee = ?
                            WHERE
                                codEmployee = ?;`,
                    args: [nameEmployee, emailEmployee, codEmployee]
                });
                
                if(permissionsInJSON) {
                    await transaction.executeMultiple(`DELETE FROM Employee_Permissions WHERE codEmployee = ${codEmployee};`);
    
                    await transaction.executeMultiple(permissionsInJSON.map((item: any) => (
                        `INSERT INTO Employee_Permissions
                            (codEmployee, codPermission, codAccessProfile, accessGranted)
                        VALUES
                            (${codEmployee}, ${item.codPermission}, ${item.codAccessProfile}, ${item.checked})
                        ;`
                    )).join(''));
                }
            });
        } catch (error) {
            throw error as any;
        }
    },
    async delete(newEvent: IParamsDelete) {
        try {
            const EventSchema = z.object({            
                codEmployee: handleZod.number('codEmployee'),
            });
            EventSchema.parse(newEvent);

            const { codEmployee } = newEvent;

            await transactionToDatabase(async (transaction) => {
                await transaction.execute({
                    sql: `DELETE FROM Employee_Permissions WHERE codEmployee = ?;`,
                    args: [codEmployee]
                });

                await transaction.execute({
                    sql: `DELETE FROM Employee WHERE codEmployee = ?;`,
                    args: [codEmployee]
                });
            });
        } catch (error) {
            throw error as any;
        }
    },
    async getServiceByEmployee(newData: IParamsGetServiceByEmployee): Promise<IResponseGetServiceByEmployee[]> {
        try {
            const { codEmployee } = newData;
            const newSchema = z.object({
                codEmployee: handleZod.number('codEmployee'),
            });
            newSchema.parse(newData);

            const sql = `SELECT
                            codService,
                            accessGranted
                        FROM Employee_Service
                        WHERE codEmployee = ?
                        AND accessGranted = true;`;
            const result = await connectionToDatabase(sql, [codEmployee] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async getService(newData: IParamsGetService): Promise<IResponseGetService[]> {
        try {
            const { codCompany, codEmployee } = newData;
            const newSchema = z.object({
                codCompany: handleZod.number('codCompany'),
                codEmployee: handleZod.number('codEmployee'),
            });
            newSchema.parse(newData);

            const sql = `   SELECT
                                s.codService,
                                s.nameService,
                                CASE WHEN (
                                    SELECT 1 FROM Employee_Service es
                                    WHERE es.codService = s.codService
                                    AND es.codEmployee = ?
                                    AND es.accessGranted = true
                                )
                                    THEN true
                                    ELSE false
                                END AS accessGranted
                            FROM Service s
                            WHERE s.active = true
                            AND s.codCompany = ?;`;
            const result = await connectionToDatabase(sql, [codEmployee, codCompany] ) as any;
    
            return result;
        } catch (error) {
            throw error as any;
        }
    },
    async createService(newData: IParamsCreateService) {
        try {
            const { codEmployee, codService } = newData;
            const newSchema = z.object({
                codEmployee: handleZod.number('codEmployee'),
                codService: handleZod.number('codService').array(),
            });
            newSchema.parse(newData);

            await transactionToDatabase(async (transaction) => {
                await transaction.execute({
                    sql: `DELETE FROM Employee_Service WHERE codEmployee = ?;`,
                    args: [codEmployee],
                });

                for(const item of codService) {
                    await transaction.execute({
                        sql: `  INSERT INTO Employee_Service
                                (codEmployee, codService, accessGranted) VALUES
                                (?, ?, true);`,
                        args: [codEmployee, item],
                    });
                };
            });
        } catch (error) {
            throw error as any;
        }
    },
};

interface IParamsGet {
    codEmployee: number,
};

interface IParamsCreate {
    codCompany: number,
    nameEmployee: string,
    emailEmployee: string,
    password: string,
    photo?: string,
    CPF?: string,
    CNPJ?: string,
    commissionInPercentage?: number,
    permissionsInJSON: any,
    isOutsourced?: boolean,
};

interface IParamsUpdate {
    codEmployee: number,
    nameEmployee: string,
    emailEmployee: string,
    password?: string,
    photo?: string,
    CPF?: string,
    CNPJ?: string,
    commissionInPercentage?: number,
    canSchedule?: boolean,
    permissionsInJSON?: any,
};

interface IParamsDelete {
    codEmployee: number,
};

interface IParamsGetPermissionsByDefault {
    codAccessProfile: number,
};

interface IParamsGetService {
    codCompany: number,
    codEmployee: number,
};

interface IParamsGetServiceByEmployee {
    codEmployee: number,
};

interface IParamsCreateService {
    codEmployee: number,
    codService: number[],
};

interface IResponseGetPermissionsByDefault {
    codAccessProfile: number,
    codPermission: number,
    name: string,
};

interface IResponseGetPermissions {
    codAccessProfile: number,
    codPermission: number,
    accessGranted: boolean,
    name: string,
    isMaster: boolean,
};

interface IResponseGet {
    codEmployee: number,
    codCompany: number,
    nameEmployee: string,
    emailEmployee: string,
    password?: string,
    photo?: string,
    CPF?: string,
    CNPJ?: string,
    commissionInPercentage?: number,
    dateCreated: string,
    isMaster: boolean,
    canSchedule: boolean,
};

interface IResponseGetByCompany {
    codEmployee: number,
    codCompany: number,
    nameEmployee: string,
    emailEmployee: string,
    password?: string,
    photo?: string,
    CPF?: string,
    CNPJ?: string,
    commissionInPercentage?: number,
    dateCreated: string,
    isMaster: boolean,
    canSchedule: boolean,
    isOutsourced: boolean,
    hasServices: boolean,
    hasTimetable: boolean,
};

interface IResponseGetService {
    codService: number,
    nameService: string,
    accessGranted: boolean,
};

interface IResponseGetServiceByEmployee {
    codService: number,
    accessGranted: boolean,
};