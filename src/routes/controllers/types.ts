export interface IResponseDB extends IErrorSQL {
    fieldCount: number,
    affectedRows: number,
    insertId: number,
    info: string,
    serverStatus: number,
    warningStatus: number,
    changedRows: number,
}

export interface IErrorSQL {
    message: string,
    code: string,
    errno: number,
    sql: string,
    sqlState: string,
    sqlMessage: string,
}