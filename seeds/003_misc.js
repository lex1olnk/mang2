import * as helper from './helper.js'

export async function seed(knex) {
  const faq = []
  for (let id = 1; id <= helper.FAQ_COUNT; id++) {
    faq.push({
      id,
      number: id,
      name: `Вопрос ${id}`,
      content: helper.randomContent(`Ответ на вопрос ${id}.`, 20)
    })
  }

  await knex('faq').insert(faq).onConflict().ignore()

  const news = []
  for (let id = 1; id <= helper.NEWS_COUNT; id++) {
    news.push({
      id,
      created_at: helper.randomDate('2000-01-01', '2024-06-01'),
      created_by: helper.randomUserId(),
      name: `Новость ${id}`,
      content: helper.randomContent(`Текст новости ${id}.`, 50)
    })
  }

  await knex('news').insert(news).onConflict().ignore()
}
