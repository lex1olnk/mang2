import * as helper from './helper.js'

export async function seed(knex) {
  const books = []
  const tags = []
  const genres = []
  const comments = []
  let commentId = 0
  const views = []
  const chapters = []

  for (let id = 1; id <= helper.BOOKS_COUNT; id++) {
    books.push({
      id,
      user_id: helper.randomUserId(),
      author_id: helper.randomAuthorId(),
      name: `Книга ${id}`,
      description: helper.randomContent(`Описание книги ${id} `, 30),
      year: helper.random(1900, 2023),
      status: 'in_progress',
    })

    const tagsCount = helper.random(0, 10)
    for (let i = 0; i < tagsCount; i++) {
      tags.push({book_id: id, book_tag_id: helper.randomBookTagId()})
    }

    const genresCount = helper.random(0, 10)
    for (let i = 0; i < genresCount; i++) {
      genres.push({book_id: id, genre_id: helper.randomGenreId()})
    }

    const commentsCount = helper.random(0, 30)
    for (let i = 0; i < commentsCount; i++) {
      commentId++
      comments.push(randomComment(commentId, id))

      const subcommentsCount = helper.random(0, 5)
      const parentId = commentId
      for (let j = 0; j < subcommentsCount; j++) {
        commentId++
        comments.push(randomComment(commentId, id, parentId))
      }
    }

    const viewsCount = helper.random(0, helper.USERS_COUNT)
    for (let i = 0; i < viewsCount; i++) {
      views.push({book_id: id, user_id: helper.randomUserId()})
    }

    const chaptersCount = helper.random(0, 100)
    for (let i = 0; i < chaptersCount; i++) {
      chapters.push({
        user_id: helper.randomUserId(),
        book_id: id,
        content: helper.randomContent(`Содержимое главы ${i + 1} книги ${id}`, 50),
      })
    }
  }

  await knex('book').insert(books).onConflict().ignore()
  await knex('book_pivot_book_tag').insert(tags).onConflict().ignore()
  await knex('book_pivot_genre').insert(genres).onConflict().ignore()
  await knex('book_comment').insert(comments).onConflict().ignore()
  await knex('book_view').insert(views).onConflict().ignore()
  await knex('chapter').insert(chapters).onConflict().ignore()
}

function randomComment(id, bookId, parentId) {
  return {
    id,
    parent_id: parentId,
    book_id: bookId,
    user_id: helper.randomUserId(),
    content: helper.randomContent(`Комментарий к книге ${id}`, 10),
  }
}
