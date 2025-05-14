import * as helper from './helper.js'

export async function seed(knex) {
  const books = []
  const fandoms = []
  const genres = []
  const tags = []
  const comments = []
  let commentId = 0
  const likes = []
  const rates = []
  const views = []
  const chapters = []

  for (let id = 1; id <= helper.BOOKS_COUNT; id++) {
    const chaptersCount = helper.random(0, 30)
    const publicChaptersCount = helper.random(0, chaptersCount)
    const translatorId = helper.randomUserId()
    books.push({
      id,
      created_by: helper.randomUserId(),
      translator_id: translatorId,
      author_id: helper.randomAuthorId(),
      name: `Книга ${id}`,
      alt_name: `Title ${id} name`,
      description: helper.randomContent(`Описание книги ${id} `, 30),
      year: helper.random(1900, 2023),
      type: ['original', 'translation', 'orig_fanfic', 'trans_fanfic'][helper.random(0, 3)],
      status: ['discarded', 'done', 'frozen', 'progress'][helper.random(0, 3)],
      age_rate: ['0', '16', '18'][helper.random(0, 2)],
      source_lang: ['Японский', 'Китайский', 'Корейский', 'Английский', 'Русский'][helper.random(0, 1)],
      source_status: ['discarded', 'done', 'frozen', 'progress'][helper.random(0, 3)],
      rate: 0,
      chapters_count: chaptersCount,
    })

    const fandomsCount = helper.random(0, 8)
    for (let i = 0; i < fandomsCount; i++) {
      fandoms.push({book_id: id, fandom_id: helper.randomFandomId()})
    }

    const genresCount = helper.random(0, 8)
    for (let i = 0; i < genresCount; i++) {
      genres.push({book_id: id, genre_id: helper.randomGenreId()})
    }

    const tagsCount = helper.random(0, 8)
    for (let i = 0; i < tagsCount; i++) {
      tags.push({book_id: id, tag_id: helper.randomTagId()})
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

    const likesCount = helper.random(0, helper.USERS_COUNT)
    for (let i = 0; i < likesCount; i++) {
      likes.push({book_id: id, liker_id: helper.randomUserId()})
    }

    const ratesCount = helper.random(0, helper.USERS_COUNT)
    for (let i = 0; i < ratesCount; i++) {
      rates.push({book_id: id, rater_id: helper.randomUserId(), rate: helper.random(1, 5)})
    }

    const viewsCount = helper.random(0, helper.USERS_COUNT)
    for (let i = 0; i < viewsCount; i++) {
      views.push({book_id: id, viewer_id: helper.randomUserId()})
    }

    for (let i = 0; i < chaptersCount; i++) {
      const paragraphsCount = helper.random(0, 10)
      const paragraphs = []
      for (let j = 0; j < paragraphsCount; j++) {
        paragraphs.push(helper.randomContent(`Параграф ${j} главы ${i + 1} книги ${id}`, 20))
      }

      const is_public = i + 1 <= publicChaptersCount

      chapters.push({
        created_by: translatorId,
        book_id: id,
        number: i + 1,
        status: ['discarded', 'done', 'frozen', 'progress'][helper.random(0, 3)],
        is_public,
        price: is_public ? null : helper.random(1, 999),
        name: helper.random(0, 1) ? `Название главы ${i + 1}` : null,
        content: '<p>' + paragraphs.join('</p><p>') + '</p>',
      })
    }
  }

  await knex('book').insert(books).onConflict().ignore()
  await knex('book_tag').insert(tags).onConflict().ignore()
  await knex('book_fandom').insert(fandoms).onConflict().ignore()
  await knex('book_genre').insert(genres).onConflict().ignore()
  await knex('book_comment').insert(comments).onConflict().ignore()
  await knex('book_liker').insert(likes).onConflict().ignore()
  await knex('book_rater').insert(rates).onConflict().ignore()
  await knex('book_viewer').insert(views).onConflict().ignore()
  await knex('chapter').insert(chapters).onConflict().ignore()

  await knex('book').update({
    likers_count: knex('book_liker').where('book_id', knex.raw('id')).count(),
    rate: knex('book_rater').where('book_id', knex.raw('id')).select(knex.raw('coalesce(sum(rate) / count(*), 0)')),
    viewers_count: knex('book_viewer').where('book_id', knex.raw('id')).count(),
  })
}

function randomComment(id, bookId, parentId) {
  return {
    id,
    parent_id: parentId,
    book_id: bookId,
    created_by: helper.randomUserId(),
    content: helper.randomContent(`Комментарий ${id} к книге ${bookId}`, 10),
  }
}
