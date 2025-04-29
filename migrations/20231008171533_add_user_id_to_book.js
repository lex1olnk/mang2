export async function up(knex) {
  await knex.schema.alterTable('book', function(table) {
    table.bigInteger('user_id').unsigned().notNullable()
        .after('updated_at')
  })
  await knex('book').update({user_id: 1})
  await knex.schema.alterTable('book', function(table) {
    table.bigInteger('user_id').unsigned().notNullable().references('user.id').alter()
  })
}

export function down(knex) {
  return knex.schema.alterTable('book', function(table) {
    table.dropForeign('user_id')
    table.dropColumn('user_id')
  })
}
