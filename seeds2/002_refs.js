import * as helper from './helper.js'

export async function seed(knex) {
  const authors = []
  for (let id = 1; id <= helper.AUTHORS_COUNT; id++) {
    authors.push({id, name: `Автор ${id}`})
  }

  await knex('author').insert(authors).onConflict().ignore()

  const genres = []
  for (let id = 1; id <= helper.GENRES_COUNT; id++) {
    genres.push({id, name: `Жанр ${id}`})
  }

  await knex('genre').insert(genres).onConflict().ignore()

  const bookTags = []
  for (let id = 1; id <= helper.BOOK_TAGS_COUNT; id++) {
    bookTags.push({id, name: `Тег ${id}`})
  }

  await knex('book_tag').insert(bookTags).onConflict().ignore()
}
