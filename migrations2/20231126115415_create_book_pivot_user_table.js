export function up(knex) {
  return knex.schema.createTable('book_pivot_user', function(table) {
    table.bigInteger('book_id').unsigned()
    table.bigInteger('user_id').unsigned()
    table.boolean('create').notNull().default(false)
    table.boolean('read').notNull().default(false)
    table.boolean('update').notNull().default(false)
    table.boolean('delete').notNull().default(false)
    table.boolean('grant').notNull().default(false)

    table.unique(['book_id', 'user_id'])
    table.foreign('book_id').references('book.id').onDelete('CASCADE')
    table.foreign('user_id').references('user.id').onDelete('CASCADE')
    table.index('create')
    table.index('read')
    table.index('update')
    table.index('delete')
    table.index('grant')
  })
}

export function down(knex) {
  return knex.schema.dropTable('book_pivot_user')
}
