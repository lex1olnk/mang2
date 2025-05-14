import * as helper from './helper.js'

export async function seed(knex) {
  const fandoms = []
  for (let id = 1; id <= helper.FANDOMS_COUNT; id++) {
    fandoms.push({id, name: `Фандом ${id}`})
  }

  await knex('fandom').insert(fandoms).onConflict().ignore()

  const genres = []
  for (let id = 1; id <= helper.GENRES_COUNT; id++) {
    genres.push({id, name: `Жанр ${id}`})
  }

  await knex('genre').insert(genres).onConflict().ignore()

  const bookTags = []
  for (let id = 1; id <= helper.TAGS_COUNT; id++) {
    bookTags.push({id, name: `Тег ${id}`})
  }

  await knex('tag').insert(bookTags).onConflict().ignore()
}
