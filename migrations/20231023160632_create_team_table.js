export async function up(knex) {
  await knex.schema.createTable('team', table => {
    table.bigIncrements('id')

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.bigInteger('created_by').unsigned().notNullable().references('user.id')

    table.datetime('updated_at').nullable()
    table.bigInteger('updated_by').unsigned().nullable().references('user.id')

    table.string('name', 255).notNullable()
    table.text('description', 'mediumtext').nullable()
    table.string('avatar', 255).nullable()
    table.string('background', 255).nullable()

    table.integer('books_count').notNullable().defaultTo(0)
    table.integer('chapters_in_month').notNullable().defaultTo(0)
    table.integer('likers_count').notNullable().defaultTo(0)
    table.integer('subscribers_count').notNullable().defaultTo(0)

    table.index('name', null, {indexType: 'FULLTEXT'})
    table.unique('avatar')
    table.unique('background')
  })

  await knex.schema.createTable('team_teammate', table => {
    table.bigInteger('team_id').unsigned().references('team.id').onDelete('CASCADE')
    table.bigInteger('user_id').unsigned().references('user.id').onDelete('CASCADE')
    table.enu('role', ['', 'admin']).notNullable().default('')

    table.unique(['team_id', 'user_id'])
    table.index('user_id')
  })

  await knex.schema.createTable('team_liker', table => {
    table.bigInteger('team_id').unsigned().notNullable().references('team.id')
    table.bigInteger('liker_id').unsigned().notNullable().references('user.id')

    table.primary(['team_id', 'liker_id'])
    table.index('liker_id')
  })

  await knex.schema.createTable('team_subscriber', table => {
    table.bigInteger('team_id').unsigned().references('team.id').onDelete('CASCADE')
    table.bigInteger('subscriber_id').unsigned().references('user.id').onDelete('CASCADE')

    table.primary(['team_id', 'subscriber_id'])
    table.index('subscriber_id')
  })

  await knex.schema.createTable('team_comment', table => {
    table.bigIncrements('id')

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.bigInteger('created_by').unsigned().notNullable().references('user.id')

    table.datetime('updated_at').nullable()
    table.bigInteger('updated_by').unsigned().nullable().references('user.id')

    table.bigInteger('team_id').unsigned().notNullable().references('team.id').onDelete('CASCADE')
    table.bigInteger('parent_id').unsigned().nullable().references('team_comment.id')

    table.integer('likers_count').unsigned().notNullable().default(0)
    table.integer('dislikers_count').unsigned().notNullable().default(0)

    table.text('content', 'mediumtext').notNullable()
  })

  await knex.schema.createTable('team_comment_liker', table => {
    table.bigInteger('team_comment_id').unsigned().notNullable().references('team_comment.id')
    table.bigInteger('liker_id').unsigned().notNullable().references('user.id')
    table.boolean('positive').notNullable().default(true)

    table.primary(['team_comment_id', 'liker_id'])
    table.index('liker_id')
    table.index('positive')
  })

  await knex.schema.createTable('team_social', table => {
    table.bigIncrements('id')

    table.bigInteger('team_id').unsigned().notNullable().references('team.id')
    table.string('uri', 255).notNullable()
    table.string('name', 255).nullable()
    table.enu('type', ['vk']).nullable()

    table.unique(['team_id', 'uri'])
  })
}

export async function down(knex) {
  await knex.schema.dropTable('team_social')
  await knex.schema.dropTable('team_comment_liker')
  await knex.schema.dropTable('team_comment')
  await knex.schema.dropTable('team_subscriber')
  await knex.schema.dropTable('team_liker')
  await knex.schema.dropTable('team_teammate')
  await knex.schema.dropTable('team')
}
