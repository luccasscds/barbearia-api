export function handleError(error: any) {
    console.error(error); // temp

    if(error?.issues) {
        error = error.issues[0]; // zod
    } else if(error.cause) {
        // SQLite
        if(error.cause.message && (error.cause.message as string).includes('UNIQUE')) {
            error = {
                message: 'Não pode adicionar ou atualizar um registro já existe. Por favor escolha outro nome.',
                stack: error.cause.message,
            }
        } else {
            error = error.cause.message;
        }
    };
    
    return error;
}