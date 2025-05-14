export function up(knex) {
  return knex.schema.createTable('team', function(table) {
    table.bigIncrements('id')
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at').nullable()

    table.string('name', 255).notNullable()

    table.index('name', null, {indexType: 'FULLTEXT'})
  })
}

export function down(knex) {
  return knex.schema.dropTable('team')
}
