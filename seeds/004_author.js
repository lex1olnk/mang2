import * as helper from './helper.js'

export async function seed(knex) {
  const authors = []
  for (let id = 1; id <= helper.AUTHORS_COUNT; id++) {
    authors.push({
      id,
      created_by: helper.randomUserId(),
      name: `Автор ${id}`,
      birth_date: helper.randomDate('1900-01-01', '2000-01-01').toISOString().substring(0, 10),
    })
  }

  await knex('author').insert(authors).onConflict().ignore()
}
