import { z } from "zod"

export const handleZod = {
    params(fieldName: string, type: string) {
        return {
            invalid_type_error: `O campo ${fieldName} precisa ser ${type}`,
            required_error: `O campo ${fieldName} é obrigatório`,
            // errorMap: z.ZodErrorMap | undefined,
            // description: '',
        }
    },
    email() {
        return z.string(handleZod.params('Email', 'tipo email')).email('Email inválido');
    },
    date() {
        return z.string(handleZod.params('Data', 'tipo data')).regex(/^\d{4}-\d{2}-\d{2}$/g, 'O formato Data esperado é YYYY-MM-DD');
    },
    time(fieldName: string) {
        return z.string(handleZod.params(fieldName, 'no formato 00:00 ou 00:00:00')).regex(/^(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2})$/, 'O formato Hora esperado é HH:mm ou HH:mm:ss')
    }
}