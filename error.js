class DBValidation extends Error {
    errors

    constructor(errors) {
        super(`Ошибки базы данных (${errors.length}) шт.`)
        this.errors = errors
    }
}

class DBAccessDenied extends DBValidation {
    constructor(model, action) {
        super([{message: `Нет доступа "${action}" к модели ${model}`}])
    }
}

class DBUnknownProperty extends DBValidation {
    constructor(model, property) {
        super([{property, message: `Свойство ${property} не найдено в модели ${model}`}])
    }
}

class DBUnknownModel extends DBValidation {
    constructor(modelName) {
        super([{message: `Модель ${modelName} не найдена`}])
    }
}

class DBUnknownReference extends DBValidation {
    constructor(model, reference) {
        super([{property: reference, message: `Связь ${reference} не найдена в модели ${model}`}])
    }
}

class DBWrongFilter extends DBValidation {
    constructor() {
        super([{message: 'Неправильный фильтр'}])
    }
}

class HttpError extends Error {}

class BadRequest extends HttpError {
    constructor() {
        const args = Array.prototype.slice.call(arguments)
        args[0] ||= 'Bad Request'
        super(...args)
    }

    get code() { return 400 }
}

class Unauthorized extends HttpError {
    constructor() {
        const args = Array.prototype.slice.call(arguments)
        args[0] ||= 'Unauthorized'
        super(...args)
    }

    get code() { return 401 }
}

class Forbidden extends HttpError {
    constructor() {
        const args = Array.prototype.slice.call(arguments)
        args[0] ||= 'Forbidden'
        super(...args)
    }

    get code() { return 403 }
}

class NotFound extends HttpError {
    constructor() {
        const args = Array.prototype.slice.call(arguments)
        args[0] ||= 'Not Found'
        super(...args)
    }

    get code() { return 404 }
}

export default {
    DBValidation,
    DBAccessDenied,
    DBUnknownProperty,
    DBUnknownModel,
    DBUnknownReference,
    DBWrongFilter,
    HttpError,
    BadRequest,
    Unauthorized,
    Forbidden,
    NotFound,
}
