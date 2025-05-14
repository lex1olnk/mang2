export async function up(knex) {
  await knex.schema.createTable('user', function(table) {
    table.bigIncrements('id')
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at').nullable()

    table.string('email', 255).notNullable()
    table.string('password', 255).notNullable()
    table.string('name', 255).notNullable()
    table.enu('role', ['', 'admin', 'moderator'])
    table.string('avatar', 255).nullable()
    table.boolean('email_subscription').notNullable().defaultTo(true)

    table.integer('books_count').notNullable().defaultTo(0)
    table.integer('chapters_in_month').notNullable().defaultTo(0)
    table.integer('likers_count').notNullable().defaultTo(0)
    table.integer('subscribers_count').notNullable().defaultTo(0)

    table.unique('email')
    table.unique('avatar')
  })

  await knex.schema.createTable('user_social', table => {
    table.bigIncrements('id')

    table.bigInteger('user_id').unsigned().notNullable().references('user.id')

    table.string('uri', 255).notNullable()
    table.string('name', 255).nullable()
    table.enu('type', ['vk']).nullable()

    table.unique(['user_id', 'uri'])
  })

  await knex.schema.createTable('user_liker', table => {
    table.bigInteger('user_id').unsigned().notNullable().references('user.id')
    table.bigInteger('liker_id').unsigned().notNullable().references('user.id')

    table.primary(['user_id', 'liker_id'])
    table.index('liker_id')
  })

  await knex.schema.createTable('user_subscriber', table => {
    table.bigInteger('user_id').unsigned().notNullable().references('user.id')
    table.bigInteger('subscriber_id').unsigned().notNullable().references('user.id')

    table.primary(['user_id', 'subscriber_id'])
    table.index('subscriber_id')
  })
}

export async function down(knex) {
  await knex.schema.dropTable('user_subscriber')
  await knex.schema.dropTable('user_liker')
  await knex.schema.dropTable('user_social')
  await knex.schema.dropTable('user')
}
