export async function up(knex) {
  await knex.schema.createTable('book_tag', function(table) {
    table.bigIncrements('id')
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at').nullable()

    table.string('name', 255).notNullable()

    table.unique('name')
  })

  await knex.schema.createTable('book_pivot_book_tag', function(table) {
    table.bigInteger('book_id').unsigned().references('book.id')
    table.bigInteger('book_tag_id').unsigned().references('book_tag.id')

    table.unique(['book_id', 'book_tag_id'])
    table.index('book_tag_id')
  })
}

export async function down(knex) {
  await knex.schema.dropTable('book_pivot_book_tag')
  await knex.schema.dropTable('book_tag')
}
