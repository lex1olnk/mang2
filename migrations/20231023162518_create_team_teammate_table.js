export function up(knex) {
  return knex.schema.createTable('team_teammate', function(table) {
    table.bigInteger('team_id').unsigned().references('team.id')
    table.bigInteger('user_id').unsigned().references('user.id')

    table.unique(['team_id', 'user_id'])
    table.index('user_id')
  })
}

export function down(knex) {
  return knex.schema.dropTable('team_teammate')
}
