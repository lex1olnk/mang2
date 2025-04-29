function buildValidator(model) {
    const constraints = {}

    for (const [name, property] of Object.entries(model.properties)) {
        if (name === 'id') continue

        constraints[name] = {
            name,
            required: false,
            validators: [],
        }

        for (const [constraint, option] of Object.entries(property)) {
            if (constraint === 'enum') constraints[name].validators.push(buildEnumConstraint(option))
            else if (constraint === 'format') constraints[name].validators.push(buildFormatConstraint(option))
            else if (constraint === 'readOnly') constraints[name].validators.push(buildReadOnlyConstraint(option))
            else if (constraint === 'required') constraints[name].required = option
            else if (constraint === 'type') constraints[name].validators.push(buildTypeConstraint(option))
            else throw new Error(`Неизвестное ограничение (${constraint})`)
        }
    }

    for (const [name, ref] of Object.entries(model.config.refs || {})) {
        if ('belongs' in ref) {
            constraints[ref.belongs] = {
                name: `${name}.id`,
                required: model.refs[name]?.required,
                validators: [buildTypeConstraint('integer')]
            }
        }
    }

    return function(data, options = {checkRequired: true}) {
        const errors = []

        for (const [name, constraint] of Object.entries(constraints)) {
            const value = data[name]

            if (value === undefined) {
                if (options.checkRequired && constraint.required) errors.push({property: constraint.name, message: 'обязательный атрибут'})
            } else if (value === null) {
                if (constraint.required) errors.push({property: constraint.name, message: 'не может быть пустым'})
            } else {
                for (const validator of constraint.validators) {
                    const message = validator(data[name])
                    if (message) errors.push({property: constraint.name, message})
                }
            }
        }

        for (const property in data) {
            if ( ! (property in model.properties)) errors.push({property, message: 'неизвестный атрибут'})
        }

        return errors
    }
}

function buildEnumConstraint(option) {
    return function(value) {
        return option.indexOf(value) >= 0 ? null : 'неправильное значение'
    }
}

function buildFormatConstraint(option) {
    if (option === 'date-time') {
        return function(value) {
            if ( ! /^\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}$/.test(value))
                return 'требуется дата-время в формате гггг-мм-дд чч:мм:сс'

            if (isNaN(Date.parse(value))) return 'неправильное значение'
        }
    } else throw new Error(`Неизвестный формат (${option})`)
}

function buildReadOnlyConstraint(option) {
    return function(value) {
        if (option) return 'свойство только для чтения'
    }
}

function buildTypeConstraint(option) {
    if (option === 'string') {
        return function(value) {
            return typeof value === 'string' ? null : 'требуется строка'
        }
    } else if (option === 'integer') {
        return function(value) {
            return Number.isInteger(value) ? null : 'требуется целое число'
        }
    } else throw new Error(`Неизвестный тип свойства (${option})`)
}

export default {
    buildValidator,
}
