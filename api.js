import asyncHandler from 'express-async-handler'
import apiConfig from './config/api.js'
import error from './error.js'
import express from 'express'
import security from './security.js'

const api = express()

async function getClientContext(req) {
    return {user: req.db.getExportData('UserFull', await req.context.user())}
}

function getModelName(slug, type) {
    let modelName = null

    for (const [modelSlug, name] of Object.entries(apiConfig.modelSlugs[type])) {
        if (modelSlug == slug) modelName = name
    }

    if (!modelName) throw new error.NotFound()

    return modelName
}

api.get('/context', asyncHandler(async (req, res) => {
    res.json(await getClientContext(req))
}))

api.post('/login', asyncHandler(async (req, res) => {
    const login = req.body.login
    const password = req.body.password

    if ( ! (login && password)) throw new error.BadRequest('Нужно передать логин и пароль')

    const users = await req.db.find('UserFull', {email: login}, {access: {read:  true}})
    if (!users.length) throw new error.Unauthorized('Неправильный логин или пароль')

    const user = users[0]
    if (!security.isPasswordValid(password, user.password)) throw new error.Unauthorized('Неправильный логин или пароль')

    req.session.user = {id: user.id}
    res.json({context: await getClientContext(req)})
}))

api.post('/logout', asyncHandler(async (req, res) => {
    delete req.session.user

    throw new error.Unauthorized()
}))

api.post('/grant/user/:userId/:type/:id', asyncHandler(async (req, res) => {
    const modelName = getModelName(req.params.type, 'single')
    const model = req.db.getModel(modelName)

    const entity = await req.db.findOne(modelName, {id: req.params.id}, {access: {read: true}})
    if (!entity) throw new error.NotFound()

    const granted = await req.db.grant(modelName, req.body, entity, {id: req.params.userId}, {user: await req.context.user()})

    res.json({granted})
}))

api.get('/:type', asyncHandler(async (req, res) => {
    let modelName = getModelName(req.params.type, 'plural')
    const model = req.db.getModel(modelName)

    const page = parseInt(req.query.page) || 1
    if (page < 1) throw new error.BadRequest('Неправильный номер страницы')

    const pageSize = parseInt(req.query.pageSize) || model.config?.defaults?.pageSize || 0
    const maxPageSize = model.config?.defaults?.maxPageSize || 0
    if (pageSize > maxPageSize) throw new error.BadRequest('Превышен максимальный размер страницы')

    const user = await req.context.user()
    if (user && user.role == 'admin') modelName += 'Full'

    const filter = req.query.filter || {}
    const options = {user}

    const count = (await req.db.count(modelName, filter, options))[0].count
    const pagesCount = Math.ceil(count / pageSize)

    let entities = []
    if (page <= pagesCount) {
        options.limit = pageSize
        options.offset = (page - 1) * pageSize

        if ('with' in req.query) options.with = req.query.with

        entities = await req.db.find(modelName, filter, options)
    }

    res.json({
        [req.params.type]: req.db.getExportData(modelName, entities),
        pager: {
            total: pagesCount,
            size: pageSize,
            current: page,
        },
    })
}))

api.post('/:type', asyncHandler(async (req, res) => {
    const modelName = getModelName(req.params.type, 'plural')
    const model = req.db.getModel(modelName)

    const data = {...req.body}

    const user = await req.context.user()
    if (model.config.user_id) {
        if (!user) throw new error.DBAccessDenied(modelName, 'create')
        data.user = user
    }

    const entity = await req.db.create(modelName, data, {user})

    res.json(req.db.getExportData(modelName, entity))
}))

api.delete('/:type/:id', asyncHandler(async (req, res) => {
    const modelName = getModelName(req.params.type, 'single')
    const entity = await req.db.findOne(modelName, {id: req.params.id})
    if (!entity) throw new error.NotFound()

    const user = await req.context.user()

    await req.db.delete(modelName, entity, {user})

    res.json(true)
}))

api.patch('/:type/:id', asyncHandler(async (req, res) => {
    if (!Object.keys(req.body).length) throw new error.BadRequest('Нужно предоставить данные для изменения')

    const modelName = getModelName(req.params.type, 'single')
    const entity = await req.db.findOne(modelName, {id: req.params.id}, {access: {read: true}})
    if (!entity) throw new error.NotFound()

    const user = await req.context.user()
    const data = {...req.body}
    data.id = entity.id

    res.json(req.db.getExportData(modelName, await req.db.update(modelName, data, {user})))
}))

export default api
