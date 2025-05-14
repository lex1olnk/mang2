import * as helper from './helper.js'

export async function seed(knex) {
  const teams = []
  const comments = []
  let commentId = 0
  const subscribers = []
  const teammates = []

  for (let id = 1; id <= helper.TEAMS_COUNT; id++) {
    teams.push({
      id,
      created_by: helper.randomUserId(),
      name: `Команда ${id}`,
      description: helper.randomContent(`Описание комманды ${id}`, 20)
    })

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

    const subscribersCount = helper.random(0, 30)
    for (let i = 0; i < subscribersCount; i++) {
      subscribers.push({team_id: id, subscriber_id: helper.randomUserId()})
    }

    const teammatesCount = helper.random(0, 10)
    for (let i = 0; i < teammatesCount; i++) {
      teammates.push({team_id: id, user_id: helper.randomUserId()})
    }
  }

  await knex('team').insert(teams).onConflict().ignore()
  await knex('team_comment').insert(comments).onConflict().ignore()
  await knex('team_subscriber').insert(subscribers).onConflict().ignore()
  await knex('team_teammate').insert(teammates).onConflict().ignore()
}

function randomComment(id, teamId, parentId) {
  return {
    id,
    parent_id: parentId,
    team_id: teamId,
    created_by: helper.randomUserId(),
    content: helper.randomContent(`Коммент ${id} к команде ${teamId}`, 5)
  }
}
