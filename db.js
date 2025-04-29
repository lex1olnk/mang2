import apiConfig from './config/api.js'
import {applyFilter} from './query-builder.js'
import config from './config/config.js'
import error from './error.js'
import knex from 'knex'
import OpenApiParser from './openapi-parser.js'
import validation from './validation.js'

export default class DB {
    #knex
    #models = []

    async count(modelName, filter = {}, options = {}) {
        let query = this.#select(modelName, filter, options)

        let columns = 'COUNT(*) AS count'
        if ('groupBy' in options) {
            query = query.groupBy(options.groupBy)
            columns += `, ${options.groupBy}`
        }

        return await query.select(this.knex.raw(columns))
    }

    async create(modelName, data, options = {}) {
        if (this.#hasAccess(modelName, 'create', options) !== true) throw new error.DBAccessDenied(modelName, 'create')
        if ('id' in data) throw new error.DBValidation([{property: 'id', message: 'нельзя указывать при создании'}])

        const model = this.getModel(modelName)

        const insertData = {}

        for (const [name, value] of Object.entries(data)) {
            if (name in model.properties) {
                insertData[name] = value
            } else if (model.config.refs && name in model.config.refs) {
                insertData[model.config.refs[name].belongs] = value.id
            } else throw new error.DBUnknownProperty(modelName, name)
        }

        const errors = model.validator(insertData)
        if (errors.length) throw new error.DBValidation(errors)

        let insertId

        try {
            [insertId] = await this.knex(model.config.table).insert(insertData)
        } catch (err) {
            if ('code' in err && err.code === 'ER_DUP_ENTRY') {
                throw new error.DBValidation([{message: 'дублированное значение'}])
            } else throw err
        }

        if (!insertId) throw new Error('Не удалось добавить сущность')

        return await this.findOne(modelName, {id: insertId})
    }

    async delete(modelName, entity, options = {}) {
        if (this.#hasAccess(modelName, 'delete', options) !== true) throw new error.DBAccessDenied(modelName, 'delete')
        if ( ! ('id' in entity) || !Number.isInteger(entity.id)) throw new error.DBValidation([{property: 'id', message: 'обязательный атрибут'}])

        const model = this.getModel(modelName)

        await this.knex(model.config.table).where('id', entity.id).del()
    }

    async find(modelName, filter = {}, options = {}) {
        const query = this.#select(modelName, filter, options)
        const entities = await query.select('*')

        if ('with' in options) {
            await this.#assignRefs(modelName, filter, options, entities)
        }

        return entities
    }

    async findOne(modelName, filter = {}, options = {}) {
        const entities = await this.find(modelName, filter, options)

        if (entities.length > 1) throw new Error(`Найдено больше одной записи (${modelName})`)

        return entities[0] || null
    }

    getExportData(modelName, data) {
        const model = this.getModel(modelName)
        let exportData

        if (Array.isArray(data)) {
            exportData = data.map(item => this.getExportData(modelName, item))
        } else if (data === null) {
            exportData = data
        } else if (typeof data === 'object') {
            exportData = {}

            for (const [name, property] of Object.entries(model.properties)) {
                exportData[name] = data[name]
            }

            for (const [name, refConfig] of Object.entries(model.refs)) {
                if ( ! (name in data)) continue

                exportData[name] = this.getExportData(refConfig.model, data[name])
            }

            for (const [name, value] of Object.entries(data)) {
                if (/\-count$/.test(name)) exportData[name] = value
            }
        } else throw new Error(`Непригодная для извлечения данных сущность ${typeof data}`)

        return exportData
    }

    getModel(name) {
        if ( ! (name in this.#models)) throw new error.DBUnknownModel(name)

        return this.#models[name]
    }

    async grant(modelName, rights, entity, user, options = {}) {
        if (await this.#hasStoredAccess(modelName, 'grant', {entity, user: options.user}) !== true) throw new error.DBAccessDenied(modelName, 'grant')

        const model = this.getModel(modelName)

        for (const [action, right] of Object.entries(rights)) {
            if ( ! (right === true || right === false)) throw new error.DBValidation({property: action, message: 'должно быть true или false'})

            const actionAccess = model.config?.access?.[action]
            if (!actionAccess?.pivot) throw new error.DBValidation({property: action, message: 'нельзя назначить'})

            const granted = await this.knex(actionAccess.pivot)
                .insert({
                    [`${model.config.table}_id`]: entity.id,
                    user_id: user.id,
                    [action]: right ? 1 : 0
                })
                .onConflict().merge()
        }

        return true
    }

    loadModels(openApi) {
        const parser = new OpenApiParser(openApi)

        for (const [name, settings] of Object.entries(apiConfig.models)) {
            for (const modelName of [name, `${name}Full`]) {
                if (modelName in openApi.components.schemas) {
                    this.#models[modelName] = {
                        config: settings,
                        properties: parser.parseModelProperties(openApi.components.schemas[modelName], openApi),
                        refs: parser.parseModelRefs(openApi.components.schemas[modelName], openApi),
                    }
                } else {
                    this.#models[modelName] = {
                        config: settings,
                        properties: parser.parseModelProperties(openApi.components.schemas[name], openApi),
                        refs: parser.parseModelRefs(openApi.components.schemas[name], openApi),
                    }
                }

                this.#models[modelName].validator = validation.buildValidator(this.#models[modelName])
            }
        }
    }

    get knex() {
        if (!this.#knex) {
            this.#knex = knex(config.knex)
        }

        return this.#knex
    }

    async update(modelName, entity, options = {}) {
        const access = await this.#hasStoredAccess(modelName, 'update', {...options, entity})
        if (access !== true) throw new error.DBAccessDenied(modelName, 'update')

        const model = this.getModel(modelName)

        const id = entity.id
        const updateData = {...entity}
        delete updateData.id

        const errors = model.validator(updateData, {checkRequired: false})
        if (errors.length) throw new error.DBValidation(errors)

        updateData.updated_at = this.knex.raw('NOW()')

        await this.knex(model.config.table).where('id', id).update(updateData)

        return this.findOne(modelName, {id}, {access: {read: true}})
    }

    #applyJoin(modelName, filter, options, query) {
        for (const [table, rule] of Object.entries(options.join)) {
            if ('-right' in rule) {
                query.rightJoin(table, ...rule['-right'])
            } else throw new Error(`Неизвестный способ join (${JSON.stringify(rule)})`)
        }
    }

    #applyOptions(modelName, filter, options, query) {
        if ('join' in options) this.#applyJoin(modelName, filter, options, query)
        if ('limit' in options) query.limit(options.limit)
        if ('offset' in options) query.offset(options.offset)
    }

    async #assignRefs(modelName, filter, options, entities) {
        const refNames = Array.isArray(options.with) ? options.with : [options.with]

        const entitiesMap = {}
        for (const entity of entities) entitiesMap[entity.id] = entity

        const refQueries = []
        for (const refName of refNames) refQueries.push(this.#buildRefQuery(modelName, refName, entities))

        const refResponses = await Promise.all(refQueries)

        for (const index in refNames) {
            let refName = refNames[index]
            const refEntities = refResponses[index]
            this.#assignRef(modelName, refName, entitiesMap, refEntities)
        }
    }

    #assignRef(modelName, refName, entitiesMap, refEntities) {
        const model = this.getModel(modelName)

        let counter = false
        if (/\-count$/.test(refName)) {
            refName = refName.replace(/\-count$/, '')
            counter = true
        }

        const refConfig = model.config.refs[refName]

        const refEntitiesMap = {}
        for (const refEntity of refEntities) refEntitiesMap[refEntity.id] = refEntity

        if (counter) {
            const counters = {}
            for (const counter of refEntities) {
                counters[counter[refConfig['hasMany'] || `${model.config.table}_id`]] = counter.count
            }

            for (const [entityId, entity] of Object.entries(entitiesMap)) {
                entity[`${refName}-count`] = counters[entity.id] || 0
            }
        } else if ('belongs' in refConfig) {
            for (const [entityId, entity] of Object.entries(entitiesMap)) {
                entity[refName] = refEntitiesMap[entity[refConfig['belongs']]] || null
            }
        } else if ('hasMany' in refConfig) {
            for (const [entityId, entity] of Object.entries(entitiesMap)) entity[refName] = []

            for (const refEntity of refEntities) {
                const entityId = refEntity[refConfig['hasMany']]

                if (entityId in entitiesMap) entitiesMap[entityId][refName].push(refEntity)
            }
        } else if ('pivot' in refConfig) {
            for (const [entityId, entity] of Object.entries(entitiesMap)) entity[refName] = []

            for (const refEntity of refEntities) {
                const entityId = refEntity[`${model.config.table}_id`]

                if (entityId in entitiesMap) entitiesMap[entityId][refName].push(refEntity)
            }
        }
    }

