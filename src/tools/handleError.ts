export function handleError(error: any) {
    console.error(error); // temp

    if(error?.issues) { // zod
        if(error.issues[0].unionErrors) {
            error = error.issues[0].unionErrors[0].issues[0];
        } else {
            error = error.issues[0];
        }
    } else if(error.cause) { // SQLite
        if(error.cause.message && (error.cause.message as string).includes('UNIQUE')) {
            error = {
                message: 'Não pode adicionar ou atualizar um registro já existe. Por favor escolha outro nome.',
                stack: error.cause.message,
            }
        } else {
            error = error.cause.message;
        }
    } else if(error.code) { // JWT 
        error = { ...error }
    } else if(error.message) { // Error
        error = {
            message: error.message,
            stack: error.stack,
        }
    };
    
    return error;
}