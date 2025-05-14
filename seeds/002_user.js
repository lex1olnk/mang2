import * as helper from './helper.js'
import security from '../security.js'

export async function seed(knex) {
  const admins = []
  for (let id = 1; id <= helper.ADMINS_COUNT; id++) {
    admins.push({
      id,
      email: `admin${id}@example.com`,
      password: security.getPasswordHash('123456'),
      name: `Админ ${id}`,
      role: 'admin',
    })
  }
  await knex('user').insert(admins).onConflict().ignore()

  const users = []
  for (let id = helper.ADMINS_COUNT + 1; id <= helper.USERS_COUNT; id++) {
    users.push({
      id,
      email: `user${id}@example.com`,
      password: security.getPasswordHash('123456'),
      name: `Юзер ${id}`,
      role: '',
    })
  }

  await knex('user').insert(users).onConflict().ignore()
}