    #buildRefQuery(modelName, refName, entities) {
        let counter = false

        if (/\-count$/.test(refName)) {
            refName = refName.replace(/\-count$/, '')
            counter = true
        }

        const model = this.getModel(modelName)

        if ( ! (refName in model.refs)) throw new error.DBUnknownProperty(modelName, refName)
        if ( ! (model.config.refs && refName in model.config.refs)) throw new error.DBUnknownReference(modelName, refName)

        const refConfig = model.config.refs[refName]

        if (counter) {
            if ('hasMany' in refConfig) {
                const ids = entities.map(entity => entity.id)

                return this.count(refConfig.model, {[refConfig['hasMany']]: ids}, {groupBy: refConfig['hasMany']})
            } else if ('pivot' in refConfig) {
                const ids = entities.map(entity => entity.id)

                return this.count(refConfig.model, {[`${model.config.table}_id`]: ids}, {groupBy: `${model.config.table}_id`, table: refConfig.pivot})
            } else throw new error.DBUnknownProperty(modelName, `${refName}-count`)
        } else if ('belongs' in refConfig) {
            const ids = entities.map(entity => entity[refConfig['belongs']])

            return this.find(refConfig.model, {id: ids})
        } else if ('hasMany' in refConfig) {
            const ids = entities.map(entity => entity.id)

            return this.find(refConfig.model, {[refConfig['hasMany']]: ids})
        } else if ('pivot' in refConfig) {
            const ids = entities.map(entity => entity.id)
            const refModel = this.getModel(refConfig.model)

            return this.find(
                refConfig.model,
                {[`${model.config.table}_id`]: ids},
                {
                    join: {
                        [refConfig.pivot]: {
                            '-right': ['id', `${refModel.config.table}_id`]
                        }
                    }
                }
            )
        } else throw new Error(`Непонятная связь между (${modelName}) и (${refName})`)
    }

    #hasAccess(modelName, action, options = {}) {
        if (options?.user?.role === 'admin') return true

        const model = this.getModel(modelName)
        const access = options.access || model.config?.access
        const actionAccess = access ? access[action] : null

        if (actionAccess === true) return true

        if (Array.isArray(actionAccess)) return actionAccess.indexOf(options?.user?.role) >= 0

        if (actionAccess?.pivot) return options.user ? actionAccess : false

        return false
    }

    async #hasStoredAccess(modelName, action, options = {}) {
        const access = this.#hasAccess(modelName, action, options)
        if (access === true || access === false) return access

        if (!options.user) return false

        const model = this.getModel(modelName)

        let owned

        if (access.inherit) {
            const ref = model.config.refs?.[access.inherit]
            if (!ref) throw new Error(`Неопределённая связь "inherit" (${access.inherit})`)

            const parentModel = this.getModel(ref.model)

            owned = await this.knex(parentModel.config.table)
                .innerJoin(model.config.table, builder => {
                    builder.on(`${parentModel.config.table}.id`, `${model.config.table}.${ref.belongs}`)
                })
                .where(`${parentModel.config.table}.user_id`, options.user.id)
                .where(`${model.config.table}.id`, options.entity.id)
                .first()
        } else {
            owned = await this.knex(model.config.table)
                .where('id', options.entity.id)
                .where('user_id', options.user.id)
                .first()
        }
        if (owned) return true

        if (access.pivot) {
            const query = this.knex(access.pivot)

            if (access.pivot_condition) {
                query.where(...access.pivot_condition)
            } else {
                query.where(`${model.config.table}_id`, options.entity.id)
            }

            const granted = await query
                .where('user_id', options.user.id)
                .where(action, 1)
                .first()
            if (granted) return true
        }

        return false
    }

    #select(modelName, filter, options) {
        const model = this.getModel(modelName)
        const access = this.#hasAccess(modelName, 'read', options)

        if (!access) throw new error.DBAccessDenied(modelName, 'read')

        const table = options.table || model.config.table
        let query = this.knex(table)
        applyFilter(query, filter, table)
        this.#applyOptions(modelName, filter, options, query)

        if (access.inherit || access.pivot) {
            let parentModel

            if (access.inherit) {
                const ref = model.config.refs?.[access.inherit]
                if (!ref) throw new Error(`Неопределённая связь "inherit" (${access.inherit})`)

                parentModel = this.getModel(ref.model)

                query.leftJoin(parentModel.config.table, `${parentModel.config.table}.id`, `${model.config.table}.${ref.belongs}`)
            }

            if (access.pivot) {
                query.leftJoin(access.pivot, builder => {
                    if (access.pivot_condition) {
                        builder.on(...access.pivot_condition)
                    } else {
                        builder.on(`${access.pivot}.${model.config.table}_id`, `${model.config.table}.id`)
                    }

                    builder.on(`${access.pivot}.user_id`, options.user.id)
                })
            }

            query.where(builder => {
                if (access.inherit) builder.orWhere(`${parentModel.config.table}.user_id`, options.user.id)
                if (access.pivot) builder.orWhere(`${access.pivot}.read`, 1)
            })
        }

        return query
    }
}
