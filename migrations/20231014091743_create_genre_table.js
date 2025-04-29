export async function up(knex) {
  await knex.schema.createTable('genre', function(table) {
    table.bigIncrements('id')
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at').nullable()

    table.string('name', 255).notNullable()

    table.unique('name')
  })

  await knex.schema.createTable('book_pivot_genre', function(table) {
    table.bigInteger('book_id').unsigned().references('book.id')
    table.bigInteger('genre_id').unsigned().references('genre.id')

    table.unique(['book_id', 'genre_id'])
    table.index('genre_id')
  })
}

export async function down(knex) {
  await knex.schema.dropTable('book_pivot_genre')
  await knex.schema.dropTable('genre')
}
