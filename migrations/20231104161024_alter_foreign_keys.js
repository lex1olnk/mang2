export async function up(knex) {
  await knex.schema.alterTable('book_pivot_genre', function(table) {
    table.dropForeign('genre_id')
    table.foreign('genre_id').onDelete('CASCADE').references('genre.id')
  })

  await knex.schema.alterTable('book_pivot_book_tag', function(table) {
    table.dropForeign('book_tag_id')
    table.foreign('book_tag_id').onDelete('CASCADE').references('book_tag.id')
  })

  await knex.schema.alterTable('team_teammate', function(table) {
    table.dropForeign('team_id')
    table.foreign('team_id').onDelete('CASCADE').references('team.id')
  })

  await knex.schema.alterTable('team_subscriber', function(table) {
    table.dropForeign('team_id')
    table.foreign('team_id').onDelete('CASCADE').references('team.id')
  })
}

export async function down(knex) {

}
