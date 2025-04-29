export function up(knex) {
  return knex.schema.createTable('chapter', function(table) {
    table.bigIncrements('id')
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at').nullable()

    table.bigInteger('user_id').unsigned().notNullable().references('user.id')
    table.bigInteger('book_id').unsigned().notNullable().references('book.id')

    table.text('content', 'mediumtext').notNullable()
  })
}

export function down(knex) {
  return knex.schema.dropTable('chapter')
}
