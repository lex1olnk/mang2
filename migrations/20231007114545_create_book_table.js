export function up(knex) {
  return knex.schema.createTable('book', function(table) {
    table.bigIncrements('id')
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at').nullable()

    table.bigInteger('author_id').unsigned().notNullable().references('author.id')

    table.string('name', 255).notNullable()
    table.text('description', 'mediumtext').nullable()
    table.integer('year').nullable()
    table.enu('status', ['in_progress']).notNullable()

    table.index('name', null, {indexType: 'FULLTEXT'})
    table.index('description', null, {indexType: 'FULLTEXT'})
    table.index('year')
    table.index('status')
  })
}

export function down(knex) {
  return knex.schema.dropTable('book')
}
