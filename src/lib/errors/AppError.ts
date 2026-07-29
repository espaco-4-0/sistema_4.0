export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number,
        public readonly code?: string
    ) {
        super(message);
        this.name = "AppError";
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
        super(id ? `${resource} with id "${id}" not found` : `${resource} not found`, 404, "NOT_FOUND");
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 422, "VALIDATION_ERROR");
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, "CONFLICT");
    }
}
