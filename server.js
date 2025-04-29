import API from './api.js'
import asyncHandler from 'express-async-handler'
import config from './config/config.js'
import connectSessionKnex from 'connect-session-knex'
import Context from './context.js'
import DB from './db.js'
import error from './error.js'
import express from 'express'
import openApi from './openapi.json' assert {type: 'json'}
import session from 'express-session'

const app = express()

app.use('/openapi.json', express.static('openapi.json'))
app.use(express.static('public'))
app.use(express.json())

const db = new DB({})
db.loadModels(openApi)

app.use((req, res, next) => {
    req.db = db
    next()
})

app.use(session({
    name: 'session',
    store: new (connectSessionKnex(session))({
        knex: db.knex,
        tablename: 'session',
        createtable: true,
    }),
    secret: 'asdf1234',
    resave: false,
    rolling: true,
    saveUninitialize: false,
    cookie: {secure: false},
}))

app.use((req, res, next) => {
    req.context = new Context(req)
    next()
})

app.set('view engine', 'pug')
app.set('views', './tpl')
app.locals.basedir = './tpl'
app.get('/', asyncHandler(async (req, res) => {
    res.render('page/home', {
        authors: await req.db.find('Author', {}, {with: 'books'}),
        user: await req.context.user(),
    })
}))

app.use('/api', API)

app.use((err, req, res, next) => {
    if (err instanceof error.HttpError) {
        res.status(err.code).json({errors: [{message: err.message}]})
    } else if (err instanceof error.DBValidation) {
        res.status(400).json({errors: err.errors})
    } else {
        console.error(err)
        res.status(500).json(null)
    }

    next()
})

app.listen(config.server.port, () => {console.log('Start')})
