export function up(knex) {
  return knex.schema.createTable('team_comment', function(table) {
    table.bigIncrements('id')
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at').nullable()

    table.bigInteger('parent_id').unsigned().nullable().references('team_comment.id')
    table.bigInteger('team_id').unsigned().notNullable().references('team.id')
    table.bigInteger('user_id').unsigned().notNullable().references('user.id')

    table.text('content', 'mediumtext').notNullable()
  })
}

export function down(knex) {
  return knex.schema.dropTable('team_comment')
}
