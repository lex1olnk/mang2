export function up(knex) {
  return knex.schema.createTable('book_view', function(table) {
    table.bigInteger('book_id').unsigned().references('book.id')
    table.bigInteger('user_id').unsigned().references('user.id')

    table.unique(['book_id', 'user_id'])
  })
}

export function down(knex) {
  return knex.schema.dropTable('book_view')
}
