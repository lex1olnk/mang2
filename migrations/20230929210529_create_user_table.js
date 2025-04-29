export function up(knex) {
  return knex.schema.createTable('user', function(table) {
    table.bigIncrements('id')
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at').nullable()

    table.string('email', 255).notNullable()
    table.string('password', 255).notNullable()
    table.string('name', 255).notNullable()
    table.enu('role', ['', 'admin'])

    table.unique('email')
  })
}

export function down(knex) {
  return knex.schema.dropTable('user')
}
