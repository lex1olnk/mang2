export async function up(knex) {
  await knex.schema.createTable('book', table => {
    table.bigIncrements('id')

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.bigInteger('created_by').unsigned().notNullable().references('user.id')

    table.datetime('updated_at').nullable()
    table.bigInteger('updated_by').unsigned().nullable().references('user.id')

    table.bigInteger('author_id').unsigned().notNullable().references('author.id')
    table.bigInteger('translator_id').unsigned().notNullable().references('user.id')

    table.string('name', 255).notNullable()
    table.string('alt_name', 255).nullable()
    table.text('description', 'mediumtext').nullable()

    table.enu('type', ['original', 'translation', 'orig_fanfic', 'trans_fanfic']).notNullable()
    table.enu('status', ['discarded', 'done', 'frozen', 'progress']).notNullable().default('progress')

    table.integer('year').unsigned().nullable()
    table.enu('age_rate', [0, 16, 18]).notNullable().default(0)

    table.string('source_lang', 255).nullable()
    table.enu('source_status', ['discarded', 'done', 'frozen', 'progress']).nullable()

    table.string('background', 255).nullable()

    table.float('rate', 3, 2).notNullable().default(0.0)
    table.integer('bookmarks_count').unsigned().notNullable().default(0)
    table.integer('chapters_count').unsigned().notNullable().default(0)
    table.integer('comments_count').unsigned().notNullable().default(0)
    table.integer('likers_count').unsigned().notNullable().default(0)
    table.integer('viewers_count').unsigned().notNullable().default(0)

    table.unique('background')
    table.index('name', null, {indexType: 'FULLTEXT'})
    table.index('alt_name', null, {indexType: 'FULLTEXT'})
    table.index('description', null, {indexType: 'FULLTEXT'})
    table.index('type')
    table.index('status')
    table.index('age_rate')
    table.index('year')
    table.index('chapters_count')
    table.index('rate')
  })

  await knex.schema.createTable('bookmark', table => {
    table.bigInteger('user_id').unsigned().notNullable().references('user.id')
    table.bigInteger('book_id').unsigned().notNullable().references('book.id')

    table.enu('type', ['process', 'discarded', 'favorite', 'planned'])

    table.primary(['user_id', 'book_id'])
  })

  await knex.schema.createTable('book_comment', table => {
    table.bigIncrements('id')

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.bigInteger('created_by').unsigned().notNullable().references('user.id')

    table.datetime('updated_at').nullable()
    table.bigInteger('updated_by').unsigned().nullable().references('user.id')

    table.bigInteger('book_id').unsigned().notNullable().references('book.id')
    table.bigInteger('parent_id').unsigned().nullable().references('book_comment.id')

    table.integer('likers_count').unsigned().notNullable().default(0)
    table.integer('dislikers_count').unsigned().notNullable().default(0)

    table.text('content', 'mediumtext').notNullable()
  })

  await knex.schema.createTable('book_comment_liker', table => {
    table.bigInteger('book_comment_id').unsigned().notNullable().references('book_comment.id')
    table.bigInteger('liker_id').unsigned().notNullable().references('user.id')
    table.boolean('positive').notNullable().default(true)

    table.primary(['book_comment_id', 'liker_id'])
    table.index('liker_id')
    table.index('positive')
  })

  await knex.schema.createTable('book_liker', table => {
    table.bigInteger('book_id').unsigned().notNullable().references('book.id')
    table.bigInteger('liker_id').unsigned().notNullable().references('user.id')

    table.primary(['book_id', 'liker_id'])
    table.index('liker_id')
  })

  await knex.schema.createTable('book_rater', table => {
    table.bigInteger('book_id').unsigned().notNullable().references('book.id')
    table.bigInteger('rater_id').unsigned().notNullable().references('user.id')
    table.integer('rate').unsigned().notNullable()

    table.primary(['book_id', 'rater_id'])
    table.index('rater_id')
  })

  await knex.schema.createTable('book_viewer', table => {
    table.bigInteger('book_id').unsigned().notNullable().references('book.id')
    table.bigInteger('viewer_id').unsigned().notNullable().references('user.id')

    table.primary(['book_id', 'viewer_id'])
    table.index('viewer_id')
  })

  await knex.schema.createTable('book_fandom', table => {
    table.bigInteger('book_id').unsigned().notNullable().references('book.id')
    table.bigInteger('fandom_id').unsigned().notNullable().references('fandom.id')

    table.primary(['book_id', 'fandom_id'])
    table.index('fandom_id')
  })

  await knex.schema.createTable('book_genre', table => {
    table.bigInteger('book_id').unsigned().notNullable().references('book.id')
    table.bigInteger('genre_id').unsigned().notNullable().references('genre.id')

    table.primary(['book_id', 'genre_id'])
    table.index('genre_id')
  })

  await knex.schema.createTable('book_tag', table => {
    table.bigInteger('book_id').unsigned().notNullable().references('book.id')
    table.bigInteger('tag_id').unsigned().notNullable().references('tag.id')

    table.primary(['book_id', 'tag_id'])
    table.index('tag_id')
  })

  await knex.schema.createTable('book_social', table => {
    table.bigIncrements('id')

    table.bigInteger('book_id').unsigned().notNullable().references('book.id')
    table.string('uri', 255).notNullable()
    table.string('name', 255).nullable()
    table.enu('type', ['vk']).nullable()

    table.unique(['book_id', 'uri'])
  })

  await knex.schema.createTable('reading_history', table => {
    table.bigInteger('user_id').unsigned().notNullable().references('user.id')
    table.bigInteger('book_id').unsigned().notNullable().references('book.id')
    table.integer('chapter_number').unsigned().notNullable()

    table.primary(['user_id', 'book_id'])
  })
}

export async function down(knex) {
  await knex.schema.dropTable('reading_history')
  await knex.schema.dropTable('book_social')
  await knex.schema.dropTable('book_tag')
  await knex.schema.dropTable('book_genre')
  await knex.schema.dropTable('book_fandom')
  await knex.schema.dropTable('book_viewer')
  await knex.schema.dropTable('book_rater')
  await knex.schema.dropTable('book_liker')
  await knex.schema.dropTable('book_comment_liker')
  await knex.schema.dropTable('book_comment')
  await knex.schema.dropTable('bookmark')
  await knex.schema.dropTable('book')
}
