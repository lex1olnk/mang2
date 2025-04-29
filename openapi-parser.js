const OPEN_API_REF_REGEX = /^#\/components\/schemas\//

export default class OpenApiParser {
    #openApi

    constructor(openApi) {
        this.#openApi = openApi
    }

    parseModelProperties(schema) {
        let properties = {}

        if ('type' in schema && schema.type == 'object') {
            properties = {...properties, ...this.selectScalarProperties(schema.properties)}

            const required = schema.required || []
            for (const [name, property] of Object.entries(properties)) {
                property.required = property.required || required.indexOf(name) >= 0
            }
        } else if ('allOf' in schema && Object.keys(schema).length == 1) {
            for (const part of schema.allOf) {
                const props = this.parseModelProperties(part, this.#openApi)
                properties = {...properties, ...props}
            }
        } else if ('$ref' in schema && Object.keys(schema).length == 1) {
            if ( ! OPEN_API_REF_REGEX.test(schema.$ref)) throw new Error(`Ссылка на схему должна начинаться с #/components/schemas/`)

            const refName = schema.$ref.replace(OPEN_API_REF_REGEX, '')
            if ( ! (refName in this.#openApi.components.schemas)) throw new Error(`Ссылка на схему не найдена (${refName})`)

            const props = this.parseModelProperties(this.#openApi.components.schemas[refName], this.#openApi)
            properties = {...properties, ...props}
        } else throw new Error(`Не получилось разобрать схему модели (${JSON.stringify(schema)})`)

        return properties
    }

    parseModelRefs(schema) {
        let refs = {}

        if ('type' in schema && schema.type == 'object') {
            const required = schema.required || []

            for (const [name, property] of Object.entries(schema.properties)) {
                if ('$ref' in property && Object.keys(property).length == 1) {
                    if ( ! OPEN_API_REF_REGEX.test(property.$ref)) throw new Error(`Ссылка на схему должна начинаться с #/components/schemas/`)

                    refs[name] = {model: property.$ref.replace(OPEN_API_REF_REGEX, '')}
                } else if ('type' in property) {
                    if (property.type == 'array' && 'items' in property && '$ref' in property.items) {
                        refs[name] = {model: property.items.$ref.replace(OPEN_API_REF_REGEX, '')}
                    }
                } else throw new Error(`Не получилось разобрать связь (${name})`)

                if (refs[name]) refs[name].required = required.indexOf(name) >= 0
            }
        } else if ('$ref' in schema && Object.keys(schema).length == 1) {
            if ( ! OPEN_API_REF_REGEX.test(schema.$ref)) throw new Error(`Ссылка на схему должна начинаться с #/components/schemas/`)

            const refName = schema.$ref.replace(OPEN_API_REF_REGEX, '')
            if ( ! (refName in this.#openApi.components.schemas)) throw new Error(`Ссылка на схему не найдена (${refName})`)

            refs = {...refs, ...this.parseModelRefs(this.#openApi.components.schemas[refName], this.#openApi)}
        } else if ('allOf' in schema && Object.keys(schema).length == 1) {
            for (const part of schema.allOf) {
                refs = {...refs, ...this.parseModelRefs(part, this.#openApi)}
            }
        } else throw new Error(`Не получилось разобрать связи модели (${JSON.stringify(schema)})`)

        return refs
    }

    selectScalarProperties(properties) {
        const scalarProperties = {}

        for (const [name, property] of Object.entries(properties)) {
            if (property.type == 'integer' || property.type == 'string') scalarProperties[name] = property
        }

        return scalarProperties
    }
}
